/**
 * Custom State Management System
 * Handles application state including user data, UI state, and preferences
 */
class StateManager {
    constructor() {
        this.state = {
            // User state
            user: null,
            isAuthenticated: false,
            isLoading: false,
            
            // UI state
            currentLanguage: 'en',
            isDarkMode: false,
            currentTab: 'chat',
            sidebarOpen: false,
            
            // Chat state
            chatMessages: [],
            chatHistory: [],
            
            // Service state
            userServices: [],
            notifications: [],
            
            // Error state
            errors: []
        };
        
        this.subscribers = new Map();
        this.nextSubscriberId = 1;
    }

    /**
     * Get current state
     * @param {string} key - Optional key to get specific state property
     * @returns {any} Current state or specific property
     */
    getState(key = null) {
        if (key) {
            return this.state[key];
        }
        return { ...this.state }; // Return copy to prevent direct mutation
    }

    /**
     * Update state and notify subscribers
     * @param {Object} updates - Object with state updates
     * @param {boolean} silent - If true, don't notify subscribers
     */
    setState(updates, silent = false) {
        const previousState = { ...this.state };
        
        // Update state
        Object.assign(this.state, updates);
        
        // Notify subscribers if not silent
        if (!silent) {
            this.notifySubscribers(previousState, this.state);
        }
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback - Function to call when state changes
     * @param {Array} keys - Optional array of state keys to watch
     * @returns {number} Subscriber ID for unsubscribing
     */
    subscribe(callback, keys = null) {
        const subscriberId = this.nextSubscriberId++;
        this.subscribers.set(subscriberId, { callback, keys });
        return subscriberId;
    }

    /**
     * Unsubscribe from state changes
     * @param {number} subscriberId - ID returned from subscribe
     */
    unsubscribe(subscriberId) {
        this.subscribers.delete(subscriberId);
    }

    /**
     * Notify all subscribers of state changes
     * @param {Object} previousState - Previous state
     * @param {Object} currentState - Current state
     */
    notifySubscribers(previousState, currentState) {
        this.subscribers.forEach(({ callback, keys }) => {
            if (keys) {
                // Only notify if watched keys changed
                const hasChanges = keys.some(key => 
                    previousState[key] !== currentState[key]
                );
                if (hasChanges) {
                    callback(currentState, previousState);
                }
            } else {
                // Notify for any state change
                callback(currentState, previousState);
            }
        });
    }

    // User state methods
    setUser(user) {
        this.setState({
            user,
            isAuthenticated: !!user
        });
    }

    clearUser() {
        this.setState({
            user: null,
            isAuthenticated: false,
            userServices: [],
            notifications: []
        });
    }

    setLoading(isLoading) {
        this.setState({ isLoading });
    }

    // UI state methods
    setLanguage(language) {
        this.setState({ currentLanguage: language });
        localStorage.setItem('language', language);
    }

    setDarkMode(isDarkMode) {
        this.setState({ isDarkMode });
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    }

    setCurrentTab(tab) {
        this.setState({ currentTab: tab });
    }

    setSidebarOpen(isOpen) {
        this.setState({ sidebarOpen: isOpen });
    }

    // Chat state methods
    addChatMessage(message) {
        const chatMessages = [...this.state.chatMessages, message];
        this.setState({ chatMessages });
    }

    clearChatMessages() {
        this.setState({ chatMessages: [] });
    }

    // Service state methods
    setUserServices(services) {
        this.setState({ userServices: services });
    }

    addNotification(notification) {
        const notifications = [...this.state.notifications, notification];
        this.setState({ notifications });
    }

    removeNotification(notificationId) {
        const notifications = this.state.notifications.filter(
            n => n.id !== notificationId
        );
        this.setState({ notifications });
    }

    // Error handling
    addError(error) {
        const errors = [...this.state.errors, {
            id: Date.now(),
            message: error,
            timestamp: new Date()
        }];
        this.setState({ errors });
    }

    clearErrors() {
        this.setState({ errors: [] });
    }

    // Initialize state from localStorage
    initializeFromStorage() {
        const language = localStorage.getItem('language') || 'en';
        const darkMode = localStorage.getItem('darkMode') === 'enabled';
        
        this.setState({
            currentLanguage: language,
            isDarkMode: darkMode
        }, true); // Silent update to avoid triggering subscribers
    }

    // Debug method
    logState() {
        console.log('Current State:', this.state);
    }
}

// Create singleton instance
const stateManager = new StateManager();

// Initialize from storage
stateManager.initializeFromStorage();

// Export for use in other modules
window.StateManager = StateManager;
window.stateManager = stateManager; 