// Client-side configuration for Jante ChAi
// This file handles configuration for the frontend

class Config {    constructor() {
        // Supabase configuration - using actual project credentials
        this.SUPABASE_URL = 'https://wjgqdbgpmapeqownljri.supabase.co';
        this.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZ3FkYmdwbWFwZXFvd25sanJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODIzOTMsImV4cCI6MjA2NTg1ODM5M30.mZEM4eXlqoVRrjR8w6SQu44zWubvzqPyWs_kePtKne8';
        
        // App configuration
        this.APP_NAME = 'Jante ChAi';
        this.REDIRECT_AFTER_AUTH = '/user.html';
        this.REDIRECT_AFTER_LOGOUT = '/homepage.html';
        
        // Development mode detection
        this.IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // Load from environment if available (for development)
        this.loadFromEnvironment();
    }
    
    loadFromEnvironment() {
        // This would work if you're serving through a build process
        // For now, this is a placeholder for future enhancement
        if (this.IS_DEV) {
            console.log('Running in development mode');
        }
    }
    
    // Validation
    isConfigured() {
        return this.SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
               this.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
    }
    
    getSupabaseConfig() {
        return {
            url: this.SUPABASE_URL,
            anonKey: this.SUPABASE_ANON_KEY
        };
    }
}

// Create global config instance
window.appConfig = new Config();
console.log('Config created:', window.appConfig);
console.log('Config isConfigured:', window.appConfig.isConfigured());
console.log('Supabase config:', window.appConfig.getSupabaseConfig());
