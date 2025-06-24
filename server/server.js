import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import AuthService from './controllers/auth.js';
import { ChatBot } from './services/chatbot.js';
import { getUserChatSessions } from './config/database.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize Auth Service
const authService = new AuthService();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root project directory (parent of server)
app.use(express.static(path.join(__dirname, '..')));

// Serve CSS files with correct MIME type
app.use('/styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, '../styles.css'));
});

// Serve assets with correct MIME types
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/pages', express.static(path.join(__dirname, '../pages')));

// Serve CSS files with correct paths and MIME type
app.use('/css', express.static(path.join(__dirname, '../css'), {
    setHeaders: function (res, path) {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Connect to Database and Initialize Auth Service
async function connectToDatabase() {
    try {
        await authService.initialize();
        console.log('✅ Connected to MongoDB Atlas');
        console.log('✅ Auth service initialized');
    } catch (error) {
        console.error('❌ Failed to initialize database/auth:', error.message);
        process.exit(1);
    }
}

// Routes

// Test route
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'MongoDB Auth Server is running!' });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName, mobile } = req.body;

        // Register user using new auth service
        const result = await authService.register(email, password, fullName, mobile);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }

        console.log('✅ User registered successfully:', email);

        res.status(201).json({
            success: true,
            user: result.user,
            token: result.token,
            message: result.message
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during registration'
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        // Sign in user using new auth service
        const result = await authService.login(email, password, rememberMe);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }

        console.log('✅ User logged in successfully:', email);

        res.json({
            success: true,
            user: result.user,
            token: result.token,
            message: result.message
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during login'
        });
    }
});

app.post('/api/auth/logout', async (req, res) => {
    try {
        const token = req.headers.authorization;
        
        const result = await authService.logout(token);
        
        res.json({
            success: result.success,
            message: result.message || result.error
        });

    } catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during logout'
        });
    }
});

app.get('/api/auth/profile', async (req, res) => {
    try {
        const token = req.headers.authorization;
        
        const result = await authService.verifyToken(token);
        
        if (!result.success) {
            return res.status(401).json({
                success: false,
                error: result.error
            });
        }

        res.json({
            success: true,
            user: result.user
        });

    } catch (error) {
        console.error('❌ Profile fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.put('/api/auth/profile', async (req, res) => {
    try {
        const token = req.headers.authorization;
        
        // Verify token first
        const authResult = await authService.verifyToken(token);
        if (!authResult.success) {
            return res.status(401).json({
                success: false,
                error: authResult.error
            });
        }

        const { fullName, mobile, preferences } = req.body;
        const updates = {};
        
        if (fullName !== undefined) updates.fullName = fullName;
        if (mobile !== undefined) updates.mobile = mobile;
        if (preferences !== undefined) updates.preferences = preferences;

        const result = await authService.updateProfile(authResult.user.id, updates);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }

        res.json({
            success: true,
            user: result.user,
            message: result.message
        });

    } catch (error) {
        console.error('❌ Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.post('/api/auth/change-password', async (req, res) => {
    try {
        const token = req.headers.authorization;
        
        // Verify token first
        const authResult = await authService.verifyToken(token);
        if (!authResult.success) {
            return res.status(401).json({
                success: false,
                error: authResult.error
            });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        const result = await authService.changePassword(authResult.user.id, currentPassword, newPassword);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }

        res.json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error('❌ Password change error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Chat routes
app.get('/api/chat/sessions', async (req, res) => {
    try {
        const token = req.headers.authorization;
        
        // Verify token first
        const authResult = await authService.verifyToken(token);
        if (!authResult.success) {
            return res.status(401).json({
                success: false,
                error: authResult.error
            });
        }

        const result = await getUserChatSessions(authResult.user.id);
        
        if (result.error) {
            return res.status(500).json({
                success: false,
                error: result.error.message
            });
        }

        res.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('❌ Get chat sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.post('/api/chat/message', async (req, res) => {
    try {
        const token = req.headers.authorization;
        
        // Verify token first
        const authResult = await authService.verifyToken(token);
        if (!authResult.success) {
            return res.status(401).json({
                success: false,
                error: authResult.error
            });
        }

        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        const chatBot = new ChatBot(authResult.user.id);
        
        let targetSessionId = sessionId;
        if (!targetSessionId) {
            // Create new session if none provided
            targetSessionId = await chatBot.startNewChat();
        }

        const response = await chatBot.sendMessage(message, targetSessionId);

        res.json({
            success: true,
            data: {
                response: response.response,
                sessionId: response.sessionId,
                usage: response.usage
            }
        });

    } catch (error) {
        console.error('❌ Chat message error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/chat/new-session', async (req, res) => {
    try {
        const token = req.headers.authorization;
        
        // Verify token first
        const authResult = await authService.verifyToken(token);
        if (!authResult.success) {
            return res.status(401).json({
                success: false,
                error: authResult.error
            });
        }

        const { title } = req.body;
        
        const chatBot = new ChatBot(authResult.user.id);
        const sessionId = await chatBot.startNewChat(title || 'New Chat');

        res.json({
            success: true,
            data: { sessionId }
        });

    } catch (error) {
        console.error('❌ New chat session error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/homepage.html'));
});

app.get('/homepage', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/homepage.html'));
});

app.get('/homepage.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/homepage.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/auth.html'));
});

app.get('/auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/auth.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/user.html'));
});

app.get('/user.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/user.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/user.html'));
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
    // If the request is for an API endpoint, return 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For all other routes, serve the homepage
    res.sendFile(path.join(__dirname, '../pages/homepage.html'));
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Initialize Auth Service and MongoDB
        await connectToDatabase();
        
        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 MongoDB Atlas connected`);
            console.log(`🔐 Authentication system ready`);
            console.log(`🤖 Groq AI chatbot ready`);
            console.log(`📱 Frontend served from current directory`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();
