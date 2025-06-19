import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { mongodb } from './backend/mongodb.js';
import { ChatBot } from './backend/chatbot.js';
import { getUserChatSessions } from './backend/database.js';

// Load environment variables
dotenv.config({ path: './backend/.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await mongodb.connect();
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
}
};

// Routes

// Test route
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'MongoDB Auth Server is running!' });
});

// Authentication routes
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

        // Register user
        const result = await mongodb.signUp(email, password, fullName, mobile);
        
        if (result.error) {
            return res.status(400).json({
                success: false,
                error: result.error.message
            });
        }

        console.log('✅ User registered successfully:', email);

        res.status(201).json({
            success: true,
            data: result.data,
            message: 'User registered successfully'
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
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Sign in user
        const result = await mongodb.signIn(email, password);
        
        if (result.error) {
            return res.status(400).json({
                success: false,
                error: result.error.message
            });
        }

        console.log('✅ User logged in successfully:', email);

        res.json({
            success: true,
            data: result.data,
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

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const result = await mongodb.getCurrentUser(req.user.id);
        
        if (result.error) {
            return res.status(404).json({
                success: false,
                error: result.error.message
            });
        }

        res.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('❌ Profile fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
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

// Chat routes
app.get('/api/chat/sessions', authenticateToken, async (req, res) => {
    try {
        const result = await getUserChatSessions(req.user.id);
        
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

app.post('/api/chat/message', authenticateToken, async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        const chatBot = new ChatBot(req.user.id);
        
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

app.post('/api/chat/new-session', authenticateToken, async (req, res) => {
    try {
        const { title } = req.body;
        
        const chatBot = new ChatBot(req.user.id);
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

async function startServer() {
    try {
        // Connect to MongoDB first
        await mongodb.connect();
        
        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 MongoDB Atlas connected`);
            console.log(`🔐 JWT authentication enabled`);
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
