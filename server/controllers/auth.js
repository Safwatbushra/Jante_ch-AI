/**
 * Authentication Controller
 * Handles user registration, login, logout, and profile management
 * Uses JWT tokens and bcrypt for secure authentication
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

class AuthenticationService {
    constructor() {
        // Database connection properties
        this.mongoClient = null;
        this.database = null;
        this.usersCollection = null;
        this.sessionsCollection = null;
        
        // JWT configuration
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        this.jwtExpiresIn = '7d';
        this.bcryptSaltRounds = 12;
    }

    /**
     * Initialize database connection and create indexes
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
            const databaseName = process.env.DB_NAME || 'jante-chai';

            console.log('[INFO] Connecting to MongoDB...');
            console.log('[INFO] Using database:', databaseName);
            
            this.mongoClient = new MongoClient(mongoUri);
            await this.mongoClient.connect();
            
            this.database = this.mongoClient.db(databaseName);
            this.usersCollection = this.database.collection('users');
            this.sessionsCollection = this.database.collection('sessions');

            // Create database indexes for performance
            await this.createDatabaseIndexes();
            
            console.log('[INFO] Authentication service initialized successfully');
            return true;
        } catch (error) {
            console.error('[ERROR] Failed to initialize auth service:', error);
            throw error;
        }
    }

    /**
     * Create database indexes for better query performance
     */
    async createDatabaseIndexes() {
        try {
            // Create unique index on email field
            await this.usersCollection.createIndex({ email: 1 }, { unique: true });
            
            // Create index on sessions for automatic cleanup
            await this.sessionsCollection.createIndex({ 
                createdAt: 1 
            }, { 
                expireAfterSeconds: 604800 // 7 days
            });
            
            console.log('[INFO] Database indexes created successfully');
        } catch (error) {
            if (error.code !== 11000) { // Ignore duplicate index errors
                console.error('[ERROR] Error creating indexes:', error);
            }
        }
    }

    /**
     * Register a new user account
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @param {string} fullName - User's full name
     * @param {string} mobile - User's mobile number (optional)
     * @returns {Promise<Object>} Registration result
     */
    async registerUser(email, password, fullName, mobile = null) {
        try {
            // Validate required input fields
            if (!email || !password || !fullName) {
                return {
                    success: false,
                    error: 'Email, password, and full name are required'
                };
            }

            // Validate email format using regex
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
            const existingUser = await this.usersCollection.findOne({ 
                email: email.toLowerCase() 
            });
            if (existingUser) {
                return {
                    success: false,
                    error: 'An account with this email already exists'
                };
            }

            // Hash password using bcrypt
            const hashedPassword = await bcrypt.hash(password, this.bcryptSaltRounds);

            // Create new user document
            const newUser = {
                email: email.toLowerCase(),
                password: hashedPassword,
                fullName: fullName.trim(),
                mobile: mobile ? mobile.trim() : null,
                isEmailVerified: true, // Auto-verify for demo purposes
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

            // Insert user into database
            const insertResult = await this.usersCollection.insertOne(newUser);
            
            if (!insertResult.insertedId) {
                return {
                    success: false,
                    error: 'Failed to create user account'
                };
            }

            // Retrieve created user (excluding password)
            const createdUser = await this.usersCollection.findOne(
                { _id: insertResult.insertedId },
                { projection: { password: 0 } }
            );

            // Generate JWT token
            const authToken = this.generateJwtToken(createdUser);

            // Create user session
            await this.createUserSession(createdUser._id, authToken);

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
                token: authToken,
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

    /**
     * Authenticate user login
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @param {boolean} rememberMe - Whether to extend session duration
     * @returns {Promise<Object>} Login result
     */
    async authenticateUser(email, password, rememberMe = false) {
        try {
            // Validate input fields
            if (!email || !password) {
                return {
                    success: false,
                    error: 'Email and password are required'
                };
            }

            // Find user by email address
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

            // Verify password using bcrypt
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }

            // Update last login timestamp
            await this.usersCollection.updateOne(
                { _id: user._id },
                { 
                    $set: { 
                        lastLoginAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            );

            // Generate JWT token with appropriate expiration
            const tokenExpiration = rememberMe ? '30d' : this.jwtExpiresIn;
            const authToken = this.generateJwtToken(user, tokenExpiration);

            // Create user session
            await this.createUserSession(user._id, authToken, rememberMe);

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
                token: authToken,
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

    /**
     * Verify JWT token and return user information
     * @param {string} token - JWT token to verify
     * @returns {Promise<Object>} Token verification result
     */
    async verifyAuthToken(token) {
        try {
            if (!token) {
                return { success: false, error: 'No token provided' };
            }

            // Remove 'Bearer ' prefix if present
            const cleanToken = token.replace('Bearer ', '');
            
            // Verify JWT signature and expiration
            const decodedToken = jwt.verify(cleanToken, this.jwtSecret);
            
            // Retrieve user from database
            const user = await this.usersCollection.findOne(
                { _id: new ObjectId(decodedToken.userId) },
                { projection: { password: 0 } }
            );

            if (!user) {
                return { success: false, error: 'User not found' };
            }

            if (!user.isActive) {
                return { success: false, error: 'Account deactivated' };
            }

            // Verify session exists in database
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

    /**
     * Logout user and invalidate session
     * @param {string} token - JWT token to invalidate
     * @returns {Promise<Object>} Logout result
     */
    async logoutUser(token) {
        try {
            if (!token) {
                return { success: false, error: 'No token provided' };
            }

            const cleanToken = token.replace('Bearer ', '');

            // Remove session from database
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

    /**
     * Update user profile information
     * @param {string} userId - User's unique identifier
     * @param {Object} updates - Profile updates to apply
     * @returns {Promise<Object>} Update result
     */
    async updateUserProfile(userId, updates) {
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

            const updateResult = await this.usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: sanitizedUpdates }
            );

            if (updateResult.matchedCount === 0) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            // Retrieve updated user information
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

    /**
     * Change user password
     * @param {string} userId - User's unique identifier
     * @param {string} currentPassword - Current password for verification
     * @param {string} newPassword - New password to set
     * @returns {Promise<Object>} Password change result
     */
    async changeUserPassword(userId, currentPassword, newPassword) {
        try {
            // Retrieve user with password for verification
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

            // Validate new password strength
            if (newPassword.length < 8) {
                return {
                    success: false,
                    error: 'New password must be at least 8 characters long'
                };
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, this.bcryptSaltRounds);

            // Update password in database
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
            await this.sessionsCollection.deleteMany({ 
                userId: new ObjectId(userId) 
            });

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

    /**
     * Generate JWT token for user
     * @param {Object} user - User object
     * @param {string} expiresIn - Token expiration time
     * @returns {string} JWT token
     */
    generateJwtToken(user, expiresIn = this.jwtExpiresIn) {
        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, this.jwtSecret, { expiresIn });
    }

    /**
     * Create user session in database
     * @param {ObjectId} userId - User's unique identifier
     * @param {string} token - JWT token
     * @param {boolean} rememberMe - Whether to extend session duration
     */
    async createUserSession(userId, token, rememberMe = false) {
        const session = {
            userId: new ObjectId(userId),
            token: token,
            rememberMe: rememberMe,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000))
        };

        await this.sessionsCollection.insertOne(session);
    }

    /**
     * Clean up expired sessions from database
     */
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

    /**
     * Close database connection
     */
    async closeConnection() {
        if (this.mongoClient) {
            await this.mongoClient.close();
            console.log('📤 Database connection closed');
        }
    }
}

export default AuthenticationService;
