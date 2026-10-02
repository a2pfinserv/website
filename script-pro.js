// The menu bar is built straight away (this file loads at the end of <body>), so the page never shows the
// old text menu while loading; each page's <head> also marks <html> with .dock-nav before the first paint.
(function () {
    // ========================= BOTTOM DOCK NAVIGATION (experiment) =========================
    // To go back to the classic top menu, set USE_DOCK_NAV to false.
    const USE_DOCK_NAV = true;
    const menu = document.querySelector('.nav-menu');
    if (USE_DOCK_NAV && menu) {
        const ICONS = {
            'home.html': '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
            'products.html': '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
            'calculators.html': '<rect x="4" y="2.5" width="16" height="19" rx="3"/><rect x="7" y="5.5" width="10" height="4" rx="1"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" stroke-width="2.6"/>',
            'how-it-works.html': '<circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="6" r="2.5"/><path d="M7.5 18H14a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h6.5"/>',
            'about.html': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
        };
        const SHORT = { 'how-it-works.html': 'Process' };   // shorter labels for phones
        const dock = document.createElement('nav');
        dock.className = 'dock';
        dock.setAttribute('aria-label', 'Main');
        dock.innerHTML = [...menu.querySelectorAll('a')].map((a) => {
            const href = a.getAttribute('href');
            const active = a.classList.contains('active') || href === pageNameForDock();
            return `<a href="${href}" class="dock-item${active ? ' active' : ''}"${active ? ' aria-current="page"' : ''}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[href] || '<circle cx="12" cy="12" r="8"/>'}</svg>
                <span class="dock-long">${a.textContent}</span><span class="dock-short">${SHORT[href] || a.textContent}</span></a>`;
        }).join('');
        document.body.appendChild(dock);
        document.body.classList.add('dock-nav');
        document.documentElement.classList.add('dock-nav');

        // Liquid-glass selection: a blue glass bubble sits under the current page and slides (with a little
        // squash and stretch) from the previous page's item to this one; a clear glass lens follows the pointer.
        const items = [...dock.querySelectorAll('.dock-item')];
        const bubble = document.createElement('span');
        const lens = document.createElement('span');
        bubble.className = 'dock-bubble no-anim';
        lens.className = 'dock-lens no-anim';
        bubble.setAttribute('aria-hidden', 'true');
        lens.setAttribute('aria-hidden', 'true');
        dock.prepend(lens);
        dock.prepend(bubble);
        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const put = (el, i) => {
            const it = items[i];
            el.style.left = it.offsetLeft + 'px';
            el.style.top = it.offsetTop + 'px';
            el.style.width = it.offsetWidth + 'px';
            el.style.height = it.offsetHeight + 'px';
        };
        const goo = (el) => { if (still) return; el.classList.remove('goo'); void el.offsetWidth; el.classList.add('goo'); };
        const cur = items.findIndex((it) => it.classList.contains('active'));
        let from = -1;
        try { from = parseInt(sessionStorage.getItem('a2p-dock-from'), 10); sessionStorage.removeItem('a2p-dock-from'); } catch (e) { /* storage blocked */ }
        if (cur < 0) bubble.style.display = 'none';
        else {
            put(bubble, items[from] && from !== cur && !still ? from : cur);
            requestAnimationFrame(() => requestAnimationFrame(() => {
                bubble.classList.remove('no-anim');
                if (items[from] && from !== cur && !still) { put(bubble, cur); goo(bubble); }
            }));
        }
        const settle = () => {
            if (cur < 0) return;
            bubble.classList.add('no-anim'); put(bubble, cur); void bubble.offsetWidth; bubble.classList.remove('no-anim');
        };
        window.addEventListener('resize', settle);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);

        items.forEach((it, i) => {
            it.addEventListener('pointerenter', () => {
                if (i === cur) { lens.classList.remove('on'); return; }
                if (!lens.classList.contains('on')) { lens.classList.add('no-anim'); put(lens, i); void lens.offsetWidth; lens.classList.remove('no-anim'); }
                put(lens, i);
                lens.classList.add('on');
                goo(lens);
            });
            it.addEventListener('click', () => {
                if (i === cur || cur < 0) return;
                try { sessionStorage.setItem('a2p-dock-from', String(cur)); } catch (e) { /* storage blocked */ }
                // hide the hover lens at once and move the white text with the bubble
                lens.classList.add('no-anim');
                lens.classList.remove('on');
                items[cur].classList.remove('active');
                it.classList.add('active');
                put(bubble, i);
                goo(bubble);
            });
        });
        dock.addEventListener('pointerleave', () => lens.classList.remove('on'));

        // Top bar: company name + tagline on the right
        const bar = document.querySelector('.nav-container');
        if (bar && !bar.querySelector('.brand-text')) {
            bar.insertAdjacentHTML('beforeend', '<div class="brand-text"><strong>A2P Financial Services</strong><span>Aapke Sapno Ka Financial Planner</span></div>');
        }
    }
    function pageNameForDock() { return window.location.pathname.split('/').pop() || 'home.html'; }
})();

