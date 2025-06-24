// Client-side configuration for Jante ChAi
// This file handles configuration for the frontend

class Config {
    constructor() {
        // App configuration
        this.APP_NAME = 'Jante ChAi';
        this.REDIRECT_AFTER_AUTH = '/user.html';
        this.REDIRECT_AFTER_LOGOUT = '/homepage.html';
        
        // Development mode detection
        this.IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // API configuration
        this.API_BASE_URL = window.location.origin + '/api';
    }
      // Validation
    isConfigured() {
        return true; // Always configured for MongoDB system
    }
}

// Create global config instance
window.appConfig = new Config();
