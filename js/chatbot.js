class Chatbot {
    constructor() {
        // For static websites - no server needed
        this.isStatic = false; // Set to false if you want to use the server
        this.apiUrl = 'https://akshay-cv-backend.onrender.com/chat'; // Only used if isStatic = false
        this.isOpen = false;
        this.arrowShown = true;
        console.log('🤖 Chatbot initialized with backend URL:', this.apiUrl);
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

        console.log('💬 Sending message:', message);
        console.log('🔧 Using static mode:', this.isStatic);

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
                // Server mode - call API with timeout and better error handling
                console.log('🚀 Sending request to backend:', this.apiUrl);
                console.log('📦 Request payload:', { message: message });
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    console.log('⏰ Request timeout triggered after 30 seconds');
                    controller.abort();
                }, 30000); // 30 second timeout
                
                console.log('📡 Making fetch request...');
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                console.log('📥 Response received!');
                console.log('📊 Response status:', response.status);
                console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.log('❌ Error response body:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                }

                // Try to parse as JSON first, fall back to plain text
                const contentType = response.headers.get('content-type');
                console.log('📋 Content-Type:', contentType);
                
                if (contentType && contentType.includes('application/json')) {
                    // Response is JSON
                    const data = await response.json();
                    console.log('✅ JSON Response data:', data);
                    botResponse = data.response || data.message || 'Sorry, I encountered an error. Please try again.';
                } else {
                    // Response is plain text
                    botResponse = await response.text();
                    console.log('✅ Plain text response:', botResponse);
                }
            }
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add bot response
            console.log('🔤 About to add bot message:', botResponse);
            this.addMessage(botResponse, 'bot');

        } catch (error) {
            console.error('Chatbot Error:', error);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Determine error type and show appropriate message
            let errorMessage;
            if (error.name === 'AbortError') {
                errorMessage = "Request timed out. The backend might be starting up (this can take 30-60 seconds on free hosting). Please try again.";
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = "Network error. Please check your connection and try again.";
            } else {
                errorMessage = "I'm having trouble connecting to my backend. Let me use my offline knowledge instead.";
            }
            
            // Add error-specific response
            this.addMessage(errorMessage, 'bot');
            
            // After a brief delay, add a fallback response
            setTimeout(() => {
                this.addMessage(this.getFallbackResponse(message), 'bot');
            }, 1000);
        } finally {
            // Re-enable send button
            this.chatbotSend.disabled = false;
        }
    }

    addMessage(text, sender) {
        console.log(`📝 Adding message - Sender: ${sender}, Text: "${text}"`);
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        messageDiv.textContent = text;
        
        this.chatbotMessages.appendChild(messageDiv);
        console.log('✅ Message added to DOM');
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
            return "Akshay has 7.5+ years of experience in AI, data science, and software engineering. He's currently working as a Software Engineer at Propylon in Dublin, Ireland, where he develops conversational RAG systems using LangGraph and Claude Sonnet LLM. Previously, he worked at companies like GS Lab and Cognizant, focusing on AI/ML projects, network security, and data science solutions.";
        }
        
        if (lowerMessage.includes('skill') || lowerMessage.includes('technology')) {
            return "Akshay is proficient in Python, TensorFlow, PyTorch, LangGraph, AWS, Docker, and many other AI/ML technologies. He specializes in building RAG systems, computer vision, NLP, and cloud deployments. Check out the Skills section above to see his complete technical expertise.";
        }
        
        if (lowerMessage.includes('project') || lowerMessage.includes('portfolio')) {
            return "Akshay has worked on fascinating projects including: ML Framework for Empathy Prediction using eye-tracking (89% accuracy), Free Canvas AR Drawing Tool for children, Agentic Chatbot Assistant, and a Snake Game with Random Forest AI. He's also built production RAG systems and network intrusion detection systems.";
        }
        
        if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('hire')) {
            return "You can reach Akshay at akshaysayar@gmail.com or call +353 89 966 6388. He's based in Dublin, Ireland and is open to discussing AI projects, collaborations, and opportunities. You can also connect with him on LinkedIn or GitHub.";
        }
        
        if (lowerMessage.includes('education') || lowerMessage.includes('study')) {
            return "Akshay has a Master of Science in Data Analytics from National College of Ireland (First Class Honors, Dean's List) and a Bachelor of Engineering in Mechanical Engineering from University of Pune (First Class with Distinction). He's a continuous learner who stays updated with the latest AI and technology trends.";
        }

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! I'm Akshay's AI assistant. I can help you learn more about his 7.5+ years of experience in AI engineering, data science, and software development. Feel free to ask about his work at Propylon, his AI projects, technical skills, or how to get in touch!";
        }

        if (lowerMessage.includes('propylon') || lowerMessage.includes('current') || lowerMessage.includes('job')) {
            return "Akshay currently works as a Software Engineer at Propylon in Dublin, Ireland (Nov 2022 - July 2025). He develops conversational RAG systems using LangGraph and Claude Sonnet LLM, designs custom indexing algorithms with OpenSearch, and has mentored Trinity College students for 3 years. He also volunteers teaching programming to children.";
        }

        if (lowerMessage.includes('ai') || lowerMessage.includes('machine learning') || lowerMessage.includes('ml')) {
            return "Akshay is an AI/ML expert with experience in building production systems like conversational RAG with LangGraph, computer vision models (YOLO V5), NLP systems, and time series forecasting. He's worked on empathy prediction using eye-tracking, network intrusion detection, and IoT anomaly detection systems.";
        }
        
        // Default response
        return "I'm here to help you learn more about Akshay Sayar! You can ask me about his experience, skills, projects, education, or how to contact him. Try asking about his work at Propylon, his AI projects, or his technical expertise.";
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});