document.addEventListener('DOMContentLoaded', () => {
    // ========================= SEGMENTED FILTERS (sliding glass bubble) =========================
    document.querySelectorAll('.seg').forEach((group) => {
        const buttons = [...group.querySelectorAll('button')];
        const bubble = document.createElement('span');
        bubble.className = 'seg-bubble';
        bubble.setAttribute('aria-hidden', 'true');
        group.prepend(bubble);

        let last = null;
        const place = (animate) => {
            const active = buttons.find((b) => b.getAttribute('aria-pressed') === 'true') || buttons[0];
            if (!active) return;
            bubble.classList.toggle('no-anim', !animate);
            bubble.style.width = active.offsetWidth + 'px';
            bubble.style.height = active.offsetHeight + 'px';
            bubble.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
            if (animate && last && last !== active) {
                // squash-and-stretch "bubble" while it travels
                bubble.classList.remove('wobble');
                void bubble.offsetWidth;
                bubble.classList.add('wobble');
            }
            last = active;
        };

        place(false);
        requestAnimationFrame(() => group.classList.add('seg-ready'));
        new MutationObserver(() => place(true)).observe(group, { attributes: true, subtree: true, attributeFilter: ['aria-pressed'] });
        window.addEventListener('resize', () => place(false));
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => place(false));
    });

    // ========================= FLOATING CONTACT BUTTON =========================
    const pageName = window.location.pathname.split('/').pop() || 'home.html';
    if (pageName !== 'contact.html') {
        const fab = document.createElement('a');
        fab.href = 'contact.html';
        fab.className = 'fab-contact';
        fab.setAttribute('aria-label', 'Contact us');
        fab.innerHTML = `
            <span class="fab-label">Talk to us</span>
            <span class="fab-circle" aria-hidden="true">
                <svg class="fab-phone" viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            </span>`;
        document.body.appendChild(fab);
    }

    // ========================= FLOATING BLOG BUTTON =========================
    if (pageName !== 'blog.html') {
        const blogFab = document.createElement('a');
        blogFab.href = 'blog.html';
        blogFab.className = 'fab-blog';
        blogFab.setAttribute('aria-label', 'Read the A2P Blog, 1 new article');
        blogFab.innerHTML = `
            <span class="fab-circle" aria-hidden="true">
                <svg class="fab-book" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 5.5C2 4.7 2.7 4 3.5 4H9a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H3.5C2.7 17.5 2 16.8 2 16V5.5z"/>
                    <path class="fab-book-page" d="M22 5.5c0-.8-.7-1.5-1.5-1.5H15a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5h6c.8 0 1.5-.7 1.5-1.5V5.5z"/>
                    <path d="M5 8h4M5 11h4M15 8h4M15 11h4" stroke-width="1.6"/>
                </svg>
            </span>
            <span class="fab-badge" aria-hidden="true">1</span>
            <span class="fab-label">A2P Blog</span>`;
        document.body.appendChild(blogFab);
    }

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
    // Keeps any prefix/suffix (e.g. "₹", "Cr+", " yrs") and the number's comma format
    const countUp = (element, target, prefix, suffix, useCommas, duration = 2000) => {
        let current = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            const value = Math.ceil(current);
            element.textContent = prefix + (useCommas ? value.toLocaleString('en-IN') : value) + suffix;
        }, 16);
    };

    // Trigger count animation when stat is in view
    statNumbers.forEach(el => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const match = el.textContent.match(/^(\D*)([\d,]+)(.*)$/);
                    if (match) {
                        const number = parseInt(match[2].replace(/,/g, ''), 10);
                        if (number) countUp(el, number, match[1], match[3], match[2].includes(','));
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


// Sticky "reveal" footer: the footer stays fixed at the bottom of the screen and the page (with its bouncy
// scroll) slides over it, uncovering it at the end. The floating Blog / Contact buttons turn deep violet once
// the footer shows behind them, and the footer's animations only run while it can be seen.
(function () {
    const foot = document.querySelector('.hm-foot');
    if (!foot) return;
    const wrap = document.createElement('div');
    wrap.className = 'page-wrap';
    const kids = [...document.body.children].filter((el) => el !== foot && el.tagName !== 'SCRIPT' && el.tagName !== 'NOSCRIPT');
    document.body.insertBefore(wrap, kids[0] || foot);
    kids.forEach((el) => wrap.appendChild(el));

    const size = () => {
        // A footer taller than most of the screen (e.g. a phone held sideways) stays a normal footer instead
        const fits = foot.offsetHeight < window.innerHeight * 0.8;
        document.body.classList.toggle('reveal-foot', fits);
        document.documentElement.style.setProperty('--foot-h', foot.offsetHeight + 'px');
    };
    let tick = false;
    const check = () => {
        tick = false;
        const edge = document.body.classList.contains('reveal-foot') ? wrap.getBoundingClientRect().bottom : foot.getBoundingClientRect().top;
        foot.classList.toggle('hf-on', edge < window.innerHeight);
        document.body.classList.toggle('hf-near', edge < window.innerHeight - 40);
    };
    new ResizeObserver(() => { size(); check(); }).observe(foot);
    window.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(check); } }, { passive: true });
    window.addEventListener('resize', () => { size(); check(); });
    size();
    check();
})();


