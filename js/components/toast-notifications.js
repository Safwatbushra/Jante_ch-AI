// Modern toast notification system for better user feedback

class ToastNotifications {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.maxToasts = 5;
        this.defaultDuration = 5000;
        this.init();
    }

    init() {
        this.createContainer();
        this.setupStyles();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    setupStyles() {
        if (document.getElementById('toast-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 350px;
                pointer-events: none;
            }

            .toast {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-bottom: 10px;
                padding: 16px;
                display: flex;
                align-items: flex-start;
                transform: translateX(100%);
                transition: all 0.3s ease;
                pointer-events: auto;
                border-left: 4px solid;
                min-height: 60px;
            }

            .toast.show {
                transform: translateX(0);
            }

            .toast.hide {
                transform: translateX(100%);
                opacity: 0;
            }

            .toast-success {
                border-left-color: #28a745;
            }

            .toast-error {
                border-left-color: #dc3545;
            }

            .toast-warning {
                border-left-color: #ffc107;
            }

            .toast-info {
                border-left-color: #17a2b8;
            }

            .toast-icon {
                margin-right: 12px;
                font-size: 20px;
                flex-shrink: 0;
                margin-top: 2px;
            }

            .toast-success .toast-icon {
                color: #28a745;
            }

            .toast-error .toast-icon {
                color: #dc3545;
            }

            .toast-warning .toast-icon {
                color: #ffc107;
            }

            .toast-info .toast-icon {
                color: #17a2b8;
            }

            .toast-content {
                flex: 1;
            }

            .toast-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: #333;
            }

            .toast-message {
                color: #666;
                font-size: 14px;
                line-height: 1.4;
            }

            .toast-close {
                background: none;
                border: none;
                font-size: 18px;
                color: #999;
                cursor: pointer;
                padding: 0;
                margin-left: 12px;
                flex-shrink: 0;
            }

            .toast-close:hover {
                color: #666;
            }

            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: currentColor;
                opacity: 0.3;
                transition: width linear;
                border-radius: 0 0 8px 8px;
            }

            @media (max-width: 480px) {
                .toast-container {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                    max-width: none;
                }

                .toast {
                    margin-bottom: 8px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    show(message, type = 'info', options = {}) {
        const id = this.generateId();
        const toast = this.createToast(id, message, type, options);
        
        this.addToast(id, toast, options.duration);
        return id;
    }

    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', { duration: 0, ...options });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    createToast(id, message, type, options) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('data-toast-id', id);

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                ${options.title !== false ? `<div class="toast-title">${options.title || titles[type]}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="window.toastNotifications.dismiss('${id}')">&times;</button>
            ${options.duration > 0 ? '<div class="toast-progress"></div>' : ''}
        `;

        return toast;
    }

    addToast(id, toast, duration) {
        // Remove excess toasts
        this.limitToasts();

        // Add to container
        this.container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Setup auto-dismiss
        let timeoutId = null;
        if (duration > 0) {
            const progressBar = toast.querySelector('.toast-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.transitionDuration = `${duration}ms`;
                setTimeout(() => {
                    progressBar.style.width = '0';
                }, 10);
            }

            timeoutId = setTimeout(() => {
                this.dismiss(id);
            }, duration);
        }

        // Store toast reference
        this.toasts.set(id, {
            element: toast,
            timeoutId,
            duration: duration || this.defaultDuration
        });
    }

    dismiss(id) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;

        const { element, timeoutId } = toastData;

        // Clear timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Animate out
        element.classList.add('hide');

        // Remove from DOM
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(id);
        }, 300);
    }

    dismissAll() {
        for (const id of this.toasts.keys()) {
            this.dismiss(id);
        }
    }

    limitToasts() {
        if (this.toasts.size >= this.maxToasts) {
            const oldestId = this.toasts.keys().next().value;
            this.dismiss(oldestId);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Update existing toast
    update(id, message, type) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;

        const messageElement = toastData.element.querySelector('.toast-message');
        if (messageElement) {
            messageElement.textContent = message;
        }

        if (type) {
            const toast = toastData.element;
            toast.className = `toast toast-${type} show`;
        }
    }
}

// Initialize global toast notifications
window.toastNotifications = new ToastNotifications();

// Setup AuthManager to use toast notifications (disabled for auth.html)
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the auth page - if so, don't override the notifications
    const isAuthPage = window.location.pathname.includes('auth.html') || 
                      document.getElementById('registerForm') !== null ||
                      document.getElementById('loginForm') !== null;
    
    if (isAuthPage) {
        console.log('🔄 Skipping toast notification overrides on auth page');
        return; // Don't override auth notifications on the auth page
    }

    if (window.authManager) {
        window.authManager.setErrorFeedbackCallback = null; // Remove old callback method
        
        // Override the auth manager methods to use toast notifications
        const originalSignIn = window.authManager.signInUser.bind(window.authManager);
        window.authManager.signInUser = async function(credentials) {
            const result = await originalSignIn(credentials);
            if (result.success) {
                window.toastNotifications.success('Login successful!');
            } else {
                window.toastNotifications.error(result.error);
            }
            return result;
        };

        const originalSignUp = window.authManager.registerUser.bind(window.authManager);
        window.authManager.registerUser = async function(userData) {
            const result = await originalSignUp(userData);
            if (result.success) {
                window.toastNotifications.success('Registration successful!');
            } else {
                window.toastNotifications.error(result.error);
            }
            return result;
        };

        const originalSignOut = window.authManager.signOut.bind(window.authManager);
        window.authManager.signOut = async function() {
            const result = await originalSignOut();
            if (result.success) {
                window.toastNotifications.info('You have been logged out');
            }
            return result;
        };
    }
});
