// ========================= THEME TOGGLE =========================
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
    
    function updateThemeIcon() {
        const isDark = html.getAttribute('data-theme') === 'dark';
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    }
    
    themeToggle.addEventListener('click', () => {
        const isDark = html.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    });

    // ========================= NAVIGATION ACTIVE STATE =========================
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'home.html')) {
            link.classList.add('active');
        }
    });

    // ========================= MOBILE MENU =========================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
            });
        });
    }

    // ========================= CONTACT FORM =========================
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic validation
            const name = contactForm.querySelector('#name').value.trim();
            const email = contactForm.querySelector('#email').value.trim();
            const phone = contactForm.querySelector('#phone').value.trim();
            const interest = contactForm.querySelector('#interest').value;
            const message = contactForm.querySelector('#message').value.trim();
            
            if (!name || !email || !phone || !interest || !message) {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address', 'error');
                return;
            }
            
            // Phone validation (basic)
            const phoneRegex = /^[0-9\s+\-()]{10,}$/;
            if (!phoneRegex.test(phone)) {
                showMessage('Please enter a valid phone number', 'error');
                return;
            }
            
            // Simulate form submission (in real scenario, send to backend)
            showMessage('Thank you! We\'ll contact you soon.', 'success');
            contactForm.reset();
        });
    }
    
    function showMessage(text, type) {
        if (formMessage) {
            formMessage.textContent = text;
            formMessage.className = 'form-message show ' + type;
            
            setTimeout(() => {
                formMessage.classList.remove('show');
            }, 5000);
        }
    }

    // ========================= SMOOTH SCROLL & ANIMATION =========================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with fade-in-up class
    document.querySelectorAll('.fade-in-up').forEach(el => {
        observer.observe(el);
    });
    
    // ========================= CHART ANIMATION =========================
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        bar.style.animation = `slideInLeft 0.8s ease-out ${0.1 * (index + 1)}s both`;
    });

    // ========================= HOVER EFFECTS =========================
    document.querySelectorAll('.hover-lift').forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        el.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // ========================= ACTIVE STEPS ANIMATION =========================
    const stepCards = document.querySelectorAll('.step-card');
    if (stepCards.length > 0) {
        stepCards.forEach((card, index) => {
            card.style.animation = `fadeInUp 0.6s ease-out ${0.2 * index}s both`;
        });
    }

    // ========================= TIMELINE ANIMATION =========================
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.animation = `fadeInUp 0.6s ease-out ${0.2 * index}s both`;
    });

    // ========================= PRODUCTS ANIMATION =========================
    const productDetails = document.querySelectorAll('.product-detail');
    productDetails.forEach((product, index) => {
        product.style.animation = `fadeInUp 0.6s ease-out ${0.2 * index}s both`;
    });

    // ========================= TESTIMONIALS AUTO-ANIMATE =========================
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.6s ease-out ${0.1 * index}s both`;
    });

    // ========================= COUNTER ANIMATION (Stats) =========================
    const statNumbers = document.querySelectorAll('.stat-number');
    const countUp = (element, target, duration = 2000) => {
        let current = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.ceil(current);
        }, 16);
    };

    // Trigger count animation when stat is in view
    statNumbers.forEach(el => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const text = el.textContent;
                    const number = parseInt(text.replace(/[^0-9]/g, ''));
                    if (number) {
                        countUp(el, number);
                    }
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(el);
    });

    // ========================= PROCESS FLOW ANIMATION =========================
    const stepGroups = document.querySelectorAll('.step-group');
    if (stepGroups.length > 0) {
        // Animate arrows
        const arrows = document.querySelectorAll('.arrow');
        arrows.forEach((arrow, index) => {
            arrow.style.animation = `fadeIn 0.8s ease-out ${0.5 + (0.3 * index)}s both`;
        });

        // Animate steps
        stepGroups.forEach((step, index) => {
            step.style.animation = `fadeInUp 0.6s ease-out ${(0.2 * index)}s both`;
        });
    }

    // ========================= SCROLL PROGRESS =========================
    const progressLine = document.querySelector('.progress-line');
    if (progressLine) {
        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.scrollY / scrollHeight) * 100;
            const duration = progressLine.getAttribute('stroke-dasharray');
            if (duration) {
                progressLine.style.strokeDashoffset = duration * (1 - scrolled / 100);
            }
        });
    }

    // ========================= PARALLAX EFFECT (Optional) =========================
    const parallaxElements = document.querySelectorAll('.hero-visual');
    window.addEventListener('scroll', () => {
        parallaxElements.forEach(el => {
            const scrollPosition = window.scrollY;
            el.style.transform = `translateY(${scrollPosition * 0.5}px)`;
        });
    });

    console.log('A2P Financial Services - Website initialized ✓');
});
