// Navigation scroll effect
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Hero form submission
const heroForm = document.querySelector('.hero-form');
if (heroForm) {
    heroForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = this.querySelector('input');
        const question = input.value.trim();
        
        if (question) {
            // Store the question and redirect to chat page
            sessionStorage.setItem('userQuestion', question);
            window.location.href = 'chat.html';
        }
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.topic-card, .features-content, .demo-content');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Button click effects
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple effect styles
const style = document.createElement('style');
style.textContent = `
    .btn-primary {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==============================================
// AUTHENTICATION FUNCTIONALITY
// ==============================================

// Initialize authentication functionality
function initAuth() {
    if (!document.querySelector('.auth-container')) return;
    
    // Tab switching
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.tab === 'login') {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
            }
        });
    });

    // Form validation functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(inputId, errorId, message) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input && error) {
            input.classList.add('error');
            error.textContent = message;
        }
    }

    function clearError(inputId, errorId) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input && error) {
            input.classList.remove('error');
            error.textContent = '';
        }
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            let isValid = true;
            
            // Clear previous errors
            clearError('loginEmail', 'loginEmailError');
            clearError('loginPassword', 'loginPasswordError');
            
            if (!validateEmail(email)) {
                showError('loginEmail', 'loginEmailError', 'Please enter a valid email address');
                isValid = false;
            }
            
            if (password.length < 6) {
                showError('loginPassword', 'loginPasswordError', 'Password must be at least 6 characters');
                isValid = false;
            }
            
            if (isValid) {
                // Simulate login success
                alert('Login successful! Redirecting to chat...');
                window.location.href = 'chat.html';
            }
        });
    }

    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            let isValid = true;
            
            // Clear previous errors
            clearError('signupName', 'signupNameError');
            clearError('signupEmail', 'signupEmailError');
            clearError('signupPassword', 'signupPasswordError');
            clearError('confirmPassword', 'confirmPasswordError');
            
            if (name.length < 2) {
                showError('signupName', 'signupNameError', 'Name must be at least 2 characters');
                isValid = false;
            }
            
            if (!validateEmail(email)) {
                showError('signupEmail', 'signupEmailError', 'Please enter a valid email address');
                isValid = false;
            }
            
            if (password.length < 6) {
                showError('signupPassword', 'signupPasswordError', 'Password must be at least 6 characters');
                isValid = false;
            }
            
            if (password !== confirmPassword) {
                showError('confirmPassword', 'confirmPasswordError', 'Passwords do not match');
                isValid = false;
            }
            
            if (isValid) {
                // Simulate signup success
                alert('Account created successfully! Redirecting to chat...');
                window.location.href = 'chat.html';
            }
        });
    }

    // Clear errors on input
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', () => {
            const errorId = input.id + 'Error';
            clearError(input.id, errorId);
        });
    });
}

// ==============================================
// CHAT FUNCTIONALITY
// ==============================================

function initChat() {
    if (!document.querySelector('.chat-container')) return;
    
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const newChatBtn = document.querySelector('.new-chat-btn');
    
    let isTyping = false;
    
    // Auto-resize textarea
    if (chatInput) {
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
    // Handle initial question from homepage
    window.addEventListener('load', function() {
        const initialQuestion = sessionStorage.getItem('userQuestion');
        if (initialQuestion && chatInput) {
            chatInput.value = initialQuestion;
            sessionStorage.removeItem('userQuestion');
            // Auto-submit the initial question
            setTimeout(() => {
                if (chatForm) {
                    chatForm.dispatchEvent(new Event('submit'));
                }
            }, 1000);
        }
    });
    
    // Chat form submission
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (isTyping) return;
            
            const message = chatInput.value.trim();
            if (!message) return;
            
            // Add user message
            addMessage(message, 'user');
            chatInput.value = '';
            chatInput.style.height = 'auto';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Simulate AI response
            setTimeout(() => {
                hideTypingIndicator();
                const response = getAIResponse(message);
                addMessage(response, 'ai');
            }, 1500 + Math.random() * 1000);
        });
    }
    
    function addMessage(content, sender) {
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? 'U' : 'AI';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = formatMessage(content);
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString();
        
        messageContent.appendChild(messageTime);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function formatMessage(text) {
        // Convert line breaks and format text
        return text.replace(/\n/g, '<br>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    function showTypingIndicator() {
        if (!chatMessages) return;
        
        isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'AI';
        avatar.style.background = 'var(--accent-color)';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'typing-content';
        typingContent.innerHTML = `
            <span>Jante ch-Ai is typing</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(typingContent);
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function hideTypingIndicator() {
        isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    function getAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Import chatResponses if available
        if (typeof chatResponses !== 'undefined') {
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
                return getRandomResponse(chatResponses.greetings);
            } else if (lowerMessage.includes('nid') || lowerMessage.includes('national id')) {
                return getRandomResponse(chatResponses.nid);
            } else if (lowerMessage.includes('license') || lowerMessage.includes('driving')) {
                return getRandomResponse(chatResponses.license);
            } else if (lowerMessage.includes('tax') || lowerMessage.includes('tin')) {
                return getRandomResponse(chatResponses.tax);
            } else if (lowerMessage.includes('passport')) {
                return getRandomResponse(chatResponses.passport);
            } else {
                return getRandomResponse(chatResponses.default);
            }
        }
        
        // Fallback response
        return "I'm here to help you with Bangladesh government services. You can ask me about NID, driving licenses, tax information, passports, and more!";
    }
    
    function getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // New chat functionality
    if (newChatBtn) {
        newChatBtn.addEventListener('click', function() {
            if (chatMessages) {
                chatMessages.innerHTML = '';
            }
            if (chatInput) {
                chatInput.value = '';
                chatInput.focus();
            }
        });
    }
}

// ==============================================
// 404 ERROR PAGE FUNCTIONALITY
// ==============================================

function init404() {
    if (!document.querySelector('.error-container')) return;
    
    // Add interactive animations
    const errorCode = document.querySelector('.error-code');
    if (errorCode) {
        errorCode.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        errorCode.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    }
    
    // Animate suggestions on load
    const suggestions = document.querySelectorAll('.suggestion-item');
    suggestions.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });
}

// ==============================================
// ACCESSIBILITY ENHANCEMENTS
// ==============================================

function initAccessibility() {
    // Keyboard navigation for buttons
    document.querySelectorAll('button, .btn-primary').forEach(element => {
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Focus management for modals and forms
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    // Trap focus in authentication forms
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        const focusableElementsInAuth = authCard.querySelectorAll(focusableElements);
        const firstElement = focusableElementsInAuth[0];
        const lastElement = focusableElementsInAuth[focusableElementsInAuth.length - 1];
        
        authCard.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
    
    // Add ARIA labels where missing
    const chatInput = document.getElementById('chatInput');
    if (chatInput && !chatInput.getAttribute('aria-label')) {
        chatInput.setAttribute('aria-label', 'Type your question about government services');
    }
    
    const chatSendBtn = document.querySelector('.chat-send-btn');
    if (chatSendBtn && !chatSendBtn.getAttribute('aria-label')) {
        chatSendBtn.setAttribute('aria-label', 'Send message');
    }
}

// ==============================================
// INITIALIZATION
// ==============================================

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    initChat();
    init404();
    initAccessibility();
});

// Handle page-specific initializations
window.addEventListener('load', function() {
    // Set focus to appropriate elements
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        const firstInput = authCard.querySelector('input');
        if (firstInput) firstInput.focus();
    }
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.focus();
    }
});
