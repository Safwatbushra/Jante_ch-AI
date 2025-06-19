// Client-side authentication module for Jante ChAi
// Uses Supabase for authentication and integrates with backend

class AuthManager {
    constructor() {
        // Configuration will be loaded from config.js
        this.config = null;
        this.supabase = null;
        this.currentUser = null;
        this.authStateListeners = [];
        
        // Initialize when DOM is ready
        this.init();
    }    async init() {
        // Wait for config to be loaded
        while (typeof window.appConfig === 'undefined') {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.config = window.appConfig;
        
        // Check if Supabase is configured
        if (!this.config.isConfigured()) {
            console.warn('Supabase not configured. Please update your configuration in js/config.js');
            return;
        }
        
        // Wait for Supabase to be loaded from CDN
        while (typeof window.supabase === 'undefined') {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const { url, anonKey } = this.config.getSupabaseConfig();
        this.supabase = window.supabase.createClient(url, anonKey);
        
        // Check for existing session
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            this.handleAuthStateChange('SIGNED_IN', session);
        }

        // Listen for auth state changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            this.handleAuthStateChange(event, session);
        });
        
        console.log('AuthManager initialized successfully');
    }    // Handle authentication state changes
    handleAuthStateChange(event, session) {
        switch (event) {
            case 'SIGNED_IN':
                this.currentUser = session.user;
                console.log('User signed in:', this.currentUser);
                // Store user info in localStorage for quick access
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userName', this.currentUser.email);
                localStorage.setItem('userId', this.currentUser.id);
                
                // Notify listeners
                this.notifyAuthStateListeners('SIGNED_IN', this.currentUser);
                
                // Redirect to user page if on auth page
                if (window.location.pathname.includes('auth.html')) {
                    window.location.href = this.config.REDIRECT_AFTER_AUTH;
                }
                break;
            case 'SIGNED_OUT':
                this.currentUser = null;
                console.log('User signed out');
                // Clear localStorage
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userName');
                localStorage.removeItem('userId');
                
                // Notify listeners
                this.notifyAuthStateListeners('SIGNED_OUT', null);
                
                // Redirect to homepage if on protected page
                if (window.location.pathname.includes('user.html')) {
                    window.location.href = this.config.REDIRECT_AFTER_LOGOUT;
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
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        mobile: mobile
                    }
                }
            });

            if (error) throw error;

            // Create user profile if sign up successful
            if (data.user) {
                await this.createUserProfile(data.user.id, email, fullName, mobile);
            }

            return { success: true, data, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, data: null, error: error.message };
        }
    }

    // Sign in existing user
    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            return { success: true, data, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, data: null, error: error.message };
        }
    }

    // Sign out user
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            return { success: true, error: null };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth.html#reset-password`
            });

            if (error) throw error;

            return { success: true, error: null };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Integration with backend functions
    async callBackendFunction(functionName, params = {}) {
        try {
            // For development, we'll call backend functions directly through Supabase
            // In production, you might want to use a backend API endpoint
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.supabase.auth.getSession().then(s => s.data.session?.access_token)}`
                },
                body: JSON.stringify({
                    function: functionName,
                    params: params
                })
            });
            
            if (!response.ok) {
                throw new Error(`Backend call failed: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Backend function call error:', error);
            // Fallback to direct Supabase calls for now
            return this.handleBackendFallback(functionName, params);
        }
    }
    
    // Fallback to direct Supabase calls when backend API is not available
    async handleBackendFallback(functionName, params) {
        switch (functionName) {
            case 'createUserProfile':
                return await this.createUserProfile(params.userId, params.email, params.fullName, params.mobile);
            case 'getUserChatSessions':
                return await this.getUserChatSessions();
            case 'createChatSession':
                return await this.createChatSession(params.title);
            default:
                console.warn(`Unknown backend function: ${functionName}`);
                return { success: false, error: 'Unknown function' };
        }
    }
    
    // Enhanced user profile creation that matches your backend schema
    async createUserProfile(userId, email, fullName = '', mobile = '') {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: email,
                    full_name: fullName || null,
                    mobile: mobile || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;

            console.log('User profile created successfully');
            return { success: true, data, error: null };
        } catch (error) {
            console.error('Profile creation error:', error);
            return { success: false, data: null, error: error.message };
        }
    }
    
    // Get user's chat sessions (for when they log in)
    async getUserChatSessions() {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            
            const { data, error } = await this.supabase.rpc('get_user_chat_sessions');
            
            if (error) throw error;
            
            return { success: true, data, error: null };
        } catch (error) {
            console.error('Get chat sessions error:', error);
            return { success: false, data: null, error: error.message };
        }
    }
    
    // Create a new chat session
    async createChatSession(title = 'New Chat') {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            
            const { data, error } = await this.supabase.rpc('create_chat_session', {
                session_title: title
            });
            
            if (error) throw error;
            
            return { success: true, data, error: null };
        } catch (error) {
            console.error('Create chat session error:', error);
            return { success: false, data: null, error: error.message };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate mobile number (Bangladesh format)
    validateMobile(mobile) {
        const mobileRegex = /^(\+88)?01[3-9]\d{8}$/;
        return mobileRegex.test(mobile.replace(/\s/g, ''));
    }

    // Validate password strength
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

    // Social authentication methods
    async signInWithGoogle() {
        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/user.html`
                }
            });

            if (error) throw error;

            return { success: true, data, error: null };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { success: false, data: null, error: error.message };
        }
    }

    async signInWithFacebook() {
        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/user.html`
                }
            });

            if (error) throw error;

            return { success: true, data, error: null };
        } catch (error) {
            console.error('Facebook sign in error:', error);
            return { success: false, data: null, error: error.message };
        }
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();
