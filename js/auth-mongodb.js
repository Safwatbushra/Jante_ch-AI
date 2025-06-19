// Client-side authentication module for Jante ChAi
// Uses MongoDB backend for simple authentication

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.apiBaseUrl = window.location.origin + '/api';
        
        // Initialize when DOM is ready
        this.init();
    }

    async init() {
        console.log('AuthManager init started...');
        
        // Check for existing user session
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
            try {
                this.currentUser = JSON.parse(userSession);
                this.handleAuthStateChange('SIGNED_IN', this.currentUser);
            } catch (error) {
                console.error('Invalid user session data:', error);
                localStorage.removeItem('userSession');
            }
        }
        
        console.log('AuthManager initialized successfully');
    }

    // Handle authentication state changes
    handleAuthStateChange(event, user) {
        switch (event) {
            case 'SIGNED_IN':
                this.currentUser = user;
                console.log('User signed in:', this.currentUser);
                
                // Store user info in localStorage for quick access
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userName', this.currentUser.email);
                localStorage.setItem('userId', this.currentUser.id);
                localStorage.setItem('userSession', JSON.stringify(this.currentUser));
                
                // Notify listeners
                this.notifyAuthStateListeners('SIGNED_IN', this.currentUser);
                
                // Redirect to user page if on auth page
                if (window.location.pathname.includes('auth.html')) {
                    console.log('Redirecting to user page after successful authentication');
                    window.location.href = 'user.html';
                }
                break;
                
            case 'SIGNED_OUT':
                this.currentUser = null;
                console.log('User signed out');
                
                // Clear localStorage
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userName');
                localStorage.removeItem('userId');
                localStorage.removeItem('userSession');
                
                // Notify listeners
                this.notifyAuthStateListeners('SIGNED_OUT', null);
                
                // Redirect to homepage if on protected page
                if (window.location.pathname.includes('user.html')) {
                    console.log('Redirecting to homepage after logout');
                    window.location.href = 'homepage.html';
                }
                break;
        }
    }

    // Add auth state listener
    addAuthStateListener(callback) {
        this.authStateListeners.push(callback);
    }
    
    // Remove auth state listener
    removeAuthStateListener(callback) {
        const index = this.authStateListeners.indexOf(callback);
        if (index > -1) {
            this.authStateListeners.splice(index, 1);
        }
    }
    
    // Notify all auth state listeners
    notifyAuthStateListeners(event, user) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(event, user);
            } catch (error) {
                console.error('Error in auth state listener:', error);
            }
        });
    }

    // Sign up new user
    async signUp(email, password, fullName = '', mobile = '') {
        try {
            console.log('SignUp called with email:', email, 'fullName:', fullName);
            
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    fullName,
                    mobile
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('Sign up successful:', result.data);

            // Store user data and set as signed in
            this.currentUser = result.data.user;
            this.handleAuthStateChange('SIGNED_IN', this.currentUser);

            return { success: true, data: result.data, error: null };
            
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, data: null, error: error.message };
        }
    }

    // Sign in existing user
    async signIn(email, password) {
        try {
            console.log('SignIn called with email:', email);
            
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('Sign in successful:', result.data);

            // Store user data and set as signed in
            this.currentUser = result.data.user;
            this.handleAuthStateChange('SIGNED_IN', this.currentUser);

            return { success: true, data: result.data, error: null };
            
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, data: null, error: error.message };
        }
    }

    // Sign out user
    async signOut() {
        try {
            // Simple logout - just clear local state
            this.handleAuthStateChange('SIGNED_OUT', null);
            return { success: true, error: null };
            
        } catch (error) {
            console.error('Sign out error:', error);
            // Even if something fails, clear local state
            this.handleAuthStateChange('SIGNED_OUT', null);
            return { success: false, error: error.message };
        }
    }

    // Reset password (placeholder - implement with email service)
    async resetPassword(email) {
        try {
            // For now, just return success
            // In production, implement with email service
            console.log('Password reset requested for:', email);
            
            return { success: true, error: null };
            
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null && localStorage.getItem('userSession') !== null;
    }

    // Validation methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateMobile(mobile) {
        const mobileRegex = /^(\+88)?01[3-9]\d{8}$/;
        return mobileRegex.test(mobile.replace(/\s/g, ''));
    }

    validatePassword(password) {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
            isValid: minLength && hasUpper && hasLower && hasNumber,
            strength: [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length,
            requirements: {
                minLength,
                hasUpper,
                hasLower,
                hasNumber,
                hasSpecial
            }
        };
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();
