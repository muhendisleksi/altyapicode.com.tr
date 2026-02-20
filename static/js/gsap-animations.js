/* ══════════════════════════════════════
   AltyapıCode — GSAP ScrollTrigger Animations
   ══════════════════════════════════════ */
(function () {
  'use strict';

  // Guard: skip if GSAP not loaded
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Signal CSS that GSAP is handling animations
  document.documentElement.classList.add('gsap-ready');

  // Default ease
  var ease = 'power3.out';

  // After animation completes, clear only the animated props
  // so CSS hover/transition still works, but opacity stays at 1
  var cleanProps = 'opacity,transform';

  // ── HERO: staggered entrance ──
  var heroTl = gsap.timeline({ defaults: { ease: ease } });
  heroTl
    .from('.hero-badge',   { opacity: 0, y: 20, duration: 0.6 })
    .from('.hero h1',      { opacity: 0, y: 30, duration: 0.7 }, '-=0.3')
    .from('.hero-desc',    { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    .from('.hero-actions', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
    .from('.hero-visual',  { opacity: 0, x: 40, duration: 0.9 }, '-=0.6');

  // ── STATS BAR ──
  gsap.from('.stat-item', {
    scrollTrigger: { trigger: '.stats-bar', start: 'top 85%' },
    opacity: 0, y: 40, stagger: 0.12, duration: 0.7, ease: ease,
    clearProps: cleanProps
  });

  // ── SECTION HEADINGS ──
  gsap.utils.toArray('.section-label, .section-title, .section-desc').forEach(function (el) {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%' },
      opacity: 0, y: 24, duration: 0.65, ease: 'power2.out',
      clearProps: cleanProps
    });
  });

  // ── PRODUCT CARDS ──
  gsap.from('.product-card', {
    scrollTrigger: { trigger: '.products-grid', start: 'top 80%' },
    opacity: 0, y: 60, stagger: 0.15, duration: 0.8, ease: ease,
    clearProps: cleanProps
  });

  // ── STANDARDS ──
  gsap.from('.standard-card', {
    scrollTrigger: { trigger: '.standards-grid', start: 'top 80%' },
    opacity: 0, x: -40, stagger: 0.12, duration: 0.7, ease: 'power2.out',
    clearProps: cleanProps
  });

  // ── WORKFLOW STEPS ──
  gsap.from('.workflow-step', {
    scrollTrigger: { trigger: '.workflow-steps', start: 'top 80%' },
    opacity: 0, y: 50, stagger: 0.18, duration: 0.7, ease: ease,
    clearProps: cleanProps
  });

  // ── SPECS ──
  gsap.from('.specs-text', {
    scrollTrigger: { trigger: '.specs-hero', start: 'top 80%' },
    opacity: 0, x: -60, duration: 0.8, ease: 'power2.out',
    clearProps: cleanProps
  });
  gsap.from('.specs-image', {
    scrollTrigger: { trigger: '.specs-hero', start: 'top 80%' },
    opacity: 0, x: 60, scale: 1.03, duration: 0.8, ease: 'power2.out',
    clearProps: cleanProps
  });
  gsap.from('.spec-metric-card', {
    scrollTrigger: { trigger: '.specs-metrics-row', start: 'top 85%' },
    opacity: 0, y: 40, stagger: 0.12, duration: 0.7, ease: 'back.out(1.4)',
    clearProps: cleanProps
  });

  // ── PRICING CARDS ──
  gsap.from('.pricing-card', {
    scrollTrigger: { trigger: '.pricing-grid', start: 'top 80%' },
    opacity: 0, y: 50, stagger: 0.15, duration: 0.8, ease: ease,
    clearProps: cleanProps
  });

  // ── BLOG CARDS ──
  var blogGrid = document.querySelector('.blog-grid');
  if (blogGrid) {
    gsap.from('.blog-card', {
      scrollTrigger: { trigger: '.blog-grid', start: 'top 80%' },
      opacity: 0, y: 40, stagger: 0.12, duration: 0.7, ease: 'power2.out',
      clearProps: cleanProps
    });
  }

  // ── CTA BOX ──
  gsap.from('.cta-box', {
    scrollTrigger: { trigger: '.cta-section', start: 'top 80%' },
    opacity: 0, y: 30, duration: 0.8, ease: ease,
    clearProps: cleanProps
  });

  // ── CONTACT CHANNELS ──
  gsap.from('.contact-channel', {
    scrollTrigger: { trigger: '.contact-channels', start: 'top 85%' },
    opacity: 0, y: 30, stagger: 0.12, duration: 0.6, ease: 'power2.out',
    clearProps: cleanProps
  });

  // ── FOOTER ──
  gsap.from('.footer-inner', {
    scrollTrigger: { trigger: 'footer', start: 'top 90%' },
    opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
    clearProps: cleanProps
  });

})();
