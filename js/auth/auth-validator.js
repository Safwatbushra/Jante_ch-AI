// Authentication Validation Utilities
class AuthValidator {
    // Email validation
    static validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { isValid: false, message: 'Email is required' };
        }

        const trimmedEmail = email.trim().toLowerCase();
        
        if (!AuthConfig.VALIDATION.EMAIL.test(trimmedEmail)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }

        return { isValid: true, message: 'Email is valid' };
    }

    // Mobile validation (Bangladesh format)
    static validateMobile(mobile) {
        if (!mobile || typeof mobile !== 'string') {
            return { isValid: false, message: 'Mobile number is required' };
        }

        const cleanMobile = mobile.replace(/\s/g, '');
        
        if (!AuthConfig.VALIDATION.MOBILE.test(cleanMobile)) {
            return { 
                isValid: false, 
                message: 'Please enter a valid Bangladeshi mobile number (01XXXXXXXXX)' 
            };
        }

        return { isValid: true, message: 'Mobile number is valid' };
    }

    // Password validation
    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { 
                isValid: false, 
                message: 'Password is required',
                strength: 0
            };
        }

        const checks = {
            minLength: password.length >= AuthConfig.VALIDATION.PASSWORD_MIN_LENGTH,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const passedChecks = Object.values(checks).filter(Boolean).length;
        const strength = Math.min(passedChecks, 5);

        const messages = [];
        if (!checks.minLength) messages.push(`At least ${AuthConfig.VALIDATION.PASSWORD_MIN_LENGTH} characters`);
        if (!checks.hasUpper) messages.push('One uppercase letter');
        if (!checks.hasLower) messages.push('One lowercase letter');
        if (!checks.hasNumber) messages.push('One number');

        const isValid = checks.minLength && checks.hasUpper && checks.hasLower && checks.hasNumber;

        return {
            isValid,
            strength,
            checks,
            message: isValid ? 'Password is strong' : `Password must contain: ${messages.join(', ')}`
        };
    }

    // Name validation
    static validateName(name) {
        if (!name || typeof name !== 'string') {
            return { isValid: false, message: 'Full name is required' };
        }

        const trimmedName = name.trim();
        
        if (trimmedName.length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters long' };
        }

        if (trimmedName.length > 50) {
            return { isValid: false, message: 'Name must be less than 50 characters' };
        }

        return { isValid: true, message: 'Name is valid' };
    }

    // Password confirmation validation
    static validatePasswordConfirmation(password, confirmPassword) {
        if (!confirmPassword) {
            return { isValid: false, message: 'Please confirm your password' };
        }

        if (password !== confirmPassword) {
            return { isValid: false, message: 'Passwords do not match' };
        }

        return { isValid: true, message: 'Passwords match' };
    }

    // Form validation
    static validateLoginForm(formData) {
        const errors = {};
        
        const emailValidation = this.validateEmail(formData.email);
        if (!emailValidation.isValid) {
            errors.email = emailValidation.message;
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }    static validateRegisterForm(formData) {
        const errors = {};

        const nameValidation = this.validateName(formData.fullName);
        if (!nameValidation.isValid) {
            errors.fullName = nameValidation.message;
        }

        const emailValidation = this.validateEmail(formData.email);
        if (!emailValidation.isValid) {
            errors.email = emailValidation.message;
        }

        if (formData.mobile) {
            const mobileValidation = this.validateMobile(formData.mobile);
            if (!mobileValidation.isValid) {
                errors.mobile = mobileValidation.message;
            }
        }

        const passwordValidation = this.validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            errors.password = passwordValidation.message;
        }

        const confirmPasswordValidation = this.validatePasswordConfirmation(
            formData.password, 
            formData.confirmPassword
        );
        if (!confirmPasswordValidation.isValid) {
            errors.confirmPassword = confirmPasswordValidation.message;
        }

        if (!formData.agreeTerms) {
            errors.agreeTerms = 'You must agree to the Terms & Conditions';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            passwordStrength: passwordValidation.strength
        };
    }

    // Get password strength info
    static getPasswordStrengthInfo(strength) {
        const levels = [
            { label: 'Very Weak', color: '#dc3545', percentage: 20 },
            { label: 'Weak', color: '#fd7e14', percentage: 40 },
            { label: 'Fair', color: '#ffc107', percentage: 60 },
            { label: 'Good', color: '#20c997', percentage: 80 },
            { label: 'Strong', color: '#28a745', percentage: 100 }
        ];

        return levels[Math.min(strength, 4)] || levels[0];
    }

    // Sanitize input
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.trim().replace(/[<>]/g, '');
    }
}

window.AuthValidator = AuthValidator;
