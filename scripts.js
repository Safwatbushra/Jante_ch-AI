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
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to log out?')) {
            // Clear login information
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            
            // Redirect to home page
            window.location.href = 'index.html';
        }
    });
}
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
    });    // Form validation functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        // Password must be at least 8 characters with at least one uppercase, one lowercase, and one number
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        return {
            isValid: minLength && hasUpper && hasLower && hasNumber,
            minLength,
            hasUpper,
            hasLower,
            hasNumber
        };
    }

    function validateName(name) {
        // Name must be at least 2 characters and contain only letters and spaces
        const minLength = name.trim().length >= 2;
        const validChars = /^[a-zA-Z\s]+$/.test(name.trim());
        
        return {
            isValid: minLength && validChars,
            minLength,
            validChars
        };
    }

    function showError(inputId, errorId, message) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input && error) {
            input.classList.add('error');
            error.textContent = message;
            input.setAttribute('aria-invalid', 'true');
        }
    }

    function clearError(inputId, errorId) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input && error) {
            input.classList.remove('error');
            error.textContent = '';
            input.setAttribute('aria-invalid', 'false');
        }
    }

    function showSuccess(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.style.borderColor = '#10b981';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 2000);
        }
    }    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            let isValid = true;
            
            // Clear previous errors
            clearError('loginEmail', 'loginEmailError');
            clearError('loginPassword', 'loginPasswordError');
            
            // Email validation
            if (!email) {
                showError('loginEmail', 'loginEmailError', 'Email is required');
                isValid = false;
            } else if (!validateEmail(email)) {
                showError('loginEmail', 'loginEmailError', 'Please enter a valid email address');
                isValid = false;
            } else {
                showSuccess('loginEmail');
            }
            
            // Password validation
            if (!password) {
                showError('loginPassword', 'loginPasswordError', 'Password is required');
                isValid = false;
            } else if (password.length < 6) {
                showError('loginPassword', 'loginPasswordError', 'Password must be at least 6 characters');
                isValid = false;
            } else {
                showSuccess('loginPassword');
            }
            
            if (isValid) {
                // Show loading state
                const submitBtn = loginForm.querySelector('.auth-submit');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Logging in...';
                submitBtn.disabled = true;
                
                // Simulate login API call
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    
                    // Simulate successful login
                    alert('Login successful! Welcome to Jante ch-Ai.');
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            let isValid = true;
            
            // Clear previous errors
            clearError('signupName', 'signupNameError');
            clearError('signupEmail', 'signupEmailError');
            clearError('signupPassword', 'signupPasswordError');
            clearError('confirmPassword', 'confirmPasswordError');
            
            // Name validation
            const nameValidation = validateName(name);
            if (!name) {
                showError('signupName', 'signupNameError', 'Full name is required');
                isValid = false;
            } else if (!nameValidation.minLength) {
                showError('signupName', 'signupNameError', 'Name must be at least 2 characters');
                isValid = false;
            } else if (!nameValidation.validChars) {
                showError('signupName', 'signupNameError', 'Name can only contain letters and spaces');
                isValid = false;
            } else {
                showSuccess('signupName');
            }
            
            // Email validation
            if (!email) {
                showError('signupEmail', 'signupEmailError', 'Email is required');
                isValid = false;
            } else if (!validateEmail(email)) {
                showError('signupEmail', 'signupEmailError', 'Please enter a valid email address');
                isValid = false;
            } else {
                showSuccess('signupEmail');
            }
            
            // Password validation
            const passwordValidation = validatePassword(password);
            if (!password) {
                showError('signupPassword', 'signupPasswordError', 'Password is required');
                isValid = false;
            } else if (!passwordValidation.isValid) {
                let errorMessage = 'Password must contain: ';
                const requirements = [];
                if (!passwordValidation.minLength) requirements.push('8+ characters');
                if (!passwordValidation.hasUpper) requirements.push('uppercase letter');
                if (!passwordValidation.hasLower) requirements.push('lowercase letter');
                if (!passwordValidation.hasNumber) requirements.push('number');
                errorMessage += requirements.join(', ');
                showError('signupPassword', 'signupPasswordError', errorMessage);
                isValid = false;
            } else {
                showSuccess('signupPassword');
            }
            
            // Confirm password validation
            if (!confirmPassword) {
                showError('confirmPassword', 'confirmPasswordError', 'Please confirm your password');
                isValid = false;
            } else if (password !== confirmPassword) {
                showError('confirmPassword', 'confirmPasswordError', 'Passwords do not match');
                isValid = false;
            } else if (password === confirmPassword && passwordValidation.isValid) {
                showSuccess('confirmPassword');
            }
            
            if (isValid) {
                // Show loading state
                const submitBtn = signupForm.querySelector('.auth-submit');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Creating Account...';
                submitBtn.disabled = true;
                
                // Simulate signup API call
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    
                    // Simulate successful signup
                    alert('Account created successfully! Welcome to Jante ch-Ai.');
                    window.location.href = 'index.html';
                }, 2000);
            }
        });
    }    // Real-time validation as users type
    document.querySelectorAll('.form-input').forEach(input => {
        // Clear errors on input
        input.addEventListener('input', () => {
            const errorId = input.id + 'Error';
            clearError(input.id, errorId);
        });
        
        // Real-time validation on blur
        input.addEventListener('blur', () => {
            const errorId = input.id + 'Error';
            const value = input.value.trim();
            
            switch(input.type) {
                case 'email':
                    if (value && !validateEmail(value)) {
                        showError(input.id, errorId, 'Please enter a valid email address');
                    } else if (value && validateEmail(value)) {
                        showSuccess(input.id);
                    }
                    break;
                    
                case 'password':
                    if (input.id === 'signupPassword' && value) {
                        const validation = validatePassword(value);
                        if (!validation.isValid) {
                            let errorMessage = 'Password must contain: ';
                            const requirements = [];
                            if (!validation.minLength) requirements.push('8+ characters');
                            if (!validation.hasUpper) requirements.push('uppercase letter');
                            if (!validation.hasLower) requirements.push('lowercase letter');
                            if (!validation.hasNumber) requirements.push('number');
                            errorMessage += requirements.join(', ');
                            showError(input.id, errorId, errorMessage);
                        } else {
                            showSuccess(input.id);
                        }
                    } else if (input.id === 'confirmPassword' && value) {
                        const password = document.getElementById('signupPassword').value;
                        if (value !== password) {
                            showError(input.id, errorId, 'Passwords do not match');
                        } else if (value === password) {
                            showSuccess(input.id);
                        }
                    } else if (input.id === 'loginPassword' && value) {
                        if (value.length >= 6) {
                            showSuccess(input.id);
                        }
                    }
                    break;
                    
                case 'text':
                    if (input.id === 'signupName' && value) {
                        const validation = validateName(value);
                        if (!validation.isValid) {
                            if (!validation.minLength) {
                                showError(input.id, errorId, 'Name must be at least 2 characters');
                            } else if (!validation.validChars) {
                                showError(input.id, errorId, 'Name can only contain letters and spaces');
                            }
                        } else {
                            showSuccess(input.id);
                        }
                    }
                    break;
            }
        });
    });
}

