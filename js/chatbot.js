class Chatbot {
    constructor() {
        // For static websites - no server needed
        this.isStatic = true; // Set to false if you want to use the server
        this.apiUrl = 'http://localhost:3001/api/chat'; // Only used if isStatic = false
        this.isOpen = false;
        this.arrowShown = true;
        this.init();
        this.initArrow();
    }

    init() {
        this.chatbotButton = document.getElementById('chatbotButton');
        this.chatbotWindow = document.getElementById('chatbotWindow');
        this.chatbotClose = document.getElementById('chatbotClose');
        this.chatbotMessages = document.getElementById('chatbotMessages');
        this.chatbotInput = document.getElementById('chatbotInput');
        this.chatbotSend = document.getElementById('chatbotSend');

        this.bindEvents();
    }

    bindEvents() {
        // Toggle chatbot window
        this.chatbotButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            this.toggleChat();
        });
        this.chatbotClose.addEventListener('click', () => this.closeChat());

        // Send message
        this.chatbotSend.addEventListener('click', () => this.sendMessage());
        this.chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-focus input when chat opens
        this.chatbotInput.addEventListener('focus', () => {
            this.chatbotInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        // Close chatbot when clicking outside
        document.addEventListener('click', (e) => this.handleClickOutside(e));
        
        // Prevent clicks inside chatbot from bubbling
        this.chatbotWindow.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    initArrow() {
        this.chatbotArrow = document.getElementById('chatbotArrow');
        if (!this.chatbotArrow) return;

        // Handle scroll to fade arrow
        window.addEventListener('scroll', () => this.handleArrowScroll());
        
        // Hide arrow when chatbot is clicked
        this.chatbotButton.addEventListener('click', () => this.hideArrow());
    }

    handleArrowScroll() {
        if (!this.arrowShown || !this.chatbotArrow) return;
        
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Calculate scroll percentage (0 to 1)
        const scrollPercentage = scrollPosition / (documentHeight - windowHeight);
        
        // Start fading after 20% scroll, completely fade by 60%
        let opacity = 1;
        if (scrollPercentage > 0.2) {
            opacity = Math.max(0, 1 - ((scrollPercentage - 0.2) / 0.4));
        }
        
        this.chatbotArrow.style.opacity = opacity;
    }

    hideArrow() {
        if (!this.chatbotArrow || !this.arrowShown) return;
        
        this.arrowShown = false;
        this.chatbotArrow.classList.add('hidden');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (this.chatbotArrow && this.chatbotArrow.parentNode) {
                this.chatbotArrow.parentNode.removeChild(this.chatbotArrow);
            }
        }, 300);
    }

    handleClickOutside(event) {
        // Only close if chatbot is open
        if (!this.isOpen) return;
        
        // Get the chatbot container element
        const chatbotContainer = document.querySelector('.chatbot-container');
        
        // Check if the click is outside the chatbot container
        if (chatbotContainer && !chatbotContainer.contains(event.target)) {
            // Add a small delay to ensure other events are processed first
            setTimeout(() => {
                if (this.isOpen) { // Double check it's still open
                    this.closeChat();
                }
            }, 0);
        }
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.chatbotWindow.classList.add('active');
        this.chatbotButton.innerHTML = '<i class="fas fa-times"></i>';
        this.isOpen = true;
        
        // Auto-focus input
        setTimeout(() => {
            this.chatbotInput.focus();
        }, 100);
    }

    closeChat() {
        this.chatbotWindow.classList.remove('active');
        this.chatbotButton.innerHTML = '🤖';
        this.isOpen = false;
    }

    async sendMessage() {
        const message = this.chatbotInput.value.trim();
        if (!message) return;

        // Clear input
        this.chatbotInput.value = '';
        
        // Disable send button
        this.chatbotSend.disabled = true;

        // Add user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            let botResponse;
            
            if (this.isStatic) {
                // Static mode - use local responses
                await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000)); // Simulate delay
                botResponse = this.getFallbackResponse(message);
            } else {
                // Server mode - call API
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                botResponse = data.response || 'Sorry, I encountered an error. Please try again.';
            }
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add bot response
            this.addMessage(botResponse, 'bot');

        } catch (error) {
            console.error('Chatbot Error:', error);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add fallback response
            this.addMessage(this.getFallbackResponse(message), 'bot');
        } finally {
            // Re-enable send button
            this.chatbotSend.disabled = false;
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        messageDiv.textContent = text;
        
        this.chatbotMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        this.chatbotMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }

    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Simple keyword-based responses
        if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
            return "Akshay has 7.5+ years of experience in AI, data science, and software engineering. He's worked across various domains including healthcare, finance, and technology innovation. You can find detailed information in the Experience section above.";
        }
        
        if (lowerMessage.includes('skill') || lowerMessage.includes('technology')) {
            return "Akshay is proficient in AI/ML frameworks, Python, JavaScript, cloud platforms, and data science tools. Check out the Skills section to see his complete technical expertise.";
        }
        
        if (lowerMessage.includes('project') || lowerMessage.includes('portfolio')) {
            return "Akshay has worked on various AI and software projects, from machine learning models to full-stack applications. Explore the Projects section to see his work.";
        }
        
        if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('hire')) {
            return "You can reach Akshay through the contact information provided in the Contact section. He's open to discussing AI projects, collaborations, and opportunities.";
        }
        
        if (lowerMessage.includes('education') || lowerMessage.includes('study')) {
            return "Akshay has a strong educational background in technology and continues to learn cutting-edge AI and software development techniques. His learning journey is reflected in his diverse project portfolio.";
        }

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! I'm here to help you learn more about Akshay Sayar. Feel free to ask about his experience, skills, projects, or how to get in touch with him.";
        }
        
        // Default response
        return "I'm currently offline, but I'd love to help you learn more about Akshay! You can ask me about his experience, skills, projects, or contact information. Meanwhile, feel free to explore his portfolio above.";
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});
