/**
 * OINP Proposal Comment - Interactive Features
 *
 * Features:
 * - Countdown timer to January 1, 2026
 * - Scroll-triggered animations using Intersection Observer
 * - Smooth scroll navigation
 */

(function() {
    'use strict';

    // ==========================================================================
    // Countdown Timer
    // ==========================================================================

    const DEADLINE = new Date('January 1, 2026 00:00:00 EST').getTime();

    /**
     * Update countdown display
     */
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = DEADLINE - now;

        // Time calculations
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Format with leading zeros
        const format = (num) => num.toString().padStart(2, '0');

        // Update hero countdown
        updateElement('days', format(days));
        updateElement('hours', format(hours));
        updateElement('minutes', format(minutes));
        updateElement('seconds', format(seconds));

        // Update footer countdown
        updateElement('days-footer', format(days));
        updateElement('hours-footer', format(hours));
        updateElement('minutes-footer', format(minutes));
        updateElement('seconds-footer', format(seconds));

        // If countdown is over
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.querySelectorAll('.countdown').forEach(el => {
                el.innerHTML = '<p style="font-size: 1.5rem; color: var(--color-red);">Deadline Passed</p>';
            });
        }
    }

    /**
     * Safely update element content
     */
    function updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) {
            // Add flip animation class
            if (el.textContent !== value) {
                el.classList.add('flip');
                setTimeout(() => el.classList.remove('flip'), 300);
            }
            el.textContent = value;
        }
    }

    // Start countdown
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    // ==========================================================================
    // Scroll-Triggered Animations
    // ==========================================================================

    /**
     * Initialize Intersection Observer for scroll animations
     */
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');

        if (!animatedElements.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Get delay from data attribute or default to 0
                    const delay = entry.target.dataset.delay || 0;

                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, parseInt(delay));

                    // Optionally unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    // ==========================================================================
    // Smooth Scroll Navigation
    // ==========================================================================

    /**
     * Initialize smooth scrolling for anchor links
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip if it's just "#"
                if (href === '#') return;

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without scrolling
                    history.pushState(null, null, href);
                }
            });
        });
    }

    // ==========================================================================
    // Navigation Scroll Effect
    // ==========================================================================

    /**
     * Add background to nav on scroll
     */
    function initNavScroll() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                nav.style.background = 'rgba(10, 22, 40, 0.95)';
                nav.style.backdropFilter = 'blur(10px)';
                nav.style.padding = '0.75rem 1.5rem';
            } else {
                nav.style.background = 'transparent';
                nav.style.backdropFilter = 'none';
                nav.style.padding = '1.5rem';
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ==========================================================================
    // Risk Meter Animation
    // ==========================================================================

    /**
     * Animate risk meter fills when visible
     */
    function initRiskMeters() {
        const meters = document.querySelectorAll('.risk-meter .fill');

        if (!meters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.transition = 'width 1s ease-out';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        meters.forEach(meter => observer.observe(meter));
    }

    // ==========================================================================
    // Floating Action Button Visibility
    // ==========================================================================

    /**
     * Show/hide FAB based on scroll position
     */
    function initFAB() {
        const fab = document.querySelector('.fab');
        if (!fab) return;

        const hero = document.querySelector('.hero');
        const heroHeight = hero ? hero.offsetHeight : 0;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > heroHeight * 0.5) {
                fab.style.opacity = '1';
                fab.style.pointerEvents = 'auto';
            } else {
                fab.style.opacity = '0';
                fab.style.pointerEvents = 'none';
            }
        }, { passive: true });

        // Initial state
        fab.style.opacity = '0';
        fab.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }

    // ==========================================================================
    // Parallax Effect for Hero Orbs
    // ==========================================================================

    /**
     * Subtle parallax on hero background orbs
     */
    function initParallax() {
        const orbs = document.querySelectorAll('.gradient-orb');
        if (!orbs.length) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const rate = scrolled * 0.3;

                    orbs.forEach((orb, index) => {
                        const direction = index % 2 === 0 ? 1 : -1;
                        orb.style.transform = `translateY(${rate * direction * 0.5}px)`;
                    });

                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ==========================================================================
    // Copy Share URL
    // ==========================================================================

    /**
     * Add click-to-copy functionality for share buttons
     */
    function initShareButtons() {
        // Add a copy link button functionality if needed
        const currentUrl = window.location.href;

        // You could add a "Copy Link" button that copies the URL
        // For now, the share buttons link to social platforms directly
    }

    // ==========================================================================
    // Comment Template Copy
    // ==========================================================================

    /**
     * Enable copy buttons for the comment template
     */
    function initTemplateCopy() {
        const copyButtons = document.querySelectorAll('[data-copy-target]');
        if (!copyButtons.length) return;

        copyButtons.forEach(button => {
            const defaultLabel = button.textContent;
            const statusId = button.dataset.statusTarget;
            const statusElement = statusId ? document.getElementById(statusId) : null;

            button.addEventListener('click', () => {
                const targetId = button.dataset.copyTarget;
                const targetElement = document.getElementById(targetId);

                if (!targetElement) return;

                const textToCopy = targetElement.value;

                const showSuccess = () => {
                    button.textContent = 'Copied';
                    button.classList.add('copied');
                    if (statusElement) {
                        statusElement.textContent = 'Copied';
                        statusElement.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-green') || '#2D9D5D';
                    }
                    setTimeout(() => {
                        button.textContent = defaultLabel;
                        button.classList.remove('copied');
                        if (statusElement) {
                            statusElement.textContent = '';
                            statusElement.style.color = '';
                        }
                    }, 2500);
                };

                const showFallback = () => {
                    if (statusElement) {
                        statusElement.textContent = 'Press Cmd/Ctrl+C after selecting';
                        statusElement.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-red') || '#C13838';
                    }
                };

                const fallbackCopy = () => {
                    targetElement.focus();
                    targetElement.select();
                    const successful = document.execCommand && document.execCommand('copy');
                    if (successful) {
                        showSuccess();
                    } else {
                        showFallback();
                    }
                };

                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(textToCopy)
                        .then(showSuccess)
                        .catch(fallbackCopy);
                } else {
                    fallbackCopy();
                }
            });
        });
    }

    // ==========================================================================
    // Initialize All Features
    // ==========================================================================

    /**
     * MPP lookup via OpenNorth
     */
    function initMppLookup() {
        const form = document.getElementById('mpp-form');
        const postalInput = document.getElementById('postalCodeInput');
        const statusEl = document.getElementById('mppStatus');
        const card = document.getElementById('mppCard');
        const nameEl = document.getElementById('mppName');
        const ridingEl = document.getElementById('mppRiding');
        const emailEl = document.getElementById('mppEmail');
        const emailCopyInput = document.getElementById('mppEmailCopyValue');
        const photoEl = document.getElementById('mppPhoto');
        const templateEl = document.getElementById('emailTemplateText');
        const templateDetails = document.getElementById('mppTemplate');
        const submitButton = document.getElementById('findMppButton');
        const verifyWrap = document.getElementById('mppVerify');
        const verifyLink = document.getElementById('mppLink');

        if (!form || !postalInput || !statusEl || !card || !nameEl || !ridingEl || !emailEl || !emailCopyInput || !photoEl || !templateEl || !submitButton || !verifyWrap || !verifyLink) {
            return;
        }

        const DEFAULT_PHOTO = 'https://placehold.co/160x160?text=MPP';

        const setStatus = (message, type = '') => {
            statusEl.textContent = message;
            statusEl.classList.remove('error', 'success');
            if (type) statusEl.classList.add(type);
        };

        const setLoading = (isLoading) => {
            submitButton.disabled = isLoading;
            submitButton.textContent = isLoading ? 'Finding…' : 'Find MPP';
        };

        const normalizePostal = (value) => value.replace(/\s+/g, '').toUpperCase();
        const isValidPostal = (value) => /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(value);

        const clearCard = () => {
            card.style.display = 'none';
            nameEl.textContent = '—';
            ridingEl.textContent = '—';
            emailEl.textContent = '—';
            emailCopyInput.value = '';
            photoEl.src = DEFAULT_PHOTO;
            verifyWrap.style.display = 'none';
            verifyLink.removeAttribute('href');
        };

        const buildTemplate = (mpp, cleanCode) => {
            const lastName = mpp.last_name || mpp.name || 'MPP';
            const district = mpp.district_name || 'your riding';
            const mppName = mpp.name || 'Your local MPP';
            const mppEmail = mpp.email || 'their official email';
            return `Subject: Urgent Comment on Proposal 25-MLITSD019

To: minister.mlitsd@ontario.ca
CC: ${mppName} (${mppEmail}); your program/international office

Dear Minister,

I am a graduate student residing in Ontario. I am writing to express my deep concern regarding the proposed elimination of the OINP Masters and PhD graduate streams.

[Add 1–2 sentences about your program, graduation timing, and local contributions.]

Key requests:
- Preserve an independent graduate pathway.
- Grandfather current students who started under the existing rules.

Thank you for your attention. I would welcome a brief conversation to discuss.

Sincerely,
[Your Name]`;
        };

        clearCard();
        setStatus('');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const cleanCode = normalizePostal(postalInput.value || '');

            clearCard();
            setStatus('');

            if (!cleanCode || !isValidPostal(cleanCode)) {
                setStatus('Please enter a valid Ontario postal code (e.g., K1R0G6).', 'error');
                return;
            }

            setLoading(true);

            try {
                const response = await fetch(`https://represent.opennorth.ca/postcodes/${cleanCode}/`);
                if (!response.ok) throw new Error('Invalid Postal Code');

                const data = await response.json();
                const mpp = data?.representatives_centroid?.find(rep => rep.elected_office === 'MPP');

                if (!mpp) {
                    setStatus('Could not find MPP for this postal code. Please double-check and try again.', 'error');
                    return;
                }

                const email = mpp.email || 'Not provided';
                nameEl.textContent = mpp.name || 'Your MPP';
                ridingEl.textContent = mpp.district_name || '';
                emailEl.textContent = email;
                emailCopyInput.value = email;

                photoEl.src = mpp.photo_url || DEFAULT_PHOTO;
                photoEl.alt = mpp.name ? `${mpp.name} portrait` : 'MPP portrait';

                const profileUrl = mpp.url || mpp.personal_url || null;
                if (profileUrl) {
                    verifyLink.href = profileUrl;
                    verifyWrap.style.display = 'block';
                } else {
                    verifyWrap.style.display = 'none';
                }

                card.style.display = 'block';
                templateEl.value = buildTemplate(mpp, cleanCode);
                templateDetails.removeAttribute('open');

                setStatus('Found your MPP. Copy their email or open the draft below.', 'success');
            } catch (error) {
                setStatus('Error finding MPP. Please try again.', 'error');
                console.error('MPP lookup failed:', error);
            } finally {
                setLoading(false);
            }
        });
    }

    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAll);
        } else {
            initAll();
        }
    }

    function initAll() {
        initScrollAnimations();
        initSmoothScroll();
        initNavScroll();
        initRiskMeters();
        initFAB();
        initParallax();
        initShareButtons();
        initTemplateCopy();
        initMppLookup();

        // Log initialization
        console.log('OINP Proposal Comment page initialized');
    }

    // Start the application
    init();

    // ==========================================================================
    // Utility: Add CSS for flip animation
    // ==========================================================================

    const style = document.createElement('style');
    style.textContent = `
        .countdown-value.flip {
            animation: flipNumber 0.3s ease;
        }

        @keyframes flipNumber {
            0% { transform: rotateX(0); }
            50% { transform: rotateX(-90deg); opacity: 0.5; }
            100% { transform: rotateX(0); }
        }

        .fab {
            opacity: 0;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

})();
