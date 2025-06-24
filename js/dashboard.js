/* ===== DASHBOARD FUNCTIONALITY ===== */

class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateStats();
        this.loadRecentActivity();
    }

    loadUserData() {
        // Load user data from localStorage or API
        const userData = JSON.parse(localStorage.getItem('userData')) || {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+880 1234 567890',
            joinDate: '2024-01-15',
            lastLogin: '2024-06-24'
        };

        this.updateUserProfile(userData);
    }

    updateUserProfile(userData) {
        // Update profile avatar
        const avatar = document.querySelector('.profile-avatar');
        if (avatar) {
            avatar.textContent = userData.name.split(' ').map(n => n[0]).join('').toUpperCase();
        }

        // Update profile info
        const nameElement = document.querySelector('.profile-info h2');
        if (nameElement) {
            nameElement.textContent = userData.name;
        }

        const emailElement = document.querySelector('.profile-info p');
        if (emailElement) {
            emailElement.textContent = userData.email;
        }

        // Update detail values
        const detailElements = {
            'email': userData.email,
            'phone': userData.phone,
            'joinDate': new Date(userData.joinDate).toLocaleDateString(),
            'lastLogin': new Date(userData.lastLogin).toLocaleDateString()
        };

        Object.keys(detailElements).forEach(key => {
            const element = document.querySelector(`[data-detail="${key}"]`);
            if (element) {
                element.textContent = detailElements[key];
            }
        });
    }

    updateStats() {
        // Update dashboard statistics
        const stats = {
            'services': 12,
            'requests': 45,
            'completed': 38,
            'pending': 7
        };

        Object.keys(stats).forEach(key => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                element.textContent = stats[key];
            }
        });
    }

    loadRecentActivity() {
        const activities = [
            {
                icon: 'fas fa-file-alt',
                title: 'Service Request Submitted',
                time: '2 hours ago',
                type: 'request'
            },
            {
                icon: 'fas fa-check-circle',
                title: 'Document Verification Completed',
                time: '1 day ago',
                type: 'completed'
            },
            {
                icon: 'fas fa-clock',
                title: 'Application Under Review',
                time: '3 days ago',
                type: 'pending'
            },
            {
                icon: 'fas fa-user-edit',
                title: 'Profile Updated',
                time: '1 week ago',
                type: 'profile'
            }
        ];

        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <li class="activity-item">
                    <div class="activity-icon">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                </li>
            `).join('');
        }
    }

    setupEventListeners() {
        // Quick action buttons
        const quickActions = document.querySelectorAll('.quick-action-btn');
        quickActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });

        // Dashboard card interactions
        const dashboardCards = document.querySelectorAll('.dashboard-card');
        dashboardCards.forEach(card => {
            card.addEventListener('click', () => {
                const cardType = card.getAttribute('data-card-type');
                this.handleCardClick(cardType);
            });
        });
    }

    handleQuickAction(action) {
        const actions = {
            'new-request': () => {
                showNotification('Redirecting to new service request form...', 'info');
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 1500);
            },
            'view-services': () => {
                showNotification('Loading available services...', 'info');
                setTimeout(() => {
                    window.location.href = 'homepage.html#services';
                }, 1500);
            },
            'download-docs': () => {
                showNotification('Preparing documents for download...', 'info');
                // Simulate download
                setTimeout(() => {
                    showNotification('Documents downloaded successfully!', 'success');
                }, 2000);
            },
            'contact-support': () => {
                showNotification('Opening support chat...', 'info');
                // Simulate support chat
                setTimeout(() => {
                    showNotification('Support chat is currently offline. Please try again later.', 'warning');
                }, 1500);
            }
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    handleCardClick(cardType) {
        const cardActions = {
            'services': () => {
                showNotification('Loading service details...', 'info');
                setTimeout(() => {
                    window.location.href = 'homepage.html#services';
                }, 1000);
            },
            'requests': () => {
                showNotification('Loading request history...', 'info');
                // Simulate loading requests
                setTimeout(() => {
                    showNotification('Request history loaded successfully!', 'success');
                }, 1500);
            },
            'documents': () => {
                showNotification('Loading document center...', 'info');
                // Simulate loading documents
                setTimeout(() => {
                    showNotification('Document center is being prepared...', 'info');
                }, 1500);
            }
        };

        if (cardActions[cardType]) {
            cardActions[cardType]();
        }
    }

    // Utility method to show notifications
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
    console.log('✅ Dashboard initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
} 