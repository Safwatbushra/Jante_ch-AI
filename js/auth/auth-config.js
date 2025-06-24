// Authentication Configuration
class AuthConfig {
    static API_BASE_URL = window.location.origin + '/api';
    
    static ENDPOINTS = {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        PROFILE: '/auth/profile',
        CHANGE_PASSWORD: '/auth/change-password',
        LOGOUT: '/auth/logout'
    };

    static STORAGE_KEYS = {
        ACCESS_TOKEN: 'auth_token',
        USER_DATA: 'user_data',
        REMEMBER_ME: 'remember_me'
    };

    static TOKEN_HEADER = 'Authorization';
    static TOKEN_PREFIX = 'Bearer ';

    // Validation patterns
    static VALIDATION = {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        MOBILE: /^(\+88)?01[3-9]\d{8}$/,
        PASSWORD_MIN_LENGTH: 8
    };

    // HTTP status codes
    static HTTP_STATUS = {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_ERROR: 500
    };
}

window.AuthConfig = AuthConfig;
