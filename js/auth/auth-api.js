/**
 * Authentication API Service
 * Handles all HTTP requests to the backend authentication endpoints
 * Manages token storage and user data persistence
 */
class AuthenticationAPI {
    constructor() {
        this.baseUrl = AuthConfig.API_BASE_URL;
    }

    /**
     * Generic HTTP request method with error handling
     * @param {string} endpoint - API endpoint path
     * @param {Object} options - Request options
     * @returns {Promise<Object>} API response
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authentication token if available
        const authToken = this.getStoredToken();
        if (authToken && !config.headers[AuthConfig.TOKEN_HEADER]) {
            config.headers[AuthConfig.TOKEN_HEADER] = `${AuthConfig.TOKEN_PREFIX}${authToken}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Handle HTTP error responses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            return responseData;

        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    /**
     * Register a new user account
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration result
     */
    async registerUser(userData) {
        const response = await this.makeRequest(AuthConfig.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success && response.token) {
            this.storeToken(response.token);
            this.storeUserData(response.user);
        }

        return response;
    }

    /**
     * Authenticate user login
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {boolean} rememberMe - Whether to remember login
     * @returns {Promise<Object>} Login result
     */
    async authenticateUser(email, password, rememberMe = false) {
        const response = await this.makeRequest(AuthConfig.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password, rememberMe })
        });

        if (response.success && response.token) {
            this.storeToken(response.token, rememberMe);
            this.storeUserData(response.user);
            this.setRememberMePreference(rememberMe);
        }

        return response;
    }

    /**
     * Get current user profile
     * @returns {Promise<Object>} User profile data
     */
    async getUserProfile() {
        return await this.makeRequest(AuthConfig.ENDPOINTS.PROFILE);
    }

    /**
     * Update user profile information
     * @param {Object} profileData - Profile updates
     * @returns {Promise<Object>} Update result
     */
    async updateUserProfile(profileData) {
        return await this.makeRequest(AuthConfig.ENDPOINTS.PROFILE, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    /**
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Password change result
     */
    async changeUserPassword(currentPassword, newPassword) {
        return await this.makeRequest(AuthConfig.ENDPOINTS.CHANGE_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    // Token management methods

    /**
     * Get stored authentication token
     * @returns {string|null} JWT token
     */
    getStoredToken() {
        const localToken = localStorage.getItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN);
        const sessionToken = sessionStorage.getItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN);
        const token = localToken || sessionToken;
        console.log('[DEBUG] AuthAPI - Retrieved token:', token ? 'Token found' : 'No token', 'Source:', localToken ? 'localStorage' : sessionToken ? 'sessionStorage' : 'none');
        return token;
    }

    /**
     * Store authentication token
     * @param {string} token - JWT token
     * @param {boolean} persistent - Whether to store in localStorage
     */
    storeToken(token, persistent = false) {
        console.log('[DEBUG] AuthAPI - Storing token:', token ? 'Token provided' : 'No token', 'Persistent:', persistent);
        if (persistent) {
            localStorage.setItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN, token);
        } else {
            sessionStorage.setItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN, token);
        }
        console.log('[DEBUG] AuthAPI - Token stored in:', persistent ? 'localStorage' : 'sessionStorage');
    }

    /**
     * Remove stored authentication token
     */
    removeStoredToken() {
        localStorage.removeItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN);
        sessionStorage.removeItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN);
    }

    // User data management methods

    /**
     * Get stored user data
     * @returns {Object|null} User data object
     */
    getStoredUserData() {
        const dataString = localStorage.getItem(AuthConfig.STORAGE_KEYS.USER_DATA) || 
                          sessionStorage.getItem(AuthConfig.STORAGE_KEYS.USER_DATA);
        return dataString ? JSON.parse(dataString) : null;
    }

    /**
     * Store user data
     * @param {Object} userData - User data object
     */
    storeUserData(userData) {
        const dataString = JSON.stringify(userData);
        const rememberMe = this.getRememberMePreference();
        
        if (rememberMe) {
            localStorage.setItem(AuthConfig.STORAGE_KEYS.USER_DATA, dataString);
        } else {
            sessionStorage.setItem(AuthConfig.STORAGE_KEYS.USER_DATA, dataString);
        }
    }

    /**
     * Remove stored user data
     */
    removeStoredUserData() {
        localStorage.removeItem(AuthConfig.STORAGE_KEYS.USER_DATA);
        sessionStorage.removeItem(AuthConfig.STORAGE_KEYS.USER_DATA);
    }

    // Remember me preference methods

    /**
     * Get remember me preference
     * @returns {boolean} Remember me setting
     */
    getRememberMePreference() {
        return localStorage.getItem(AuthConfig.STORAGE_KEYS.REMEMBER_ME) === 'true';
    }

    /**
     * Set remember me preference
     * @param {boolean} remember - Remember me setting
     */
    setRememberMePreference(remember) {
        localStorage.setItem(AuthConfig.STORAGE_KEYS.REMEMBER_ME, remember.toString());
    }

    /**
     * Logout user and clear stored data
     * @returns {Promise<Object>} Logout result
     */
    async logoutUser() {
        try {
            // Call server to invalidate session
            const response = await this.makeRequest(AuthConfig.ENDPOINTS.LOGOUT, {
                method: 'POST'
            });
            
            // Clear local storage regardless of server response
            this.removeStoredToken();
            this.removeStoredUserData();
            localStorage.removeItem(AuthConfig.STORAGE_KEYS.REMEMBER_ME);
            
            return response;
        } catch (error) {
            // Even if server call fails, clear local storage
            this.removeStoredToken();
            this.removeStoredUserData();
            localStorage.removeItem(AuthConfig.STORAGE_KEYS.REMEMBER_ME);
            
            return {
                success: true,
                message: 'Logged out successfully'
            };
        }
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean} Authentication status
     */
    isUserAuthenticated() {
        const token = this.getStoredToken();
        const userData = this.getStoredUserData();
        return !!(token && userData);
    }

    /**
     * Test API connection
     * @returns {Promise<boolean>} Connection status
     */
    async testApiConnection() {
        try {
            const response = await this.makeRequest('/test');
            return response.success;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}

// Export for global access
window.AuthenticationAPI = AuthenticationAPI;
