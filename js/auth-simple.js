// auth-mongodb.js - Simple session-based authentication manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authKey = 'jante_auth_user';
        this.init();
    }

    init() {
        // Check if user is already logged in from localStorage
        this.loadUserFromStorage();
    }

    loadUserFromStorage() {
        try {
            const userData = localStorage.getItem(this.authKey);
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.updateUIOnLogin(this.currentUser);
                return true;
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
            this.signOut();
        }
        return false;
    }

    saveUserToStorage(user) {
        try {
            localStorage.setItem(this.authKey, JSON.stringify(user));
            this.currentUser = user;
        } catch (error) {
            console.error('Error saving user to storage:', error);
        }
    }

    removeUserFromStorage() {
        localStorage.removeItem(this.authKey);
        this.currentUser = null;
    }

    async signUp(email, password, fullName, mobile = '') {
        try {
            // Basic validation
            if (!email || !password || !fullName) {
                throw new Error('All fields are required');
            }

            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, fullName, mobile })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            this.saveUserToStorage(result.user);
            this.updateUIOnLogin(result.user);

            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Login failed');
            }

            this.saveUserToStorage(result.user);
            this.updateUIOnLogin(result.user);

            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    signOut() {
        this.removeUserFromStorage();
        this.updateUIOnLogout();
        
        // Redirect to auth page if not already there
        if (!window.location.pathname.includes('auth.html')) {
            window.location.href = 'auth.html';
        }
    }

    getUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getUserId() {
        return this.currentUser ? this.currentUser.id : null;
    }

    updateUIOnLogin(user) {
        // Update UI elements when user logs in
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => el.textContent = user.fullName);

        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(el => el.textContent = user.email);

        // Hide login forms and show user content
        const authSections = document.querySelectorAll('.auth-section');
        authSections.forEach(el => el.style.display = 'none');

        const userSections = document.querySelectorAll('.user-section');
        userSections.forEach(el => el.style.display = 'block');

        // Update login/logout buttons
        const loginBtns = document.querySelectorAll('.login-btn');
        loginBtns.forEach(el => el.style.display = 'none');

        const logoutBtns = document.querySelectorAll('.logout-btn');
        logoutBtns.forEach(el => el.style.display = 'block');
    }

    updateUIOnLogout() {
        // Show login forms and hide user content
        const authSections = document.querySelectorAll('.auth-section');
        authSections.forEach(el => el.style.display = 'block');

        const userSections = document.querySelectorAll('.user-section');
        userSections.forEach(el => el.style.display = 'none');

        // Update login/logout buttons
        const loginBtns = document.querySelectorAll('.login-btn');
        loginBtns.forEach(el => el.style.display = 'block');

        const logoutBtns = document.querySelectorAll('.logout-btn');
        logoutBtns.forEach(el => el.style.display = 'none');
    }

    // Handle social login placeholders
    handleGoogleLogin() {
        this.showComingSoonMessage('Google login coming soon! / গুগল লগইন শীঘ্রই আসছে!');
    }

    handleFacebookLogin() {
        this.showComingSoonMessage('Facebook login coming soon! / ফেসবুক লগইন শীঘ্রই আসছে!');
    }

    showComingSoonMessage(message) {
        alert(message);
    }

    // Form validation helpers
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    validateMobile(mobile) {
        if (!mobile) return true; // Optional field
        const mobileRegex = /^[0-9]{10,15}$/;
        return mobileRegex.test(mobile.replace(/[\s\-\+]/g, ''));
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

export default window.authManager;
