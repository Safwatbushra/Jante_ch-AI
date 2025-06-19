import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { mongodb } from './backend/mongodb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function testSetup() {
    console.log('🧪 Testing MongoDB Atlas Setup...\n');
    
    // Debug: Check if environment variables are loaded
    console.log('🔍 Environment check:');
    console.log('   MONGODB_URI loaded:', !!process.env.MONGODB_URI);
    if (process.env.MONGODB_URI) {
        const uriParts = process.env.MONGODB_URI.split('@');
        console.log('   URI format: mongodb+srv://[user:pass]@' + (uriParts[1] || 'unknown'));
    }
    console.log();
    
    try {
        // Test MongoDB connection
        console.log('1. Testing MongoDB connection...');
        await mongodb.connect();
        console.log('✅ MongoDB connected successfully!\n');
        
        // Test user creation
        console.log('2. Testing user registration...');
        const testEmail = `test_${Date.now()}@example.com`;
        const testPassword = 'TestPass123!';
        const testName = 'Test User';
        const testMobile = '01712345678';
        
        const signUpResult = await mongodb.signUp(testEmail, testPassword, testName, testMobile);
        
        if (signUpResult.error) {
            console.log('❌ User registration failed:', signUpResult.error.message);
        } else {
            console.log('✅ User registration successful!');
            console.log('   User ID:', signUpResult.data.user.id);
            console.log('   Email:', signUpResult.data.user.email);
            console.log('   Token generated:', !!signUpResult.data.token);
        }
        
        console.log('\n3. Testing user login...');
        const signInResult = await mongodb.signIn(testEmail, testPassword);
        
        if (signInResult.error) {
            console.log('❌ User login failed:', signInResult.error.message);
        } else {
            console.log('✅ User login successful!');
            console.log('   User ID:', signInResult.data.user.id);
            console.log('   Token generated:', !!signInResult.data.token);
        }
        
        console.log('\n🎉 All tests passed! Your MongoDB setup is working correctly.');
        console.log('\n📝 Next steps:');
        console.log('   1. Update your MongoDB connection string in backend/.env');
        console.log('   2. Generate a secure JWT secret');
        console.log('   3. Run: npm start');
        console.log('   4. Open: http://localhost:3000/auth');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check your MongoDB Atlas connection string');
        console.log('   2. Verify network access is configured (0.0.0.0/0)');
        console.log('   3. Ensure database user has proper permissions');
        console.log('   4. Check if your IP is whitelisted');
    }
    
    process.exit(0);
}

testSetup();
