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
