// Backend Authentication System
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

class AuthService {
    constructor() {
        this.client = null;
        this.db = null;
        this.usersCollection = null;
        this.sessionsCollection = null;
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        this.JWT_EXPIRES_IN = '7d';
        this.SALT_ROUNDS = 12;
    }    async initialize() {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
            const dbName = process.env.DB_NAME || 'jante-chai'; // Use same database as old system

            console.log('🔄 Connecting to MongoDB...');
            console.log('📊 Using database:', dbName);
            this.client = new MongoClient(mongoUri);
            await this.client.connect();
            
            this.db = this.client.db(dbName);
            this.usersCollection = this.db.collection('users');
            this.sessionsCollection = this.db.collection('sessions');

            // Create indexes for better performance
            await this.createIndexes();
            
            console.log('✅ Auth service initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize auth service:', error);
            throw error;
        }
    }

    async createIndexes() {
        try {
            // Create unique index on email
            await this.usersCollection.createIndex({ email: 1 }, { unique: true });
            
            // Note: Mobile index is created in mongodb.js config file
            // to avoid conflicts with existing unique index
            
            // Create index on sessions for cleanup
            await this.sessionsCollection.createIndex({ 
                createdAt: 1 
            }, { 
                expireAfterSeconds: 604800 // 7 days
            });
            
            console.log('✅ Database indexes created');
        } catch (error) {
            if (error.code !== 11000) { // Ignore duplicate index errors
                console.error('❌ Error creating indexes:', error);
            }
        }
    }

    // User registration
    async register(email, password, fullName, mobile = null) {
        try {
            // Validate input
            if (!email || !password || !fullName) {
                return {
                    success: false,
                    error: 'Email, password, and full name are required'
                };
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return {
                    success: false,
                    error: 'Invalid email format'
                };
            }

            // Validate password strength
            if (password.length < 8) {
                return {
                    success: false,
                    error: 'Password must be at least 8 characters long'
                };
            }

            // Check if user already exists
            const existingUser = await this.usersCollection.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return {
                    success: false,
                    error: 'An account with this email already exists'
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

            // Create user object
            const newUser = {
                email: email.toLowerCase(),
                password: hashedPassword,
                fullName: fullName.trim(),
                mobile: mobile ? mobile.trim() : null,
                isEmailVerified: true, // For now, auto-verify
                isActive: true,
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: null,
                profilePicture: null,
                preferences: {
                    language: 'en',
                    notifications: true,
                    darkMode: false
                }
            };

            // Insert user
            const result = await this.usersCollection.insertOne(newUser);
            
            if (!result.insertedId) {
                return {
                    success: false,
                    error: 'Failed to create user account'
                };
            }

            // Get the created user (without password)
            const createdUser = await this.usersCollection.findOne(
                { _id: result.insertedId },
                { projection: { password: 0 } }
            );

            // Generate JWT token
            const token = this.generateToken(createdUser);

            // Create session
            await this.createSession(createdUser._id, token);

            return {
                success: true,
                user: {
                    id: createdUser._id,
                    email: createdUser.email,
                    fullName: createdUser.fullName,
                    mobile: createdUser.mobile,
                    role: createdUser.role,
                    isEmailVerified: createdUser.isEmailVerified,
                    preferences: createdUser.preferences,
                    createdAt: createdUser.createdAt
                },
                token: token,
                message: 'Account created successfully'
            };

        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Registration failed. Please try again.'
            };
        }
    }

    // User login
    async login(email, password, rememberMe = false) {
        try {
            // Validate input
            if (!email || !password) {
                return {
                    success: false,
                    error: 'Email and password are required'
                };
            }

            // Find user by email
            const user = await this.usersCollection.findOne({ 
                email: email.toLowerCase() 
            });

            if (!user) {
                return {
                    success: false,
                    error: 'No account found with this email address'
                };
            }

            // Check if account is active
            if (!user.isActive) {
                return {
                    success: false,
                    error: 'Your account has been deactivated. Please contact support.'
                };
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }

            // Update last login
            await this.usersCollection.updateOne(
                { _id: user._id },
                { 
                    $set: { 
                        lastLoginAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            );

            // Generate JWT token
            const expiresIn = rememberMe ? '30d' : this.JWT_EXPIRES_IN;
            const token = this.generateToken(user, expiresIn);

            // Create session
            await this.createSession(user._id, token, rememberMe);

            return {
                success: true,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    mobile: user.mobile,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    preferences: user.preferences,
                    lastLoginAt: user.lastLoginAt
                },
                token: token,
                message: 'Login successful'
            };

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Login failed. Please try again.'
            };
        }
    }

    // Verify token and get user
    async verifyToken(token) {
        try {
            if (!token) {
                return { success: false, error: 'No token provided' };
            }

            // Remove 'Bearer ' prefix if present
            const cleanToken = token.replace('Bearer ', '');

            // Verify JWT
            const decoded = jwt.verify(cleanToken, this.JWT_SECRET);
            
            // Get user from database
            const user = await this.usersCollection.findOne(
                { _id: new ObjectId(decoded.userId) },
                { projection: { password: 0 } }
            );

            if (!user) {
                return { success: false, error: 'User not found' };
            }

            if (!user.isActive) {
                return { success: false, error: 'Account deactivated' };
            }

            // Check if session exists
            const session = await this.sessionsCollection.findOne({
                userId: user._id,
                token: cleanToken
            });

            if (!session) {
                return { success: false, error: 'Invalid session' };
            }

            return {
                success: true,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    mobile: user.mobile,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    preferences: user.preferences,
                    lastLoginAt: user.lastLoginAt
                }
            };

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return { success: false, error: 'Invalid token' };
            } else if (error.name === 'TokenExpiredError') {
                return { success: false, error: 'Token expired' };
            }
            
            console.error('Token verification error:', error);
            return { success: false, error: 'Token verification failed' };
        }
    }

    // Logout user
    async logout(token) {
        try {
            if (!token) {
                return { success: false, error: 'No token provided' };
            }

            const cleanToken = token.replace('Bearer ', '');

            // Remove session
            await this.sessionsCollection.deleteOne({ token: cleanToken });

            return {
                success: true,
                message: 'Logged out successfully'
            };

        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                error: 'Logout failed'
            };
        }
    }

    // Update user profile
    async updateProfile(userId, updates) {
        try {
            const allowedUpdates = ['fullName', 'mobile', 'preferences'];
            const sanitizedUpdates = {};

            // Only allow specific fields to be updated
            for (const key of allowedUpdates) {
                if (updates[key] !== undefined) {
                    sanitizedUpdates[key] = updates[key];
                }
            }

            if (Object.keys(sanitizedUpdates).length === 0) {
                return {
                    success: false,
                    error: 'No valid updates provided'
                };
            }

            sanitizedUpdates.updatedAt = new Date();

            const result = await this.usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: sanitizedUpdates }
            );

            if (result.matchedCount === 0) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            // Get updated user
            const updatedUser = await this.usersCollection.findOne(
                { _id: new ObjectId(userId) },
                { projection: { password: 0 } }
            );

            return {
                success: true,
                user: {
                    id: updatedUser._id,
                    email: updatedUser.email,
                    fullName: updatedUser.fullName,
                    mobile: updatedUser.mobile,
                    role: updatedUser.role,
                    isEmailVerified: updatedUser.isEmailVerified,
                    preferences: updatedUser.preferences,
                    updatedAt: updatedUser.updatedAt
                },
                message: 'Profile updated successfully'
            };

        } catch (error) {
            console.error('Profile update error:', error);
            return {
                success: false,
                error: 'Profile update failed'
            };
        }
    }

    // Change password
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Get user with password
            const user = await this.usersCollection.findOne({ 
                _id: new ObjectId(userId) 
            });

            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return {
                    success: false,
                    error: 'Current password is incorrect'
                };
            }

            // Validate new password
            if (newPassword.length < 8) {
                return {
                    success: false,
                    error: 'New password must be at least 8 characters long'
                };
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

            // Update password
            await this.usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { 
                    $set: { 
                        password: hashedNewPassword,
                        updatedAt: new Date()
                    }
                }
            );

            // Invalidate all existing sessions for this user
            await this.sessionsCollection.deleteMany({ userId: new ObjectId(userId) });

            return {
                success: true,
                message: 'Password changed successfully. Please log in again.'
            };

        } catch (error) {
            console.error('Password change error:', error);
            return {
                success: false,
                error: 'Password change failed'
            };
        }
    }

    // Helper methods
    generateToken(user, expiresIn = this.JWT_EXPIRES_IN) {
        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, this.JWT_SECRET, { expiresIn });
    }

    async createSession(userId, token, rememberMe = false) {
        const session = {
            userId: new ObjectId(userId),
            token: token,
            rememberMe: rememberMe,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000))
        };

        await this.sessionsCollection.insertOne(session);
    }

    // Cleanup expired sessions
    async cleanupExpiredSessions() {
        try {
            const result = await this.sessionsCollection.deleteMany({
                expiresAt: { $lt: new Date() }
            });
            
            if (result.deletedCount > 0) {
                console.log(`🧹 Cleaned up ${result.deletedCount} expired sessions`);
            }
        } catch (error) {
            console.error('❌ Error cleaning up sessions:', error);
        }
    }

    // Close database connection
    async close() {
        if (this.client) {
            await this.client.close();
            console.log('📤 Database connection closed');
        }
    }
}

export default AuthService;
