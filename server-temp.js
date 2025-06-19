// server-temp.js - Temporary server that runs without MongoDB (for testing frontend)
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Temporary auth endpoints (mock responses)
app.post('/api/auth/signup', (req, res) => {
    console.log('📝 Signup attempt:', req.body.email);
    res.status(500).json({
        success: false,
        error: 'MongoDB authentication failed. Please check your connection string and try again.'
    });
});

app.post('/api/auth/signin', (req, res) => {
    console.log('🔐 Signin attempt:', req.body.email);
    res.status(500).json({
        success: false,
        error: 'MongoDB authentication failed. Please check your connection string and try again.'
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running! But MongoDB connection failed.',
        note: 'Please fix your MongoDB Atlas credentials to enable authentication.'
    });
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

app.listen(PORT, () => {
    console.log(`🚀 Temporary server running on http://localhost:${PORT}`);
    console.log(`📖 Visit http://localhost:${PORT} to see your app`);
    console.log(`🔐 Auth page: http://localhost:${PORT}/auth`);
    console.log(`⚠️  MongoDB authentication is failing - fix your credentials in backend/.env`);
    console.log(`📋 See MONGODB_AUTH_FIX.md for troubleshooting steps`);
});

export default app;
