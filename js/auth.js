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
        console.log('AuthManager init started...');
        
        // Wait for config to be loaded
        let configWaitCount = 0;
        while (typeof window.appConfig === 'undefined' && configWaitCount < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            configWaitCount++;
        }
        
        if (typeof window.appConfig === 'undefined') {
            console.error('Config not loaded after 5 seconds');
            return;
        }
        
        this.config = window.appConfig;
        console.log('Config loaded:', this.config);
        
        // Check if Supabase is configured
        if (!this.config.isConfigured()) {
            console.warn('Supabase not configured. Please update your configuration in js/config.js');
            return;
        }
        
        // Wait for Supabase to be loaded from CDN
        let supabaseWaitCount = 0;
        while (typeof window.supabase === 'undefined' && supabaseWaitCount < 50) {
            console.log('Waiting for Supabase to load...', supabaseWaitCount);
            await new Promise(resolve => setTimeout(resolve, 100));
            supabaseWaitCount++;
        }
        
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase not loaded after 5 seconds. Check CDN connection.');
            return;
        }
        
        try {
            const { url, anonKey } = this.config.getSupabaseConfig();
            console.log('Creating Supabase client with URL:', url);
            this.supabase = window.supabase.createClient(url, anonKey);
            console.log('Supabase client created:', this.supabase);
            
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
        } catch (error) {
            console.error('Error initializing Supabase:', error);
        }
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
                    console.log('Redirecting to user page after successful authentication');
                    window.location.href = this.config ? this.config.REDIRECT_AFTER_AUTH || 'user.html' : 'user.html';
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
                    console.log('Redirecting to homepage after logout');
                    window.location.href = this.config ? this.config.REDIRECT_AFTER_LOGOUT || 'homepage.html' : 'homepage.html';
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
    }    // Sign up new user
    async signUp(email, password, fullName = '', mobile = '') {
        try {
            console.log('SignUp called with email:', email, 'fullName:', fullName);
            
            if (!this.supabase) {
                throw new Error('Supabase client not initialized');
            }
            
            console.log('Attempting Supabase sign up...');
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

            if (error) {
                console.error('Supabase auth error:', error);
                throw error;
            }

            console.log('Sign up successful:', data);

            // Create user profile if sign up successful
            if (data.user) {
                console.log('Creating profile for user:', data.user.id);
                const profileResult = await this.createUserProfile(data.user.id, email, fullName, mobile);
                
                if (!profileResult.success) {
                    console.error('Profile creation failed:', profileResult.error);
                    // Don't fail the entire registration, but log the error
                    console.warn('User was created in auth but profile creation failed. They can still log in.');
                }
            }

            return { success: true, data, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, data: null, error: error.message };
        }
    }// Sign in existing user
    async signIn(email, password) {
        try {
            console.log('SignIn called with email:', email);
            
            if (!this.supabase) {
                throw new Error('Supabase client not initialized');
            }
            
            console.log('Attempting Supabase sign in...');
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('Supabase auth error:', error);
                throw error;
            }

            console.log('Sign in successful:', data);
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
                return await this.getUserChatSessions();            case 'createChatSession':
                return await this.createChatSession(params.title);
            default:
                console.warn(`Unknown backend function: ${functionName}`);
                return { success: false, error: 'Unknown function' };
        }
    }      // Enhanced user profile creation that matches your backend schema
    async createUserProfile(userId, email, fullName = '', mobile = '') {
        try {
            console.log('🔧 Creating user profile with:', { userId, email, fullName, mobile });
            
            // First check if profile already exists
            const { data: existingProfile, error: checkError } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.log('❌ Error checking existing profile:', checkError);
            } else if (existingProfile) {
                console.log('⚠️ Profile already exists for user:', existingProfile);
                return { success: true, data: existingProfile, error: null };
            }
            
            const profileData = {
                id: userId,
                email: email,
                full_name: fullName || null,
                mobile: mobile || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            console.log('📤 Profile data to insert:', profileData);
            
            const { data, error } = await this.supabase
                .from('profiles')
                .insert(profileData)
                .select();

            if (error) {
                console.error('❌ Supabase profile creation error:', error);
                console.log('🔍 Error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            console.log('✅ User profile created successfully:', data);
            return { success: true, data, error: null };
        } catch (error) {
            console.error('❌ Profile creation error:', error);
            
            // Let's try a simpler insert without timestamps
            try {
                console.log('🔄 Trying simpler profile creation...');
                const { data, error: simpleError } = await this.supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        email: email,
                        full_name: fullName || null,
                        mobile: mobile || null
                    })
                    .select();
                    
                if (simpleError) {
                    console.error('❌ Simple profile creation also failed:', simpleError);
                    console.log('🔍 Simple error details:', {
                        message: simpleError.message,
                        details: simpleError.details,
                        hint: simpleError.hint,
                        code: simpleError.code
                    });
                    throw simpleError;
                }
                
                console.log('✅ Simple profile creation succeeded:', data);
                return { success: true, data, error: null };
            } catch (fallbackError) {
                console.error('❌ Both profile creation attempts failed:', fallbackError);
                return { success: false, data: null, error: fallbackError.message };
            }
        }    }
      
    // Debug function to test profile creation with real registration scenario
    async debugProfileCreation() {
        try {
            console.log('🔍 === DEBUG PROFILE CREATION ===');
            
            // Step 1: Test table access
            console.log('1. Testing table access...');
            const { data: tableData, error: tableError } = await this.supabase
                .from('profiles')
                .select('*')
                .limit(1);
                
            if (tableError) {
                console.error('❌ Table access failed:', tableError);
                return;
            } else {
                console.log('✅ Table access successful. Current rows:', tableData.length);
            }
            
            // Step 2: Test with a real UUID (not a string)
            console.log('2. Testing with real UUID format...');
            const testUserId = crypto.randomUUID(); // Generate a real UUID
            console.log('Generated UUID:', testUserId);
            
            const testProfile = {
                id: testUserId,
                email: 'debug-test@example.com',
                full_name: 'Debug Test User',
                mobile: '01712345678'
            };
            
            console.log('📤 Inserting test profile:', testProfile);
            
            const { data: insertData, error: insertError } = await this.supabase
                .from('profiles')
                .insert(testProfile)
                .select();
                
            if (insertError) {
                console.error('❌ Insert failed:', insertError);
                console.log('🔍 Insert error details:', {
                    message: insertError.message,
                    details: insertError.details,
                    hint: insertError.hint,
                    code: insertError.code
                });
            } else {
                console.log('✅ Insert successful:', insertData);
                
                // Clean up
                const { error: deleteError } = await this.supabase
                    .from('profiles')
                    .delete()
                    .eq('id', testUserId);
                    
                if (deleteError) {
                    console.error('⚠️ Failed to clean up:', deleteError);
                } else {
                    console.log('✅ Test data cleaned up');
                }
            }
              console.log('🔍 === DEBUG COMPLETE ===');
            
        } catch (error) {
            console.error('❌ Debug exception:', error);
        }
    }
    
    // Simple RLS test - insert without authentication
    async testRLSDisabled() {
        try {
            console.log('🔍 === TESTING IF RLS IS DISABLED ===');
            
            // Try to insert directly without any authentication context
            const testId = crypto.randomUUID();
            const { data, error } = await this.supabase
                .from('profiles')
                .insert({
                    id: testId,
                    email: 'rls-test@example.com'
                })
                .select();
                
            if (error) {
                console.error('❌ RLS test failed:', error);
                if (error.code === '42501' || error.message.includes('row-level security')) {
                    console.log('🔒 RLS is still ENABLED - you need to disable it in Supabase Dashboard');
                    console.log('📝 Go to: Dashboard > Table Editor > profiles > click shield icon > disable RLS');
                } else {
                    console.log('❌ Different error:', error.message);
                }
                return false;
            } else {
                console.log('✅ RLS test passed - RLS is DISABLED');
                console.log('✅ Successfully inserted:', data);
                
                // Clean up
                await this.supabase.from('profiles').delete().eq('id', testId);
                console.log('✅ Test data cleaned up');
                return true;
            }
        } catch (error) {
            console.error('❌ RLS test exception:', error);
            return false;
        }
    }
      // Comprehensive test function to check profiles table
    async testProfilesTable() {
        try {
            console.log('=== COMPREHENSIVE PROFILES TABLE TEST ===');
            
            // 1. Test basic table access
            console.log('1. Testing basic table access...');
            const { data: selectData, error: selectError } = await this.supabase
                .from('profiles')
                .select('*')
                .limit(1);
                
            if (selectError) {
                console.error('❌ Error accessing profiles table:', selectError);
                console.log('Error details:', {
                    message: selectError.message,
                    details: selectError.details,
                    hint: selectError.hint,
                    code: selectError.code
                });
            } else {
                console.log('✅ Basic table access successful');
                console.log('Existing data sample:', selectData);
            }
            
            // 2. Test table schema by trying to get column info
            console.log('2. Testing table schema...');
            try {
                const { data: schemaData, error: schemaError } = await this.supabase
                    .from('profiles')
                    .select('id, email, full_name, mobile, created_at, updated_at')
                    .limit(0);
                    
                if (schemaError) {
                    console.error('❌ Schema test failed:', schemaError);
                    console.log('This suggests column name mismatch. Expected columns: id, email, full_name, mobile, created_at, updated_at');
                } else {
                    console.log('✅ Schema test passed - all expected columns exist');
                }
            } catch (schemaErr) {
                console.error('❌ Schema test exception:', schemaErr);
            }
            
            // 3. Test minimal insert
            console.log('3. Testing minimal insert...');
            const testId = 'test-id-' + Date.now();
            const minimalProfile = {
                id: testId,
                email: 'test@example.com'
            };
            
            const { data: insertData, error: insertError } = await this.supabase
                .from('profiles')
                .insert(minimalProfile)
                .select();
                
            if (insertError) {
                console.error('❌ Minimal insert failed:', insertError);
                console.log('Insert error details:', {
                    message: insertError.message,
                    details: insertError.details,
                    hint: insertError.hint,
                    code: insertError.code
                });
                
                // Check if it's an RLS issue
                if (insertError.message.includes('row-level security') || 
                    insertError.message.includes('RLS') ||
                    insertError.code === '42501') {
                    console.log('🔒 This appears to be a Row Level Security (RLS) issue');
                    console.log('💡 Solution: Either disable RLS or create proper RLS policies');
                }
            } else {
                console.log('✅ Minimal insert successful:', insertData);
                
                // Clean up test data
                const { error: deleteError } = await this.supabase
                    .from('profiles')
                    .delete()
                    .eq('id', testId);
                    
                if (deleteError) {
                    console.error('⚠️ Failed to clean up test data:', deleteError);
                } else {
                    console.log('✅ Test data cleaned up');
                }
            }
            
            // 4. Test full insert
            console.log('4. Testing full profile insert...');
            const fullTestId = 'full-test-id-' + Date.now();
            const fullProfile = {
                id: fullTestId,
                email: 'fulltest@example.com',
                full_name: 'Full Test User',
                mobile: '01712345678',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data: fullInsertData, error: fullInsertError } = await this.supabase
                .from('profiles')
                .insert(fullProfile)
                .select();
                
            if (fullInsertError) {
                console.error('❌ Full insert failed:', fullInsertError);
            } else {
                console.log('✅ Full insert successful:', fullInsertData);
                
                // Clean up
                await this.supabase
                    .from('profiles')
                    .delete()
                    .eq('id', fullTestId);
            }
            
            console.log('=== TEST COMPLETE ===');
            
        } catch (error) {
            console.error('❌ Profiles table test exception:', error);
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