// Rupee rain: ₹ symbols fall from the mouse over any section marked data-rupee-rain (a tap makes a small burst on touch screens)
document.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const COLORS = ['#667eea', '#5568d3', '#f4a700', '#10b981', '#8b9cf4', '#f5576c'];
    const MAX = 45;
    document.querySelectorAll('[data-rupee-rain]').forEach((hero) => {
        const rain = document.createElement('div');
        rain.className = 'hm-rain';
        rain.setAttribute('aria-hidden', 'true');
        hero.prepend(rain);
        let last = 0;
        const drop = (x, y) => {
            if (rain.childElementCount >= MAX) rain.firstElementChild.remove();
            const c = document.createElement('span');
            c.className = 'hm-coin';
            c.textContent = '₹';
            const size = 14 + Math.random() * 16;
            c.style.cssText = `font-size:${size}px;color:${COLORS[(Math.random() * COLORS.length) | 0]};` +
                `--x:${x - size / 3}px;--y:${y - size / 2}px;--dx:${(Math.random() - 0.5) * 70}px;` +
                `--fall:${120 + Math.random() * 160}px;--rot:${(Math.random() - 0.5) * 300}deg;--dur:${1.2 + Math.random() * 0.9}s;`;
            c.addEventListener('animationend', () => c.remove());
            rain.appendChild(c);
        };
        const pos = (e) => { const r = hero.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
        hero.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse') return;
            const now = performance.now();
            if (now - last < 45) return;          // a steady trickle, not a flood
            last = now;
            const [x, y] = pos(e);
            drop(x, y);
            if (Math.random() < 0.35) drop(x + (Math.random() - 0.5) * 24, y + (Math.random() - 0.5) * 12);
        });
        hero.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse') return;
            const [x, y] = pos(e);
            for (let i = 0; i < 7; i++) setTimeout(() => drop(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 20), i * 40);
        });
    });
});