// ==============================================
// DUMMY LOGIN FUNCTIONALITY
// ==============================================

// Dummy user data
const dummyUsers = [
    {
        email: "user@example.com",
        password: "password123",
        name: "John Doe"
    },
    {
        email: "test@gmail.com", 
        password: "test123",
        name: "Test User"
    },
    {
        email: "demo@jantechai.com",
        password: "demo123", 
        name: "Demo User"
    }
];

// Authentication functions
document.addEventListener('DOMContentLoaded', function() {
    // Auth tab switching
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and forms
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.style.display = 'none');
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding form
            if (targetTab === 'login') {
                document.getElementById('loginForm').style.display = 'block';
            } else {
                document.getElementById('signupForm').style.display = 'block';
            }
        });
    });
    
    // Auto-fill login form when login button is clicked
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const loginButton = loginForm.querySelector('.auth-submit');
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        
        // Auto-fill with dummy credentials immediately when form loads
        const dummyUser = dummyUsers[0]; // Use first dummy user
        if (emailInput) emailInput.value = dummyUser.email;
        if (passwordInput) passwordInput.value = dummyUser.password;
        
        // Handle click for submission
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Form is already filled, just show success message and redirect
            showLoginSuccess(dummyUser.name);
        });
        
        // Handle form submission
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            // Check against dummy users
            const user = dummyUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
                showLoginSuccess(user.name);
            } else {
                showLoginError('Invalid email or password. Try clicking the Login button for auto-fill!');
            }
        });
    }
    
    // Handle signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showSignupError('Passwords do not match!');
                return;
            }
            
            // Simulate successful signup
            showSignupSuccess(name);
        });
    }
});

