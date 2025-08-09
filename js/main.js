// ===============================
// Modern CV Portfolio JavaScript
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    
    // ===============================
    // Navigation Functionality
    // ===============================
    
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    // ===============================
    // Intersection Observer for Animations
    // ===============================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Special handling for progress bars
                if (entry.target.classList.contains('progress-fill')) {
                    const skillLevel = entry.target.getAttribute('data-skill');
                    setTimeout(() => {
                        entry.target.style.width = skillLevel + '%';
                    }, 200);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.timeline-item, .skill-category, .project-card, .contact-item, .about-text, .skills-preview');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
    });
    
    // Observe progress bars separately
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        bar.style.transition = 'width 1.5s ease-in-out 0.5s';
        observer.observe(bar);
    });
    
    // ===============================
    // Hero Section Animations
    // ===============================
    
    // Typing animation for hero title
    const heroTitle = document.querySelector('.title-name');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let charIndex = 0;
        const typeWriter = () => {
            if (charIndex < originalText.length) {
                heroTitle.textContent += originalText.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 100);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
    
    // Parallax effect for hero background shapes
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const shapes = document.querySelectorAll('.bg-shape');
        
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.2);
            const yPos = -(scrolled * speed);
            shape.style.transform = `translateY(${yPos}px)`;
        });
    });
    
    // ===============================
    // Interactive Elements
    // ===============================
    
    // Skill item click effects
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            
            setTimeout(() => {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }, 150);
        });
    });
    
    // Contact item hover effects with ripple
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                position: absolute;
                border-radius: 50%;
                background: rgba(37, 99, 235, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // ===============================
    // Timeline Enhancements
    // ===============================
    
    // Timeline item hover effects
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        const content = item.querySelector('.timeline-content');
        const dot = item.querySelector('.timeline-dot');
        
        item.addEventListener('mouseenter', function() {
            dot.style.transform = 'translateX(-50%) scale(1.2)';
            dot.style.boxShadow = '0 0 0 8px rgba(37, 99, 235, 0.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            dot.style.transform = 'translateX(-50%) scale(1)';
            dot.style.boxShadow = 'none';
        });
    });
    
    // ===============================
    // Performance Optimizations
    // ===============================
    
    // Throttle scroll events
    let scrollTimeout;
    function throttleScroll(callback) {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
            callback();
            scrollTimeout = null;
        }, 16); // ~60fps
    }
    
    // Active navigation link highlighting
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Check if we're at the bottom of the page
        if (scrollPos + windowHeight >= documentHeight - 10) {
            // Activate the last section (contact)
            navLinks.forEach(link => link.classList.remove('active'));
            const contactLink = document.querySelector('.nav-link[href="#contact"]');
            if (contactLink) contactLink.classList.add('active');
            return;
        }
        
        let activeSection = null;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                activeSection = sectionId;
            }
        });
        
        // Update active nav link
        navLinks.forEach(link => link.classList.remove('active'));
        if (activeSection) {
            const navLink = document.querySelector(`.nav-link[href="#${activeSection}"]`);
            if (navLink) navLink.classList.add('active');
        }
    }
    
    window.addEventListener('scroll', () => throttleScroll(updateActiveNavLink));
    
    // ===============================
    // Project Card 3D Effect
    // ===============================
    
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
    
    // ===============================
    // Smooth Page Load Animation
    // ===============================
    
    // Fade in page content
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
    });
    
    // ===============================
    // Utility Functions
    // ===============================
    
    // Smooth scroll to top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Add scroll to top functionality (you can add a button for this)
    window.scrollToTop = scrollToTop;
    
    console.log('🚀 Modern CV Portfolio loaded successfully!');
    console.log('✨ All animations and interactions are ready');
    
    // ===============================
    // Timeline Expand/Collapse Functionality
    // ===============================
    
    // Initialize timeline items
    function initializeTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item[data-expandable="true"]');
        console.log('Found timeline items:', timelineItems.length);
        
        timelineItems.forEach((item, index) => {
            const timelineContent = item.querySelector('.timeline-content');
            const jobHeader = item.querySelector('.job-header');
            const expandIndicator = item.querySelector('.expand-indicator');
            
            console.log(`Timeline item ${index}:`, { timelineContent: !!timelineContent, jobHeader: !!jobHeader, expandIndicator: !!expandIndicator });
            
            if (timelineContent && jobHeader && expandIndicator) {
                // Make the entire timeline content clickable
                timelineContent.addEventListener('click', function(e) {
                    console.log('Timeline content clicked:', index);
                    // Toggle expanded state
                    item.classList.toggle('expanded');
                    
                    // Update aria attributes for accessibility
                    const isExpanded = item.classList.contains('expanded');
                    timelineContent.setAttribute('aria-expanded', isExpanded);
                    console.log('Expanded state:', isExpanded);
                });
                
                // Set initial aria attributes
                timelineContent.setAttribute('aria-expanded', 'false');
                timelineContent.setAttribute('role', 'button');
                timelineContent.setAttribute('tabindex', '0');
                
                // Add keyboard support
                timelineContent.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        timelineContent.click();
                    }
                });
            }
        });
    }
    
    // Initialize timeline when DOM is ready
    initializeTimeline();
});

// ===============================
// CSS Animations (added via JavaScript)
// ===============================

const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .nav-link.active {
        color: var(--primary-color) !important;
    }
    
    .nav-link.active::after {
        width: 100% !important;
    }
    
    @media (max-width: 768px) {
        .nav-menu.active {
            position: fixed;
            left: 0;
            top: 70px;
            flex-direction: column;
            background-color: white;
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            padding: 2rem 0;
            display: flex !important;
        }
        
        .hamburger.active .bar:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active .bar:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }
        
        .hamburger.active .bar:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    }
`;
document.head.appendChild(style);
