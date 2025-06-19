const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('./')); // Serve static files from the current directory

// MongoDB Connection Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net/jante-chai?retryWrites=true&w=majority';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

let db;

// Connect to MongoDB
async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db('jante-chai');
        console.log('✅ Connected to MongoDB Atlas');
        
        // Create indexes for better performance
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ mobile: 1 }, { unique: true, sparse: true });
        
        console.log('✅ Database indexes created');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email, 
            fullName: user.fullName 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Routes

// Test route
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'MongoDB Auth Server is running!' });
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName, mobile } = req.body;

        // Validation
        if (!email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and full name are required'
            });
        }

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = {
            email,
            password: hashedPassword,
            fullName,
            mobile: mobile || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            isVerified: false, // Email verification status
            loginAttempts: 0,
            lastLogin: null
        };

        const result = await db.collection('users').insertOne(newUser);
        
        // Generate token
        const token = generateToken({ _id: result.insertedId, email, fullName });

        // Return user data without password
        const user = {
            id: result.insertedId,
            email,
            fullName,
            mobile,
            createdAt: newUser.createdAt,
            isVerified: newUser.isVerified
        };

        console.log('✅ User registered successfully:', email);

        res.status(201).json({
            success: true,
            data: {
                user,
                token
            },
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        
        if (error.code === 11000) {
            // Duplicate key error
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                error: `User with this ${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error during registration'
        });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            // Increment login attempts
            await db.collection('users').updateOne(
                { _id: user._id },
                { 
                    $inc: { loginAttempts: 1 },
                    $set: { updatedAt: new Date() }
                }
            );

            return res.status(400).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Reset login attempts and update last login
        await db.collection('users').updateOne(
            { _id: user._id },
            { 
                $set: { 
                    loginAttempts: 0,
                    lastLogin: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        // Generate token
        const token = generateToken(user);

        // Return user data without password
        const userData = {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            mobile: user.mobile,
            createdAt: user.createdAt,
            lastLogin: new Date(),
            isVerified: user.isVerified
        };

        console.log('✅ User logged in successfully:', email);

        res.json({
            success: true,
            data: {
                user: userData,
                token
            },
            message: 'Login successful'
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during login'
        });
    }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(req.user.id) },
            { projection: { password: 0, loginAttempts: 0 } }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                mobile: user.mobile,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLogin: user.lastLogin,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('❌ Profile fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { fullName, mobile } = req.body;
        const updateData = {
            updatedAt: new Date()
        };

        if (fullName) updateData.fullName = fullName;
        if (mobile !== undefined) updateData.mobile = mobile;

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(req.user.id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('❌ Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        // Get user
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await db.collection('users').updateOne(
            { _id: new ObjectId(req.user.id) },
            { 
                $set: { 
                    password: hashedNewPassword,
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('❌ Password change error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Logout (client-side token removal, but we can log it)
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        // Update last activity
        await db.collection('users').updateOne(
            { _id: new ObjectId(req.user.id) },
            { $set: { updatedAt: new Date() } }
        );

        console.log('✅ User logged out:', req.user.email);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'homepage.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'user.html'));
});

// Start server
const PORT = process.env.PORT || 3000;

connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 MongoDB Atlas connected`);
        console.log(`🔐 JWT Secret configured`);
        console.log(`📱 Frontend served from current directory`);
    });
}).catch((error) => {
    console.error('❌ Failed to start server:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down gracefully...');
    process.exit(0);
});
