/* ===== GLOBAL NOTIFICATION SYSTEM ===== */

class NotificationManager {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'success', duration = null) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Create notification content with icon
        const iconMap = {
            'success': '<i class="fas fa-check-circle"></i>',
            'error': '<i class="fas fa-exclamation-circle"></i>',
            'warning': '<i class="fas fa-exclamation-triangle"></i>',
            'info': '<i class="fas fa-info-circle"></i>'
        };
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                ${iconMap[type] || iconMap['info']}
                <span>${message}</span>
                <button type="button" onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; margin-left: auto; cursor: pointer; font-size: 16px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        this.container.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-hide duration based on type and message length
        if (duration === null) {
            const baseTime = 3000;
            const messageLength = message.length;
            const typeMultiplier = {
                'error': 1.5,
                'warning': 1.3,
                'info': 1.2,
                'success': 1
            };
            
            duration = Math.min(
                Math.max(baseTime, messageLength * 50), 
                8000
            ) * (typeMultiplier[type] || 1);
        }
        
        // Auto-hide notification
        const hideTimeout = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);
        
        // Allow manual close to cancel auto-hide
        notification.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-times') || e.target.tagName === 'BUTTON') {
                clearTimeout(hideTimeout);
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        });
        
        return notification;
    }

    success(message, duration = null) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = null) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = null) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = null) {
        return this.show(message, 'info', duration);
    }
}

// Create global instance when DOM is ready
let notificationManager;

document.addEventListener('DOMContentLoaded', () => {
    notificationManager = new NotificationManager();
    
    // Make globally available
    window.showNotification = (message, type = 'success', duration = null) => {
        return notificationManager.show(message, type, duration);
    };

    // Convenience methods
    window.showSuccess = (message, duration) => notificationManager.success(message, duration);
    window.showError = (message, duration) => notificationManager.error(message, duration);
    window.showWarning = (message, duration) => notificationManager.warning(message, duration);
    window.showInfo = (message, duration) => notificationManager.info(message, duration);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
} 