/* ══════════════════════════════════════
   AltyapıCode — Interactions only (no animations)
   ══════════════════════════════════════ */
(function() {

  // ── TERMINAL TAB SWITCHING ──
  var terminalTabs = document.querySelectorAll('.terminal-tab');
  var terminalPanels = document.querySelectorAll('.terminal-panel');
  terminalTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.dataset.tab;
      terminalTabs.forEach(function(t) { t.classList.remove('active'); });
      terminalPanels.forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.querySelector('.terminal-panel[data-panel="' + target + '"]');
      if (panel) panel.classList.add('active');
    });
  });

  // ── NAVBAR SCROLL ──
  var lastScroll = 0;
  var nav = document.querySelector('nav');
  window.addEventListener('scroll', function() {
    var s = window.pageYOffset;
    if (s > 50) nav.classList.add('nav-scrolled');
    else nav.classList.remove('nav-scrolled');
    if (s > 300) {
      if (s > lastScroll + 10) nav.classList.add('nav-hidden');
      else if (s < lastScroll - 10) nav.classList.remove('nav-hidden');
    } else nav.classList.remove('nav-hidden');
    lastScroll = s;
  }, { passive: true });

  // ── BACK TO TOP ──
  var btn = document.getElementById('backToTop');
  if (btn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 500) btn.classList.add('visible');
      else btn.classList.remove('visible');
    });
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── THEME TOGGLE ──
  var savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  var themeBtn = document.getElementById('themeToggle');
  function updateIcon() {
    if (!themeBtn) return;
    var current = document.documentElement.getAttribute('data-theme');
    themeBtn.textContent = current === 'light' ? '☀️' : '🌙';
  }
  updateIcon();
  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateIcon();
    });
  }

})();
