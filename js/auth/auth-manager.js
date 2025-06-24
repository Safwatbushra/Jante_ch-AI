// Main Authentication Manager
class AuthManager {
    constructor() {
        this.api = new AuthAPI();
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
    }

    // Initialize the auth manager
    async initialize() {
        if (this.isInitialized) {
            return this.currentUser;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }

    async _performInitialization() {
        try {
            console.log('Initializing AuthManager...');
            
            // Test API connection
            const isConnected = await this.api.testConnection();
            if (!isConnected) {
                console.warn('⚠️ API connection test failed');
            }

            // Check if user is already logged in
            if (this.api.isAuthenticated()) {
                try {
                    const response = await this.api.getProfile();
                    if (response.success) {
                        this.currentUser = response.data;
                        console.log('✅ User session restored:', this.currentUser.email);
                    } else {
                        // Invalid token, clear storage
                        this.api.logout();
                        console.log('🔄 Invalid token, cleared storage');
                    }
                } catch (error) {
                    console.warn('⚠️ Failed to restore session:', error.message);
                    this.api.logout();
                }
            }

            this.isInitialized = true;
            return this.currentUser;

        } catch (error) {
            console.error('❌ AuthManager initialization failed:', error);
            this.isInitialized = true; // Still mark as initialized to prevent retry loops
            return null;
        }
    }

    // Registration
    async signUp(email, password, fullName, mobile = '') {
        try {
            // Validate input
            const validationData = {
                email,
                password,
                confirmPassword: password,
                fullName,
                mobile,
                agreeTerms: true
            };
            
            const validation = AuthValidator.validateRegisterForm(validationData);

            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0];
                return {
                    success: false,
                    error: firstError
                };
            }

            // Sanitize inputs
            const sanitizedData = {
                email: AuthValidator.sanitizeInput(email).toLowerCase(),
                password: password,
                fullName: AuthValidator.sanitizeInput(fullName),
                mobile: mobile ? AuthValidator.sanitizeInput(mobile) : null
            };

            const response = await this.api.register(sanitizedData);

            if (response.success) {
                this.currentUser = response.user;
                console.log('✅ Registration successful:', this.currentUser.email);
                this._dispatchAuthEvent('userRegistered', this.currentUser);
            }

            return response;

        } catch (error) {
            console.error('❌ Registration error:', error);
            return {
                success: false,
                error: error.message || 'Registration failed. Please try again.'
            };
        }
    }

    // Login
    async signIn(email, password, rememberMe = false) {
        try {
            // Validate input
            const validation = AuthValidator.validateLoginForm({ email, password });
            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0];
                return {
                    success: false,
                    error: firstError
                };
            }

            const sanitizedEmail = AuthValidator.sanitizeInput(email).toLowerCase();
            const response = await this.api.login(sanitizedEmail, password, rememberMe);

            if (response.success) {
                this.currentUser = response.user;
                console.log('✅ Login successful:', this.currentUser.email);
                this._dispatchAuthEvent('userLoggedIn', this.currentUser);
            }

            return response;

        } catch (error) {
            console.error('❌ Login error:', error);
            return {
                success: false,
                error: error.message || 'Login failed. Please check your credentials.'
            };
        }
    }

    // Logout
    async signOut() {
        try {
            const user = this.currentUser;
            this.currentUser = null;
            this.api.logout();
            
            console.log('✅ User logged out');
            this._dispatchAuthEvent('userLoggedOut', user);
            
            return { success: true };

        } catch (error) {
            console.error('❌ Logout error:', error);
            return {
                success: false,
                error: error.message || 'Logout failed'
            };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.currentUser && this.api.isAuthenticated());
    }

    // Update profile
    async updateProfile(profileData) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const response = await this.api.updateProfile(profileData);

            if (response.success) {
                const profileResponse = await this.api.getProfile();
                if (profileResponse.success) {
                    this.currentUser = profileResponse.data;
                    this._dispatchAuthEvent('profileUpdated', this.currentUser);
                }
            }

            return response;

        } catch (error) {
            console.error('❌ Profile update error:', error);
            return {
                success: false,
                error: error.message || 'Profile update failed'
            };
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const validation = AuthValidator.validatePassword(newPassword);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.message
                };
            }

            const response = await this.api.changePassword(currentPassword, newPassword);
            
            if (response.success) {
                this._dispatchAuthEvent('passwordChanged', this.currentUser);
            }

            return response;

        } catch (error) {
            console.error('❌ Password change error:', error);
            return {
                success: false,
                error: error.message || 'Password change failed'
            };
        }
    }

    // Validation methods
    validateEmail(email) {
        return AuthValidator.validateEmail(email);
    }

    validateMobile(mobile) {
        return AuthValidator.validateMobile(mobile);
    }

    validatePassword(password) {
        return AuthValidator.validatePassword(password);
    }

    validateName(name) {
        return AuthValidator.validateName(name);
    }

    // Redirect helpers
    redirectToLogin() {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('auth.html')) {
            window.location.href = 'auth.html';
        }
    }

    redirectToDashboard() {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('user.html')) {
            window.location.href = 'user.html';
        }
    }

    // Protected route helper
    requireAuth() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    // Event dispatcher
    _dispatchAuthEvent(eventName, userData) {
        const event = new CustomEvent(eventName, {
            detail: userData
        });
        window.dispatchEvent(event);
    }

    // Debug info
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            isAuthenticated: this.isAuthenticated(),
            currentUser: this.currentUser,
            hasToken: !!this.api.getToken(),
            userData: this.api.getUserData()
        };
    }
}

// Initialize global auth manager
window.authManager = new AuthManager();

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authManager.initialize();
    });
} else {
    window.authManager.initialize();
}
