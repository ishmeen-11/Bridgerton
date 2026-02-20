/* ========================================
   Bridgerton Season 4 Part 2 — Countdown
   JavaScript: Timer, Particles, Animations
   ======================================== */

(function () {
    'use strict';

    // ─── Countdown Timer ────────────────────────────────────────
    const TARGET_DATE = new Date('2026-02-26T00:00:00-05:00'); // EST

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date();
        const diff = TARGET_DATE - now;

        if (diff <= 0) {
            // It's here!
            daysEl.textContent = '🎉';
            hoursEl.textContent = 'IT\'S';
            minutesEl.textContent = 'HERE';
            secondsEl.textContent = '🎉';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        animateNumber(daysEl, days);
        animateNumber(hoursEl, hours);
        animateNumber(minutesEl, minutes);
        animateNumber(secondsEl, seconds);
    }

    function animateNumber(el, value) {
        const padded = String(value).padStart(2, '0');
        if (el.textContent !== padded) {
            el.classList.add('flip');
            setTimeout(() => {
                el.textContent = padded;
                el.classList.remove('flip');
            }, 150);
        }
    }

    // Update every second
    updateCountdown();
    setInterval(updateCountdown, 1000);


    // ─── Particle System ────────────────────────────────────────
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 50;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = -(Math.random() * 0.4 + 0.1);
            this.opacity = Math.random() * 0.5 + 0.1;
            this.fadeDir = Math.random() > 0.5 ? 0.003 : -0.003;

            // Bridgerton palette
            const colors = [
                'rgba(201, 168, 76,',    // champagne gold
                'rgba(212, 175, 55,',    // bright gold
                'rgba(232, 212, 139,',   // pale gold
                'rgba(196, 180, 212,',   // lavender
                'rgba(163, 189, 212,',   // soft blue
                'rgba(232, 196, 200,',   // blush pink
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity += this.fadeDir;

            if (this.opacity <= 0.05 || this.opacity >= 0.6) {
                this.fadeDir *= -1;
            }

            // Reset if off-screen
            if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                this.reset();
                this.y = canvas.height + 10;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();

            // Glow effect
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color + (this.opacity * 0.15) + ')';
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
        resizeCanvas();
    });


    // ─── Scroll Reveal ──────────────────────────────────────────
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ─── Parallax on scroll (subtle) ────────────────────────────
    const hero = document.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (hero && scrollY < window.innerHeight) {
            hero.style.transform = `translateY(${scrollY * 0.15}px)`;
            hero.style.opacity = 1 - (scrollY / (window.innerHeight * 0.8));
        }
    });


    // ─── Dynamic sparkle burst on card hover ────────────────────
    const cards = document.querySelectorAll('.friend-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            createSparkles(e.currentTarget);
        });
    });

    function createSparkles(container) {
        const rect = container.getBoundingClientRect();

        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('span');
            const tx = (Math.random() - 0.5) * 80;
            const ty = (Math.random() - 0.5) * 80;
            const animName = 'sparkle_' + Math.floor(Math.random() * 100000);

            // Create unique keyframes for each sparkle
            const style = document.createElement('style');
            style.textContent = `
                @keyframes ${animName} {
                    0% { opacity: 1; transform: scale(1) translate(0,0); }
                    100% { opacity: 0; transform: scale(0) translate(${tx}px, ${ty}px); }
                }
            `;
            document.head.appendChild(style);

            sparkle.style.cssText = `
                position: fixed;
                pointer-events: none;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #f0c75e, transparent);
                border-radius: 50%;
                z-index: 999;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                animation: ${animName} 0.8s ease-out forwards;
            `;
            document.body.appendChild(sparkle);
            setTimeout(() => {
                sparkle.remove();
                style.remove();
            }, 900);
        }
    }

})();
