/* AltyapıCode — GSAP Animations */
(function () {
  'use strict';
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero
  gsap.from('.hero-badge', { opacity: 0, y: 10, duration: 0.25 });
  gsap.from('.hero h1', { opacity: 0, y: 12, duration: 0.3, delay: 0.08 });
  gsap.from('.hero-desc', { opacity: 0, y: 8, duration: 0.25, delay: 0.15 });
  gsap.from('.hero-actions', { opacity: 0, y: 8, duration: 0.2, delay: 0.2 });
  gsap.from('.hero-visual', { opacity: 0, x: 15, duration: 0.35, delay: 0.15 });

  // Scroll elemanları
  var all = '.product-card, .standard-card, .workflow-step, .spec-metric-card, .pricing-card, .blog-card, .contact-channel, .section-label, .section-title, .section-desc, .specs-text, .specs-image, .cta-box, .testimonial-card, .footer-inner';

  gsap.utils.toArray(all).forEach(function (el) {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 98%' },
      opacity: 0, y: 12, duration: 0.25,
      clearProps: 'opacity,transform'
    });
  });
})();
