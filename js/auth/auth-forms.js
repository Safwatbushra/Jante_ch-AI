// Form Handler for Authentication
class AuthFormHandler {
    constructor() {
        this.isEnglish = () => !document.body.classList.contains('bn');
        this.authManager = window.authManager;
        
        // Initialize when authManager is ready
        this.initializeWhenReady();
    }

    async initializeWhenReady() {
        // Wait for authManager to be available
        let attempts = 0;
        while (!this.authManager && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            this.authManager = window.authManager;
            attempts++;
        }

        if (!this.authManager) {
            console.error('❌ AuthManager not available');
            return;
        }

        // Wait for authManager to be initialized
        await this.authManager.initialize();
        
        // Initialize form handlers
        this.initializeFormHandlers();
        this.initializeValidation();
    }

    initializeFormHandlers() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Social login buttons
        const facebookLogin = document.getElementById('facebookLogin');
        if (facebookLogin) {
            facebookLogin.addEventListener('click', (e) => this.handleSocialLogin(e, 'facebook'));
        }

        const googleLogin = document.getElementById('googleLogin');
        if (googleLogin) {
            googleLogin.addEventListener('click', (e) => this.handleSocialLogin(e, 'google'));
        }

        console.log('✅ Auth form handlers initialized');
    }

    initializeValidation() {
        // Real-time validation for login form
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');

        if (loginEmail) {
            loginEmail.addEventListener('blur', () => this.validateLoginField('email'));
            loginEmail.addEventListener('input', () => this.clearValidation('loginEmail'));
        }

        if (loginPassword) {
            loginPassword.addEventListener('blur', () => this.validateLoginField('password'));
            loginPassword.addEventListener('input', () => this.clearValidation('loginPassword'));
        }

        // Real-time validation for register form
        const registerName = document.getElementById('registerName');
        const registerEmail = document.getElementById('registerEmail');
        const registerMobile = document.getElementById('registerMobile');
        const registerPassword = document.getElementById('registerPassword');
        const registerConfirmPassword = document.getElementById('registerConfirmPassword');

        if (registerName) {
            registerName.addEventListener('blur', () => this.validateRegisterField('name'));
            registerName.addEventListener('input', () => this.clearValidation('registerName'));
        }

        if (registerEmail) {
            registerEmail.addEventListener('blur', () => this.validateRegisterField('email'));
            registerEmail.addEventListener('input', () => this.clearValidation('registerEmail'));
        }

        if (registerMobile) {
            registerMobile.addEventListener('blur', () => this.validateRegisterField('mobile'));
            registerMobile.addEventListener('input', () => this.clearValidation('registerMobile'));
        }

        if (registerPassword) {
            registerPassword.addEventListener('input', () => this.handlePasswordInput());
            registerPassword.addEventListener('blur', () => this.validateRegisterField('password'));
        }

        if (registerConfirmPassword) {
            registerConfirmPassword.addEventListener('blur', () => this.validateRegisterField('confirmPassword'));
            registerConfirmPassword.addEventListener('input', () => this.clearValidation('registerConfirmPassword'));
        }
    }

    // Login form handler
    async handleLogin(event) {
        event.preventDefault();

        const loginBtn = document.getElementById('loginBtn');
        const loginSpinner = document.getElementById('loginSpinner');
        const form = document.getElementById('loginForm');        if (!this.authManager) {
            this.showNotification(
                this.isEnglish() 
                    ? 'Authentication service is temporarily unavailable. Please refresh the page and try again.' 
                    : 'প্রমাণীকরণ সেবা সাময়িকভাবে অনুপলব্ধ। অনুগ্রহ করে পৃষ্ঠা রিফ্রেশ করে আবার চেষ্টা করুন।',
                'error'
            );
            return;
        }

        // Get form data
        const formData = new FormData(form);
        const email = formData.get('loginEmail').trim();
        const password = formData.get('loginPassword');
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        // Enhanced validation with specific messages
        if (!email) {
            this.showNotification(
                this.isEnglish() ? 'Please enter your email address' : 'অনুগ্রহ করে আপনার ইমেইল ঠিকানা লিখুন',
                'warning'
            );
            document.getElementById('loginEmail')?.focus();
            return;
        }

        if (!password) {
            this.showNotification(
                this.isEnglish() ? 'Please enter your password' : 'অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন',
                'warning'
            );
            document.getElementById('loginPassword')?.focus();
            return;
        }

        // Validate email format
        const emailValidation = AuthValidator.validateEmail(email);
        if (!emailValidation.isValid) {
            this.showNotification(
                this.isEnglish() ? 'Please enter a valid email address' : 'অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা লিখুন',
                'warning'
            );
            document.getElementById('loginEmail')?.focus();
            return;
        }

        // Show loading
        this.setFormLoading(loginBtn, loginSpinner, true);

        try {
            const result = await this.authManager.signInUser(email, password, rememberMe);

            if (result.success) {
                this.showNotification(
                    this.isEnglish() ? 'Login successful! Redirecting...' : 'সফলভাবে লগইন হয়েছে! রিডাইরেক্ট করা হচ্ছে...',
                    'success'
                );

                // Clear form
                form.reset();
                this.clearAllValidation('loginForm');

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'user.html';
                }, 1500);

            } else {
                let errorMessage = result.error;
                
                // Customize error messages
                if (errorMessage.includes('Invalid') || errorMessage.includes('credentials')) {
                    errorMessage = this.isEnglish() 
                        ? 'Invalid email or password. Please check your credentials and try again.'
                        : 'ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে আপনার তথ্য পরীক্ষা করে আবার চেষ্টা করুন।';
                } else if (errorMessage.includes('not found')) {
                    errorMessage = this.isEnglish()
                        ? 'No account found with this email. Please register first.'
                        : 'এই ইমেইলের সাথে কোন অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে প্রথমে রেজিস্টার করুন।';
                }

                this.showNotification(errorMessage, 'error');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showNotification(
                this.isEnglish() ? 'Login failed. Please try again.' : 'লগইন ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
                'error'
            );
        } finally {
            this.setFormLoading(loginBtn, loginSpinner, false);
        }
    }

    // Register form handler
    async handleRegister(event) {
        event.preventDefault();

        const registerBtn = document.getElementById('registerBtn');
        const registerSpinner = document.getElementById('registerSpinner');
        const form = document.getElementById('registerForm');
        const agreeTerms = document.getElementById('agreeTerms');

        if (!this.authManager) {
            this.showNotification(
                this.isEnglish() ? 'Authentication service not available' : 'প্রমাণীকরণ সেবা উপলব্ধ নেই',
                'error'
            );
            return;
        }

        // Get form data
        const formData = new FormData(form);
        const fullName = formData.get('registerName').trim();
        const email = formData.get('registerEmail').trim();
        const mobile = formData.get('registerMobile').trim();
        const password = formData.get('registerPassword');
        const confirmPassword = formData.get('registerConfirmPassword');

        // Validate
        const validation = AuthValidator.validateRegisterForm({
            fullName,
            email,
            mobile,
            password,
            confirmPassword,
            agreeTerms: agreeTerms?.checked
        });

        if (!validation.isValid) {
            const firstError = Object.values(validation.errors)[0];
            this.showNotification(firstError, 'error');
            return;
        }

        // Show loading
        this.setFormLoading(registerBtn, registerSpinner, true);

        try {
            const result = await this.authManager.registerUser(email, password, fullName, mobile);

            if (result.success) {
                this.showNotification(
                    this.isEnglish() 
                        ? 'Registration successful! You are now logged in. Redirecting...' 
                        : 'সফলভাবে রেজিস্ট্রেশন হয়েছে! আপনি এখন লগইন করেছেন। রিডাইরেক্ট করা হচ্ছে...',
                    'success'
                );

                // Clear form
                form.reset();
                this.clearAllValidation('registerForm');

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'user.html';
                }, 2000);

            } else {
                let errorMessage = result.error;
                
                // Customize error messages
                if (errorMessage.includes('already exists')) {
                    errorMessage = this.isEnglish()
                        ? 'An account with this email already exists. Please try logging in instead.'
                        : 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে লগইন করার চেষ্টা করুন।';
                }

                this.showNotification(errorMessage, 'error');
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification(
                this.isEnglish() ? 'Registration failed. Please try again.' : 'রেজিস্ট্রেশন ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
                'error'
            );
        } finally {
            this.setFormLoading(registerBtn, registerSpinner, false);
        }
    }

    // Social login handler
    handleSocialLogin(event, provider) {
        event.preventDefault();
        
        const message = provider === 'facebook' 
            ? (this.isEnglish() ? 'Facebook login coming soon!' : 'ফেসবুক লগইন শীঘ্রই আসছে!')
            : (this.isEnglish() ? 'Google login coming soon!' : 'গুগল লগইন শীঘ্রই আসছে!');
            
        this.showNotification(message, 'info');
    }

    // Validation methods
    validateLoginField(fieldType) {
        if (fieldType === 'email') {
            const emailField = document.getElementById('loginEmail');
            const validation = AuthValidator.validateEmail(emailField.value);
            this.showFieldValidation('loginEmail', validation);
        } else if (fieldType === 'password') {
            const passwordField = document.getElementById('loginPassword');
            const value = passwordField.value;
            
            if (!value) {
                this.showFieldValidation('loginPassword', {
                    isValid: false,
                    message: this.isEnglish() ? 'Password is required' : 'পাসওয়ার্ড প্রয়োজন'
                });
            } else {
                // For login, we don't show validation for existing passwords
                this.clearValidation('loginPassword');
            }
        }
    }

    validateRegisterField(fieldType) {
        switch (fieldType) {
            case 'name':
                const nameField = document.getElementById('registerName');
                const nameValidation = AuthValidator.validateName(nameField.value);
                this.showFieldValidation('registerName', nameValidation);
                break;

            case 'email':
                const emailField = document.getElementById('registerEmail');
                const emailValidation = AuthValidator.validateEmail(emailField.value);
                this.showFieldValidation('registerEmail', emailValidation);
                break;

            case 'mobile':
                const mobileField = document.getElementById('registerMobile');
                if (mobileField.value.trim()) {
                    const mobileValidation = AuthValidator.validateMobile(mobileField.value);
                    this.showFieldValidation('registerMobile', mobileValidation);
                } else {
                    this.clearValidation('registerMobile');
                }
                break;

            case 'password':
                const passwordField = document.getElementById('registerPassword');
                const passwordValidation = AuthValidator.validatePassword(passwordField.value);
                // Don't show green checkmark for passwords, just clear errors if valid
                if (passwordValidation.isValid) {
                    this.clearValidation('registerPassword');
                } else {
                    this.showFieldValidation('registerPassword', passwordValidation);
                }
                break;

            case 'confirmPassword':
                const passwordField2 = document.getElementById('registerPassword');
                const confirmPasswordField = document.getElementById('registerConfirmPassword');
                const confirmValidation = AuthValidator.validatePasswordConfirmation(
                    passwordField2.value, 
                    confirmPasswordField.value
                );
                if (confirmValidation.isValid) {
                    this.clearValidation('registerConfirmPassword');
                } else {
                    this.showFieldValidation('registerConfirmPassword', confirmValidation);
                }
                break;
        }
    }

    // Password strength indicator
    handlePasswordInput() {
        const passwordField = document.getElementById('registerPassword');
        const strengthContainer = document.getElementById('passwordStrength');
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');

        if (!passwordField || !strengthContainer) return;

        const password = passwordField.value;

        if (password.length > 0) {
            strengthContainer.style.display = 'block';
            
            const validation = AuthValidator.validatePassword(password);
            const strengthInfo = AuthValidator.getPasswordStrengthInfo(validation.strength);
            
            strengthFill.style.width = strengthInfo.percentage + '%';
            strengthFill.style.backgroundColor = strengthInfo.color;
            strengthText.textContent = this.isEnglish() ? strengthInfo.label : this.translateStrength(strengthInfo.label);
            strengthText.style.color = strengthInfo.color;
        } else {
            strengthContainer.style.display = 'none';
        }
    }

    translateStrength(strengthLabel) {
        const translations = {
            'Very Weak': 'খুবই দুর্বল',
            'Weak': 'দুর্বল',
            'Fair': 'মাঝারি',
            'Good': 'ভাল',
            'Strong': 'শক্তিশালী'
        };
        return translations[strengthLabel] || strengthLabel;
    }

    // UI helper methods
    showFieldValidation(fieldId, validation) {
        const field = document.getElementById(fieldId);
        const messageElement = document.getElementById(fieldId + 'Message');

        if (!field || !messageElement) return;

        if (validation.isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            messageElement.className = 'validation-message success show';
            messageElement.textContent = this.isEnglish() ? 'Looks good!' : 'ঠিক আছে!';
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            messageElement.className = 'validation-message error show';
            messageElement.textContent = validation.message;
        }
    }

    clearValidation(fieldId) {
        const field = document.getElementById(fieldId);
        const messageElement = document.getElementById(fieldId + 'Message');

        if (field) {
            field.classList.remove('is-valid', 'is-invalid');
        }
        
        if (messageElement) {
            messageElement.classList.remove('show');
        }
    }

    clearAllValidation(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const fields = form.querySelectorAll('.form-control');
        const messages = form.querySelectorAll('.validation-message');

        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });

        messages.forEach(message => {
            message.classList.remove('show');
        });
    }

    setFormLoading(button, spinner, isLoading) {
        if (button) {
            button.disabled = isLoading;
        }
        if (spinner) {
            spinner.style.display = isLoading ? 'inline-block' : 'none';
        }
    }

    showNotification(message, type = 'success') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authFormHandler = new AuthFormHandler();
});
