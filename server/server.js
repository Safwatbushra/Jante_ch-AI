import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import AuthenticationService from './controllers/auth.js';
import { ChatBot } from './services/chatbot.js';
import { getUserChatSessions } from './config/database.js';
import { mongodb } from './config/mongodb.js';
import { getGroqAccountInfo } from './services/groq.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize Auth Service
const authService = new AuthenticationService();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
    credentials: true // Allow credentials for future use
}));
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
        console.log('[INFO] MongoDB Atlas connection established');
        console.log('[INFO] Authentication service initialized successfully');
        
        // Initialize ChatBot MongoDB connection
        await mongodb.connect();
        console.log('[INFO] ChatBot MongoDB connection established');
        
    } catch (error) {
        console.error('[ERROR] Failed to initialize database/auth:', error.message);
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
        const result = await authService.registerUser(email, password, fullName, mobile);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }

        console.log('[INFO] User registered successfully:', email);

        res.status(201).json({
            success: true,
            user: result.user,
            token: result.token,
            message: result.message
        });

    } catch (error) {
        console.error('[ERROR] Registration error:', error);
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
        const result = await authService.authenticateUser(email, password, rememberMe);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }

        console.log('[INFO] User logged in successfully:', email);

        res.json({
            success: true,
            user: result.user,
            token: result.token,
            message: result.message
        });

    } catch (error) {
        console.error('[ERROR] Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during login'
        });
    }
});

app.post('/api/auth/logout', async (req, res) => {
    try {
        const token = req.headers.authorization;
        
        const result = await authService.logoutUser(token);
        
        res.json({
            success: result.success,
            message: result.message || result.error
        });

    } catch (error) {
        console.error('[ERROR] Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during logout'
        });
    }
});

app.get('/api/auth/profile', async (req, res) => {
    try {
        const token = req.headers.authorization;
        
        const result = await authService.verifyAuthToken(token);
        
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
        console.error('[ERROR] Profile fetch error:', error);
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
        const authResult = await authService.verifyAuthToken(token);
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

        const result = await authService.updateUserProfile(authResult.user.id, updates);
        
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
        console.error('[ERROR] Profile update error:', error);
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
        const authResult = await authService.verifyAuthToken(token);
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
        console.error('[ERROR] Password change error:', error);
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
        const authResult = await authService.verifyAuthToken(token);
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
        console.error('[ERROR] Get chat sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.post('/api/chat/message', async (req, res) => {
    try {
        const token = req.headers.authorization;
        console.log('[DEBUG] Chat message - Received token:', token ? 'Token present' : 'No token');
        
        // Verify token first
        const authResult = await authService.verifyAuthToken(token);
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
        console.error('[ERROR] Chat message error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/chat/new-session', async (req, res) => {
    try {
        const token = req.headers.authorization;
        console.log('[DEBUG] New chat session - Received token:', token ? 'Token present' : 'No token');
        
        // Verify token first
        const authResult = await authService.verifyAuthToken(token);
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
        console.error('[ERROR] New chat session error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Groq account info route
app.get('/api/groq/account-info', async (req, res) => {
    try {
        const token = req.headers.authorization;
        
        // Verify token first
        const authResult = await authService.verifyAuthToken(token);
        if (!authResult.success) {
            return res.status(401).json({
                success: false,
                error: authResult.error
            });
        }

        const accountInfo = await getGroqAccountInfo();

        res.json({
            success: true,
            data: accountInfo
        });

    } catch (error) {
        console.error('[ERROR] Groq account info error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
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
        console.log('\n[INFO] Starting Jante CH-AI Server...');
        console.log('[INFO] Initializing services...\n');
        
        // Initialize Auth Service and MongoDB
        await connectToDatabase();
        
        // Start Express server with port conflict handling
        const server = app.listen(PORT, () => {
            const actualPort = server.address().port;
            console.log('\n' + '='.repeat(60));
            console.log('JANTE CH-AI SERVER STARTED SUCCESSFULLY');
            console.log('='.repeat(60));
            console.log(`Server URL: http://localhost:${actualPort}`);
            console.log(`Local Network: http://0.0.0.0:${actualPort}`);
            console.log(`Database: MongoDB Atlas (Connected)`);
            console.log(`Authentication: JWT-based system (Ready)`);
            console.log(`AI Service: Groq API (Ready)`);
            console.log(`Frontend: Static files served from root`);
            console.log(`Started at: ${new Date().toLocaleString()}`);
            console.log('='.repeat(60));
            console.log(`Quick Links:`);
            console.log(`  • Homepage: http://localhost:${actualPort}/`);
            console.log(`  • Authentication: http://localhost:${actualPort}/auth`);
            console.log(`  • User Dashboard: http://localhost:${actualPort}/user`);
            console.log(`  • API Test: http://localhost:${actualPort}/api/test`);
            console.log('='.repeat(60) + '\n');
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`[WARN] Port ${PORT} is in use, trying alternative ports...`);
                // Try alternative ports
                const alternativePorts = [3001, 3002, 3003, 3004, 3005];
                let portIndex = 0;
                
                const tryPort = () => {
                    if (portIndex >= alternativePorts.length) {
                        console.error('[ERROR] No available ports found. Please free up a port or specify a different port.');
                        process.exit(1);
                    }
                    
                    const testPort = alternativePorts[portIndex];
                    const testServer = app.listen(testPort, () => {
                        const actualPort = testServer.address().port;
                        console.log('\n' + '='.repeat(60));
                        console.log('JANTE CH-AI SERVER STARTED SUCCESSFULLY');
                        console.log('='.repeat(60));
                        console.log(`Server URL: http://localhost:${actualPort}`);
                        console.log(`Local Network: http://0.0.0.0:${actualPort}`);
                        console.log(`Database: MongoDB Atlas (Connected)`);
                        console.log(`Authentication: JWT-based system (Ready)`);
                        console.log(`AI Service: Groq API (Ready)`);
                        console.log(`Frontend: Static files served from root`);
                        console.log(`Started at: ${new Date().toLocaleString()}`);
                        console.log('='.repeat(60));
                        console.log(`Quick Links:`);
                        console.log(`  • Homepage: http://localhost:${actualPort}/`);
                        console.log(`  • Authentication: http://localhost:${actualPort}/auth`);
                        console.log(`  • User Dashboard: http://localhost:${actualPort}/user`);
                        console.log(`  • API Test: http://localhost:${actualPort}/api/test`);
                        console.log('='.repeat(60) + '\n');
                    }).on('error', (testErr) => {
                        if (testErr.code === 'EADDRINUSE') {
                            testServer.close();
                            portIndex++;
                            tryPort();
                        } else {
                            console.error('[ERROR] Server error:', testErr);
                            process.exit(1);
                        }
                    });
                };
                
                tryPort();
            } else {
                console.error('[ERROR] Server error:', err);
                process.exit(1);
            }
        });
        
    } catch (error) {
        console.error('[ERROR] Failed to start server:', error);
        process.exit(1);
    }
}

// Shutdown
process.on('SIGINT', () => {
    console.log('\n[INFO] Server shutting down...');
    process.exit(0);
});

// Start the server
startServer();