/**
 * Authentication Manager
 * Main authentication controller that coordinates between UI and API
 * Integrates with state management for reactive UI updates
 */
class AuthenticationManager {
    constructor() {
        this.api = new AuthenticationAPI();
        this.currentUser = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.sessionCheckInterval = null;
    }

    /**
     * Initialize the authentication manager
     * @returns {Promise<Object|null>} Current user if authenticated
     */
    async initialize() {
        if (this.isInitialized) {
            return this.currentUser;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this.performInitialization();
        return this.initializationPromise;
    }

    /**
     * Perform the actual initialization process
     * @returns {Promise<Object|null>} Current user if authenticated
     */
    async performInitialization() {
        try {
            // Test API connection
            const isConnected = await this.api.testApiConnection();
            if (!isConnected) {
                console.warn('⚠️ API connection test failed');
            }

            // Check if user is already logged in
            if (this.api.isUserAuthenticated()) {
                try {
                    const response = await this.api.getUserProfile();
                    if (response.success) {
                        this.currentUser = response.user;
                        this.startSessionMonitoring();
                        this.updateUIForAuthenticatedUser();
                        
                        // Update state manager
                        if (window.stateManager) {
                            stateManager.setUser(response.user);
                        }
                    } else {
                        // Invalid token, clear storage
                        this.api.logoutUser();
                        this.updateUIForUnauthenticatedUser();
                    }
                } catch (error) {
                    console.warn('⚠️ Failed to restore session:', error.message);
                    this.api.logoutUser();
                    this.updateUIForUnauthenticatedUser();
                }
            } else {
                this.updateUIForUnauthenticatedUser();
            }

            this.isInitialized = true;
            return this.currentUser;

        } catch (error) {
            console.error('❌ AuthManager initialization failed:', error);
            this.isInitialized = true; // Still mark as initialized to prevent retry loops
            this.updateUIForUnauthenticatedUser();
            return null;
        }
    }

    /**
     * Start monitoring session validity
     */
    startSessionMonitoring() {
        // Clear any existing interval
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }

        // Check session every 5 minutes
        this.sessionCheckInterval = setInterval(async () => {
            if (this.isUserAuthenticated()) {
                try {
                    const response = await this.api.getUserProfile();
                    if (!response.success) {
                        console.log('🔄 Session expired, logging out...');
                        await this.signOut();
                    }
                } catch (error) {
                    console.log('🔄 Session check failed, logging out...');
                    await this.signOut();
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    /**
     * Update UI for authenticated user
     */
    updateUIForAuthenticatedUser() {
        if (!this.currentUser) return;

        // Update sidebar user info
        const userNames = document.querySelectorAll('.user-name');
        userNames.forEach(name => {
            if (name.textContent.includes('John Doe') || name.textContent.includes('জন ডো') || name.textContent.includes('Loading...') || name.textContent.includes('লোড হচ্ছে...')) {
                name.textContent = this.currentUser.fullName || this.currentUser.email;
            }
        });

        const userEmails = document.querySelectorAll('.user-email');
        userEmails.forEach(email => {
            if (email.textContent.includes('john.doe@example.com') || email.textContent.includes('loading@example.com')) {
                email.textContent = this.currentUser.email;
            }
        });

        // Update profile tab elements
        const profileName = document.getElementById('profileName');
        const profileNameBn = document.getElementById('profileNameBn');
        const profileEmail = document.getElementById('profileEmail');
        const profileEmailBn = document.getElementById('profileEmailBn');

        if (profileName) {
            profileName.textContent = this.currentUser.fullName || this.currentUser.email;
        }
        if (profileNameBn) {
            profileNameBn.textContent = this.currentUser.fullName || this.currentUser.email;
        }
        if (profileEmail) {
            profileEmail.textContent = this.currentUser.email;
        }
        if (profileEmailBn) {
            profileEmailBn.textContent = this.currentUser.email;
        }

        // Show authenticated content
        document.body.classList.add('user-authenticated');
        this.hideLoginElements();
        this.showAuthenticatedElements();
    }

    /**
     * Update UI for unauthenticated user
     */
    updateUIForUnauthenticatedUser() {
        document.body.classList.remove('user-authenticated');
        this.showLoginElements();
        this.hideAuthenticatedElements();
    }

    /**
     * Hide login-related elements
     */
    hideLoginElements() {
        const loginElements = document.querySelectorAll('.login-required, .auth-required');
        loginElements.forEach(el => el.style.display = 'none');
    }

    /**
     * Show login-related elements
     */
    showLoginElements() {
        const loginElements = document.querySelectorAll('.login-required, .auth-required');
        loginElements.forEach(el => el.style.display = 'block');
    }

    /**
     * Hide authenticated elements
     */
    hideAuthenticatedElements() {
        const authElements = document.querySelectorAll('.user-dashboard, .authenticated-only');
        authElements.forEach(el => el.style.display = 'none');
    }

    /**
     * Show authenticated elements
     */
    showAuthenticatedElements() {
        const authElements = document.querySelectorAll('.user-dashboard, .authenticated-only');
        authElements.forEach(el => el.style.display = 'block');
    }

    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} fullName - User full name
     * @param {string} mobile - User mobile (optional)
     * @returns {Promise<Object>} Registration result
     */
    async registerUser(email, password, fullName, mobile = '') {
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

            const response = await this.api.registerUser(sanitizedData);

            if (response.success) {
                this.currentUser = response.user;
                console.log('✅ Registration successful:', this.currentUser.email);
                this.startSessionMonitoring();
                this.updateUIForAuthenticatedUser();
                this.dispatchAuthEvent('userRegistered', this.currentUser);
                
                // Update state manager
                if (window.stateManager) {
                    stateManager.setUser(response.user);
                }
            }

            return response;

        } catch (error) {
            console.error('❌ Registration error:', error);
            return {
                success: false,
                error: 'Registration failed. Please try again.'
            };
        }
    }

    /**
     * Sign in user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {boolean} rememberMe - Whether to remember login
     * @returns {Promise<Object>} Login result
     */
    async signInUser(email, password, rememberMe = false) {
        try {
            // Validate input
            const validationData = { email, password };
            const validation = AuthValidator.validateLoginForm(validationData);

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
                password: password
            };

            const response = await this.api.authenticateUser(sanitizedData.email, sanitizedData.password, rememberMe);

            if (response.success) {
                this.currentUser = response.user;
                console.log('✅ Login successful:', this.currentUser.email);
                this.startSessionMonitoring();
                this.updateUIForAuthenticatedUser();
                this.dispatchAuthEvent('userLoggedIn', this.currentUser);
                
                // Update state manager
                if (window.stateManager) {
                    stateManager.setUser(response.user);
                }
            }

            return response;

        } catch (error) {
            console.error('❌ Login error:', error);
            return {
                success: false,
                error: 'Login failed. Please try again.'
            };
        }
    }

    /**
     * Sign out user
     * @returns {Promise<Object>} Logout result
     */
    async signOut() {
        try {
            const response = await this.api.logoutUser();
            
            this.currentUser = null;
            this.api.logoutUser();
            
            // Clear session monitoring
            if (this.sessionCheckInterval) {
                clearInterval(this.sessionCheckInterval);
                this.sessionCheckInterval = null;
            }

            this.updateUIForUnauthenticatedUser();
            this.dispatchAuthEvent('userLoggedOut', null);
            
            // Update state manager
            if (window.stateManager) {
                stateManager.clearUser();
            }

            // Redirect to homepage after logout
            setTimeout(() => {
                window.location.href = 'homepage.html';
            }, 500);

            return response;

        } catch (error) {
            console.error('❌ Logout error:', error);
            return {
                success: false,
                error: 'Logout failed'
            };
        }
    }

    /**
     * Get current user
     * @returns {Object|null} Current user object
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isUserAuthenticated() {
        return this.api.isUserAuthenticated() && !!this.currentUser;
    }

    /**
     * Require authentication for protected routes
     * @param {string} redirectUrl - URL to redirect if not authenticated
     */
    requireAuthentication(redirectUrl = 'auth.html') {
        if (!this.isUserAuthenticated()) {
            this.redirectToLogin(redirectUrl);
        }
    }

    /**
     * Update user profile
     * @param {Object} profileData - Profile updates
     * @returns {Promise<Object>} Update result
     */
    async updateUserProfile(profileData) {
        try {
            const response = await this.api.updateUserProfile(profileData);
            
            if (response.success) {
                this.currentUser = response.user;
                this.updateUIForAuthenticatedUser();
                
                // Update state manager
                if (window.stateManager) {
                    stateManager.setUser(response.user);
                }
            }

            return response;

        } catch (error) {
            console.error('❌ Profile update error:', error);
            return {
                success: false,
                error: 'Profile update failed'
            };
        }
    }

    /**
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Password change result
     */
    async changeUserPassword(currentPassword, newPassword) {
        try {
            const response = await this.api.changeUserPassword(currentPassword, newPassword);
            
            if (response.success) {
                // Force re-login after password change
                await this.signOut();
            }

            return response;

        } catch (error) {
            console.error('❌ Password change error:', error);
            return {
                success: false,
                error: 'Password change failed'
            };
        }
    }

    // Utility methods

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Validation result
     */
    validateEmail(email) {
        return AuthValidator.validateEmail(email);
    }

    /**
     * Validate mobile number
     * @param {string} mobile - Mobile to validate
     * @returns {boolean} Validation result
     */
    validateMobile(mobile) {
        return AuthValidator.validateMobile(mobile);
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {boolean} Validation result
     */
    validatePassword(password) {
        return AuthValidator.validatePassword(password);
    }

    /**
     * Validate name format
     * @param {string} name - Name to validate
     * @returns {boolean} Validation result
     */
    validateName(name) {
        return AuthValidator.validateName(name);
    }

    /**
     * Redirect to login page
     * @param {string} redirectUrl - URL to redirect after login
     */
    redirectToLogin(redirectUrl = 'auth.html') {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `${redirectUrl}?redirect=${currentUrl}`;
    }

    /**
     * Redirect to dashboard
     */
    redirectToDashboard() {
        window.location.href = 'user.html';
    }

    /**
     * Dispatch authentication events
     * @param {string} eventName - Event name
     * @param {Object} userData - User data
     */
    dispatchAuthEvent(eventName, userData) {
        const event = new CustomEvent('authStateChanged', {
            detail: { event: eventName, user: userData }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get debug information
     * @returns {Object} Debug info
     */
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            isAuthenticated: this.isUserAuthenticated(),
            hasCurrentUser: !!this.currentUser,
            apiConnected: this.api.isUserAuthenticated(),
            sessionMonitoring: !!this.sessionCheckInterval
        };
    }
}

// Create singleton instance
const authManager = new AuthenticationManager();

// Export for global access
window.AuthenticationManager = AuthenticationManager;
window.authManager = authManager;

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    authManager.initialize();
});

// Listen for auth state changes
document.addEventListener('authStateChanged', (event) => {
    console.log('Auth state changed:', event.detail);
});
