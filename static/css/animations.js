/* ══════════════════════════════════════
   AltyapıCode — Animations & Interactions
   ══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. SCROLL REVEAL ANIMATIONS ──
  // Elements fade/slide in as they enter viewport
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        
        // Stagger children animations
        const children = entry.target.querySelectorAll('.stagger-child');
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.1}s`;
          child.classList.add('revealed');
        });
        
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Mark elements for reveal
  const revealSelectors = [
    '.product-card',
    '.standard-card', 
    '.workflow-step',
    '.blog-card',
    '.stat-item',
    '.section-label',
    '.section-title',
    '.section-desc',
    '.cta-box',
    '.page-header',
    '.page-body'
  ];

  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('reveal-element');
      revealObserver.observe(el);
    });
  });

  // ── 2. COUNTER ANIMATION ──
  // Stats numbers count up from 0
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const h3 = entry.target.querySelector('h3');
        if (!h3 || h3.dataset.counted) return;
        
        h3.dataset.counted = 'true';
        const text = h3.textContent.trim();
        
        // Parse the target value
        let prefix = '';
        let suffix = '';
        let target = 0;
        
        if (text === '∞') {
          // Special case: just fade in
          return;
        } else if (text.includes('%')) {
          target = parseInt(text);
          suffix = '%';
        } else if (text.includes('+')) {
          target = parseInt(text);
          suffix = '+';
        } else {
          target = parseInt(text);
        }
        
        if (isNaN(target)) return;
        
        // Animate
        let current = 0;
        const duration = 1500;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          h3.textContent = prefix + Math.floor(current) + suffix;
        }, 16);
        
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-item').forEach(el => {
    counterObserver.observe(el);
  });

  // ── 3. TERMINAL TYPING EFFECT ──
  const terminalBody = document.querySelector('.terminal-body');
  if (terminalBody) {
    const terminalObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startTypingAnimation();
          terminalObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    terminalObserver.observe(terminalBody);
  }

  function startTypingAnimation() {
    const lines = document.querySelectorAll('.terminal-body > div');
    lines.forEach(line => {
      line.style.opacity = '0';
      line.style.transform = 'translateX(-8px)';
    });

    lines.forEach((line, i) => {
      setTimeout(() => {
        line.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        line.style.opacity = '1';
        line.style.transform = 'translateX(0)';
      }, i * 120);
    });
  }

  // ── 4. NAVBAR SCROLL EFFECT ──
  const nav = document.querySelector('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add/remove solid background
    if (currentScroll > 80) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
    
    // Hide/show on scroll direction
    if (currentScroll > lastScroll && currentScroll > 300) {
      nav.classList.add('nav-hidden');
    } else {
      nav.classList.remove('nav-hidden');
    }
    
    lastScroll = currentScroll;
  });

  // ── 5. PARALLAX ON HERO ──
  const heroGridBg = document.querySelector('.hero-grid-bg');
  const heroVisual = document.querySelector('.hero-visual');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    if (heroGridBg && scrolled < window.innerHeight) {
      heroGridBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
    
    if (heroVisual && scrolled < window.innerHeight) {
      heroVisual.style.transform = `translateY(${scrolled * 0.08}px)`;
    }
  });

  // ── 6. MAGNETIC HOVER ON BUTTONS ──
  document.querySelectorAll('.btn-primary, .nav-cta, .whatsapp-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.3s ease';
    });
    
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'none';
    });
  });

  // ── 7. TILT EFFECT ON CARDS ──
  document.querySelectorAll('.product-card, .standard-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const rotateX = (y - 0.5) * -8;
      const rotateY = (x - 0.5) * 8;
      
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.5s ease';
    });
    
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

  // ── 8. SMOOTH SCROLL FOR ANCHORS ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── 9. MOBILE MENU ──
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      mobileBtn.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileBtn.textContent = '☰';
      });
    });
  }

  // ── 10. CURSOR GLOW EFFECT ──
  const cursorGlow = document.createElement('div');
  cursorGlow.classList.add('cursor-glow');
  document.body.appendChild(cursorGlow);

  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });

  // ── 11. WORKFLOW STEP LINE ANIMATION ──
  const workflowSection = document.querySelector('.workflow-steps');
  if (workflowSection) {
    const progressLine = document.createElement('div');
    progressLine.classList.add('workflow-progress');
    workflowSection.style.position = 'relative';
    workflowSection.prepend(progressLine);

    const workflowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          progressLine.classList.add('animate');
          workflowObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    workflowObserver.observe(workflowSection);
  }

});
