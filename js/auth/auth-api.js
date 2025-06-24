// Authentication API Service
class AuthAPI {
    constructor() {
        this.baseURL = AuthConfig.API_BASE_URL;
    }

    // Generic HTTP request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        const token = this.getToken();
        if (token && !config.headers[AuthConfig.TOKEN_HEADER]) {
            config.headers[AuthConfig.TOKEN_HEADER] = `${AuthConfig.TOKEN_PREFIX}${token}`;
        }        try {
            const response = await fetch(url, config);
            
            // Check if response is ok
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }    // Authentication methods
    async register(userData) {
        const response = await this.request(AuthConfig.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success && response.token) {
            this.setToken(response.token);
            this.setUserData(response.user);
        }

        return response;
    }

    async login(email, password, rememberMe = false) {        const response = await this.request(AuthConfig.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password, rememberMe })
        });if (response.success && response.token) {
            this.setToken(response.token, rememberMe);
            this.setUserData(response.user);
            this.setRememberMe(rememberMe);
        }

        return response;
    }

    async getProfile() {
        return await this.request(AuthConfig.ENDPOINTS.PROFILE);
    }

    async updateProfile(profileData) {
        return await this.request(AuthConfig.ENDPOINTS.PROFILE, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(currentPassword, newPassword) {
        return await this.request(AuthConfig.ENDPOINTS.CHANGE_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    // Token management
    getToken() {
        return localStorage.getItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN) || 
               sessionStorage.getItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN);
    }

    setToken(token, persistent = false) {
        if (persistent) {
            localStorage.setItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN, token);
        } else {
            sessionStorage.setItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN, token);
        }
    }

    removeToken() {
        localStorage.removeItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN);
        sessionStorage.removeItem(AuthConfig.STORAGE_KEYS.ACCESS_TOKEN);
    }

    // User data management
    getUserData() {
        const data = localStorage.getItem(AuthConfig.STORAGE_KEYS.USER_DATA) || 
                    sessionStorage.getItem(AuthConfig.STORAGE_KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    }

    setUserData(userData) {
        const dataString = JSON.stringify(userData);
        const rememberMe = this.getRememberMe();
        
        if (rememberMe) {
            localStorage.setItem(AuthConfig.STORAGE_KEYS.USER_DATA, dataString);
        } else {
            sessionStorage.setItem(AuthConfig.STORAGE_KEYS.USER_DATA, dataString);
        }
    }

    removeUserData() {
        localStorage.removeItem(AuthConfig.STORAGE_KEYS.USER_DATA);
        sessionStorage.removeItem(AuthConfig.STORAGE_KEYS.USER_DATA);
    }

    // Remember me preference
    getRememberMe() {
        return localStorage.getItem(AuthConfig.STORAGE_KEYS.REMEMBER_ME) === 'true';
    }

    setRememberMe(remember) {
        localStorage.setItem(AuthConfig.STORAGE_KEYS.REMEMBER_ME, remember.toString());
    }

    // Logout
    logout() {
        this.removeToken();
        this.removeUserData();
        localStorage.removeItem(AuthConfig.STORAGE_KEYS.REMEMBER_ME);
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        const userData = this.getUserData();
        return !!(token && userData);
    }

    // Test API connection
    async testConnection() {
        try {
            const response = await this.request('/test');
            return response.success;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}

window.AuthAPI = AuthAPI;