function showLoginSuccess(name) {
    // Store user data in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name);
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'login-success-message';
    successMsg.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>Welcome back, ${name}!</h3>
            <p>Redirecting to home page...</p>
        </div>
    `;
    document.body.appendChild(successMsg);
    
    // Redirect after 2 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function showSignupSuccess(name) {
    // Store user data in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name);
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'signup-success-message';
    successMsg.innerHTML = `
        <div class="success-content">
            <i class="fas fa-user-check"></i>
            <h3>Account created successfully!</h3>
            <p>Welcome, ${name}! Redirecting...</p>
        </div>
    `;
    document.body.appendChild(successMsg);
    
    // Redirect after 2 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginEmailError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSignupError(message) {
    const errorDiv = document.getElementById('signupPasswordError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// ==============================================
// CHAT FUNCTIONALITY
// ==============================================

// Initialize chat functionality
function initChat() {
    if (!document.querySelector('.chat-app')) return;
    
    const chatInput = document.getElementById('chatInput');
    
    // Auto-resize textarea
    if (chatInput) {
        chatInput.addEventListener('input', function() {
            adjustTextareaHeight(this);
        });
        
        // Handle initial question from homepage
        window.addEventListener('load', function() {
            const initialQuestion = sessionStorage.getItem('userQuestion');
            if (initialQuestion && chatInput) {
                chatInput.value = initialQuestion;
                sessionStorage.removeItem('userQuestion');
                // Auto-submit the initial question
                setTimeout(() => {
                    sendMessage();
                }, 1000);
            }
        });
    }
    
    // Hide welcome screen when first message is sent
    const welcomeScreen = document.getElementById('welcomeScreen');
    const chatMessages = document.getElementById('chatMessages');
    
    // Initialize with welcome screen visible
    if (welcomeScreen && chatMessages) {
        welcomeScreen.style.display = 'flex';
        chatMessages.style.display = 'none';
    }
    
    // Handle suggestion item keyboard navigation
    document.querySelectorAll('.quick-action').forEach(item => {
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Mobile sidebar functions
function toggleSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        
        const isOpen = sidebar.classList.contains('open');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', isOpen);
        }
        
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
    }
}

// Chat functions
function startNewChat() {
    const chatMessages = document.getElementById('chatMessages');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const chatInput = document.getElementById('chatInput');
    
    if (chatMessages && welcomeScreen) {
        // Clear chat messages and show welcome screen
        chatMessages.innerHTML = '';
        chatMessages.style.display = 'none';
        welcomeScreen.style.display = 'flex';
    }
    
    if (chatInput) {
        chatInput.value = '';
        chatInput.focus();
    }
    
    // Close sidebar on mobile
    closeSidebar();
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !sendBtn) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Hide welcome screen and show chat messages on first message
    if (welcomeScreen && chatMessages) {
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
            chatMessages.style.display = 'block';
        }
    }
    
    // Disable send button temporarily
    sendBtn.disabled = true;
    
    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';
    adjustTextareaHeight(chatInput);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate AI response
    setTimeout(() => {
        hideTypingIndicator();
        const response = getAIResponse(message);
        addMessage(response, 'ai');
        sendBtn.disabled = false;
        chatInput.focus();
    }, 1500 + Math.random() * 1000);
}

function sendSuggestion(suggestion) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = suggestion;
        sendMessage();
    }
    
    // Close sidebar on mobile
    closeSidebar();
}

function loadChatHistory(chatId) {
    // Clear current chat and show welcome screen
    startNewChat();
    
    // Simulate loading a previous chat conversation
    const chatMessages = document.getElementById('chatMessages');
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    if (chatMessages && welcomeScreen) {
        welcomeScreen.style.display = 'none';
        chatMessages.style.display = 'block';
        
        // Add sample messages based on chat history
        const sampleChats = {
            'nid-application': [
                { sender: 'user', content: 'How do I apply for NID?' },
                { sender: 'ai', content: chatResponses.nid[0] }
            ],
            'driving-license': [
                { sender: 'user', content: 'What documents are needed for driving license?' },
                { sender: 'ai', content: chatResponses.license[1] }
            ],
            'tax-return': [
                { sender: 'user', content: 'When is the deadline for tax return filing?' },
                { sender: 'ai', content: chatResponses.tax[0] }
            ],
            'passport-renewal': [
                { sender: 'user', content: 'How to renew my passport?' },
                { sender: 'ai', content: chatResponses.passport[2] }
            ],
            'business-license': [
                { sender: 'user', content: 'What are the requirements for trade license?' },
                { sender: 'ai', content: chatResponses.general[0] }
            ]
        };
        
        const messages = sampleChats[chatId] || [];
        messages.forEach(msg => {
            setTimeout(() => {
                addMessage(msg.content, msg.sender);
            }, 300);
        });
    }
    
    // Close sidebar on mobile
    closeSidebar();
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        startNewChat();
    }
}

function exportChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messages = chatMessages.querySelectorAll('.message');
    let chatText = 'Jante ch-Ai Chat Export\n';
    chatText += '========================\n\n';
    
    messages.forEach(message => {
        const sender = message.classList.contains('user') ? 'User' : 'Jante ch-Ai';
        const content = message.querySelector('.message-bubble')?.textContent || 
                       message.querySelector('.message-content')?.textContent || '';
        const time = message.querySelector('.message-time')?.textContent || '';
        
        chatText += `[${time}] ${sender}: ${content.trim()}\n\n`;
    });
    
    // Create download
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jante-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function addMessage(content, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? 'U' : 'JA';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';
    messageBubble.innerHTML = formatMessage(content);
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString();
    
    messageContent.appendChild(messageBubble);
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
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/•/g, '&bull;');
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'JA';
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
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function getAIResponse(message) {
    // Check if chatResponses is available
    if (typeof chatResponses === 'undefined') {
        // Fallback if chatResponses.js is not loaded
        return "I'm here to help you with Bangladesh government services including NID, driving licenses, tax information, passports, business licenses, and more. What specific service would you like to know about?";
    }
    
    const lowerMessage = message.toLowerCase();
    
    // Greeting detection
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || 
        lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || 
        lowerMessage.includes('good evening') || lowerMessage.includes('assalamu alaikum')) {
        return getRandomResponse(chatResponses.greetings);
    }
    
    // NID related queries
    if (lowerMessage.includes('nid') || lowerMessage.includes('national id') || 
        lowerMessage.includes('identity card') || lowerMessage.includes('voter id')) {
        if (lowerMessage.includes('correction') || lowerMessage.includes('change') || lowerMessage.includes('update')) {
            return chatResponses.nid[1]; // Correction process
        } else if (lowerMessage.includes('smart') || lowerMessage.includes('feature') || lowerMessage.includes('biometric')) {
            return chatResponses.nid[2]; // Smart NID features
        } else {
            return chatResponses.nid[0]; // General NID info
        }
    }
    
    // Driving license queries
    if (lowerMessage.includes('license') || lowerMessage.includes('driving') || 
        lowerMessage.includes('brta') || lowerMessage.includes('vehicle')) {
        if (lowerMessage.includes('document') || lowerMessage.includes('paper') || lowerMessage.includes('requirement')) {
            return chatResponses.license[1]; // Required documents
        } else if (lowerMessage.includes('renewal') || lowerMessage.includes('renew') || lowerMessage.includes('expire')) {
            return chatResponses.license[2]; // Renewal process
        } else {
            return chatResponses.license[0]; // General license info
        }
    }
    
    // Tax related queries
    if (lowerMessage.includes('tax') || lowerMessage.includes('tin') || 
        lowerMessage.includes('nbr') || lowerMessage.includes('income') || lowerMessage.includes('vat')) {
        if (lowerMessage.includes('tin') || lowerMessage.includes('registration') || lowerMessage.includes('number')) {
            return chatResponses.tax[1]; // TIN registration
        } else if (lowerMessage.includes('vat') || lowerMessage.includes('value added')) {
            return chatResponses.tax[2]; // VAT information
        } else {
            return chatResponses.tax[0]; // General tax info
        }
    }
    
    // Passport queries
    if (lowerMessage.includes('passport') || lowerMessage.includes('travel') || 
        lowerMessage.includes('visa') || lowerMessage.includes('immigration')) {
        if (lowerMessage.includes('document') || lowerMessage.includes('paper') || lowerMessage.includes('requirement')) {
            return chatResponses.passport[1]; // Required documents
        } else if (lowerMessage.includes('renewal') || lowerMessage.includes('renew') || 
                   lowerMessage.includes('lost') || lowerMessage.includes('damage') || lowerMessage.includes('reissue')) {
            return chatResponses.passport[2]; // Renewal/reissuance
        } else {
            return chatResponses.passport[0]; // General passport info
        }
    }
    
    // Business/trade license queries
    if (lowerMessage.includes('business') || lowerMessage.includes('trade') || 
        lowerMessage.includes('company') || lowerMessage.includes('enterprise')) {
        return chatResponses.general[0];
    }
    
    // Digital services queries
    if (lowerMessage.includes('digital') || lowerMessage.includes('online') || 
        lowerMessage.includes('internet') || lowerMessage.includes('website')) {
        return chatResponses.general[1];
    }
    
    // Emergency or contact queries
    if (lowerMessage.includes('emergency') || lowerMessage.includes('contact') || 
        lowerMessage.includes('phone') || lowerMessage.includes('number') || lowerMessage.includes('help')) {
        return chatResponses.general[2];
    }
    
    // Fee related queries
    if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || 
        lowerMessage.includes('price') || lowerMessage.includes('money') || lowerMessage.includes('payment')) {
        return "Here are the common government service fees:\n\n💰 **NID Services:**\n• First-time: 125 BDT\n• Correction: 230 BDT\n• Duplicate: 345 BDT\n\n🚗 **Driving License:**\n• Professional: 2,100 BDT\n• Non-professional: 1,100 BDT\n\n✈️ **Passport:**\n• Regular: 3,000 BDT\n• Express: 5,000 BDT\n• Super Express: 7,500 BDT\n\n📋 **TIN Registration:** Free\n\nWhich specific service fee would you like to know about?";
    }
    
    // Thank you responses
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || 
        lowerMessage.includes('appreciate') || lowerMessage.includes('helpful')) {
        return "You're very welcome! I'm glad I could help you with government service information. If you have any more questions about NID, driving licenses, passports, tax services, or any other government procedures, feel free to ask anytime. Have a great day! 😊";
    }
    
    // Default response for unrecognized queries
    return getRandomResponse(chatResponses.default);
}

// Helper function to get random response from array
function getRandomResponse(responses) {
    if (!responses || responses.length === 0) {
        return "I'm here to help you with Bangladesh government services. What would you like to know?";
    }
    return responses[Math.floor(Math.random() * responses.length)];
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
// UTILITY FUNCTIONS
// ==============================================

// Utility function to adjust textarea height automatically
function adjustTextareaHeight(textarea) {
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set height based on scrollHeight, with min and max limits
    const minHeight = 24; // 1 line
    const maxHeight = 120; // ~5 lines
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    
    textarea.style.height = newHeight + 'px';
    
    // Enable/disable scrolling based on content
    if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
    } else {
        textarea.style.overflowY = 'hidden';
    }
}

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.querySelector('.nav-btn i.fa-moon, .nav-btn i.fa-sun');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        if (themeBtn) {
            themeBtn.className = 'fas fa-moon';
        }
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        if (themeBtn) {
            themeBtn.className = 'fas fa-sun';
        }
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeBtn = document.querySelector('.nav-btn i.fa-moon, .nav-btn i.fa-sun');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        if (themeBtn) {
            themeBtn.className = 'fas fa-sun';
        }
    }
}

// Settings functionality
function showSettings() {
    alert('Settings panel will be implemented in future updates. Current features:\n\n• Theme toggle (moon/sun icon)\n• Chat export\n• Chat clearing\n• Responsive design');
}

// Attachment handling
function handleAttachment() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.pdf,.doc,.docx,.jpg,.jpeg,.png';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // For demo purposes, just show an alert
            alert(`File "${file.name}" selected. File upload functionality will be implemented in future updates.`);
        }
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

// Emoji picker functionality
function toggleEmojiPicker() {
    // Simple emoji insertion for demo
    const emojis = ['😊', '👍', '❤️', '😂', '🤔', '👋', '🙏', '✨', '🔥', '💯'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        const cursorPos = chatInput.selectionStart;
        const textBefore = chatInput.value.substring(0, cursorPos);
        const textAfter = chatInput.value.substring(cursorPos);
        
        chatInput.value = textBefore + randomEmoji + textAfter;
        chatInput.setSelectionRange(cursorPos + randomEmoji.length, cursorPos + randomEmoji.length);
        chatInput.focus();
        adjustTextareaHeight(chatInput);
    }
}

// Chat info toggle
function toggleChatInfo() {
    alert('Chat Information:\n\n• Assistant: Jante ch-Ai\n• Status: Online\n• Specialty: Bangladesh Government Services\n• Response Time: Instant\n• Data Source: Official Government Information\n\nThis assistant can help with NID, licenses, taxes, passports, and more!');
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
    loadTheme(); // Load saved theme
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

// Mobile navigation toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Update aria-expanded for accessibility
        navToggle.setAttribute('aria-expanded', !isExpanded);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking on a link
    navMenu.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu on window resize if screen becomes larger
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

// ==============================================
// SERVICE WORKER
// ==============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        }, function(err) {
            console.log('Service Worker registration failed:', err);
        });
    });
}
