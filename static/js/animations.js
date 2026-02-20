/* ══════════════════════════════════════
   AltyapıCode — Animations & Interactions
   ══════════════════════════════════════ */

(function() {
  // ── SCROLL REVEAL (IntersectionObserver) ──
  const revealElements = document.querySelectorAll('.reveal-element');
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => observer.observe(el));
  }

  // ── TERMINAL TAB SWITCHING ──
  const terminalTabs = document.querySelectorAll('.terminal-tab');
  const terminalPanels = document.querySelectorAll('.terminal-panel');

  terminalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      terminalTabs.forEach(t => t.classList.remove('active'));
      terminalPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.querySelector('.terminal-panel[data-panel="' + target + '"]');
      if (panel) panel.classList.add('active');
    });
  });

  // ── STATS COUNTER ANIMATION ──
  const statItems = document.querySelectorAll('.stat-item h3');
  let statsAnimated = false;

  function animateCounters() {
    if (statsAnimated) return;
    statsAnimated = true;

    statItems.forEach(function(el) {
      const text = el.textContent.trim();
      const hasPlus = text.includes('+');
      const hasPercent = text.includes('%');

      var numStr = text.replace(/[+%]/g, '');
      var target = parseInt(numStr, 10);
      if (isNaN(target)) return;

      var duration = 1500;
      var start = performance.now();

      function tick(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(target * eased);

        var display = '';
        if (hasPercent) display = '%' + current;
        else display = current + (hasPlus ? '+' : '');

        el.textContent = display;

        if (progress < 1) requestAnimationFrame(tick);
      }

      el.textContent = hasPercent ? '%0' : '0';
      requestAnimationFrame(tick);
    });
  }

  var statsBar = document.querySelector('.stats-bar');
  if (statsBar) {
    var statsObserver = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        animateCounters();
        statsObserver.unobserve(statsBar);
      }
    }, { threshold: 0.3 });
    statsObserver.observe(statsBar);
  }

  // ── NAVBAR SCROLL BEHAVIOR ──
  var lastScroll = 0;
  var nav = document.querySelector('nav');

  window.addEventListener('scroll', function() {
    var currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }

    if (currentScroll > 300) {
      if (currentScroll > lastScroll + 10) {
        nav.classList.add('nav-hidden');
      } else if (currentScroll < lastScroll - 10) {
        nav.classList.remove('nav-hidden');
      }
    } else {
      nav.classList.remove('nav-hidden');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  // ── BACK TO TOP BUTTON ──
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
