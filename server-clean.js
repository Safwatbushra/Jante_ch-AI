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
const PORT = process.env.PORT || 3000;

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

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'MongoDB Auth Server is running!',
        mongodb: mongodb.isConnected ? 'Connected' : 'Disconnected'
    });
});

// Authentication routes
app.post('/api/auth/signup', async (req, res) => {
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
            user: result.data.user,
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Sign in user
        const result = await mongodb.signIn(email, password);
        
        if (result.error) {
            return res.status(401).json({
                success: false,
                error: result.error.message
            });
        }

        console.log('✅ User signed in successfully:', email);

        res.json({
            success: true,
            user: result.data.user,
            message: 'User signed in successfully'
        });

    } catch (error) {
        console.error('Sign in error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Chat routes
app.post('/api/chat/send', async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({
                success: false,
                error: 'User ID and message are required'
            });
        }

        // Initialize ChatBot
        const chatBot = new ChatBot();
        
        // Send message to AI
        const response = await chatBot.sendMessage(message, userId);

        res.json({
            success: true,
            response: response,
            message: 'Message sent successfully'
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message'
        });
    }
});

// Get chat history
app.get('/api/chat/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const sessions = await getUserChatSessions(userId);

        res.json({
            success: true,
            sessions: sessions,
            message: 'Chat history retrieved successfully'
        });

    } catch (error) {
        console.error('Chat history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve chat history'
        });
    }
});

// Static file routes
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
async function startServer() {
    try {
        await connectToDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📖 Visit http://localhost:${PORT} to see your app`);
            console.log(`🔐 Auth page: http://localhost:${PORT}/auth`);
            console.log(`👤 User page: http://localhost:${PORT}/user`);
            console.log(`🤖 MongoDB Atlas connected successfully!`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;
