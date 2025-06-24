class ChatAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.currentSessionId = null;
    }

    // Get authentication token from localStorage
    getAuthToken() {
        // Use the same storage key as the auth system
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        console.log('[DEBUG] ChatAPI - Retrieved token:', token ? 'Token found' : 'No token found');
        return token;
    }

    // Create headers with authentication
    getHeaders() {
        const token = this.getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
        console.log('[DEBUG] ChatAPI - Request headers:', headers);
        return headers;
    }

    // Start a new chat session
    async startNewSession(title = 'New Chat') {
        try {
            const response = await fetch(`${this.baseURL}/api/chat/new-session`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ title })
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to create chat session');
            }

            this.currentSessionId = data.data.sessionId;
            return data.data.sessionId;
        } catch (error) {
            console.error('Error starting new chat session:', error);
            throw error;
        }
    }

    // Send a message and get AI response
    async sendMessage(message, sessionId = null) {
        try {
            const targetSessionId = sessionId || this.currentSessionId;
            
            if (!targetSessionId) {
                // Create new session if none exists
                await this.startNewSession();
            }

            const response = await fetch(`${this.baseURL}/api/chat/message`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    message: message,
                    sessionId: targetSessionId || this.currentSessionId
                })
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to send message');
            }

            return {
                response: data.data.response,
                sessionId: data.data.sessionId,
                usage: data.data.usage
            };
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    // Get chat sessions for the user
    async getChatSessions() {
        try {
            const response = await fetch(`${this.baseURL}/api/chat/sessions`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to get chat sessions');
            }

            return data.data;
        } catch (error) {
            console.error('Error getting chat sessions:', error);
            throw error;
        }
    }

    // Set current session ID
    setCurrentSession(sessionId) {
        this.currentSessionId = sessionId;
    }

    // Get current session ID
    getCurrentSession() {
        return this.currentSessionId;
    }
}

// Export for use in other files
window.ChatAPI = ChatAPI; 