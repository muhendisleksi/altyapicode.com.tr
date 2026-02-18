/* ══════════════════════════════════════
   AltyapıCode — Interactive Particle Background
   Engineering grid nodes with mouse interaction
   ══════════════════════════════════════ */

(function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-bg';
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 0;
    pointer-events: none;
  `;
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  let animationId;
  
  const CONFIG = {
    particleCount: 80,
    maxDistance: 150,       // Max connection distance
    mouseRadius: 200,      // Mouse influence radius
    mousePush: 0.08,       // How much mouse pushes particles
    baseSpeed: 0.3,
    particleSize: 1.5,
    lineOpacity: 0.15,
    particleColor: '34, 211, 238',   // cyan
    lineColor: '34, 211, 238',
    mouseGlowColor: '34, 211, 238',
    mouseGlowRadius: 250,
  };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(CONFIG.particleCount, Math.floor((width * height) / 15000));
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.baseSpeed,
        vy: (Math.random() - 0.5) * CONFIG.baseSpeed,
        size: Math.random() * CONFIG.particleSize + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        // Some particles are "anchor" nodes (bigger, brighter)
        isAnchor: Math.random() > 0.85
      });
    }
  }

  function drawMouseGlow() {
    if (mouse.x < 0) return;
    
    const gradient = ctx.createRadialGradient(
      mouse.x, mouse.y, 0,
      mouse.x, mouse.y, CONFIG.mouseGlowRadius
    );
    gradient.addColorStop(0, `rgba(${CONFIG.mouseGlowColor}, 0.06)`);
    gradient.addColorStop(0.5, `rgba(${CONFIG.mouseGlowColor}, 0.02)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      mouse.x - CONFIG.mouseGlowRadius,
      mouse.y - CONFIG.mouseGlowRadius,
      CONFIG.mouseGlowRadius * 2,
      CONFIG.mouseGlowRadius * 2
    );
  }

  function update() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Mouse interaction — push particles away gently
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < CONFIG.mouseRadius && dist > 0) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
        p.vx -= (dx / dist) * force * CONFIG.mousePush;
        p.vy -= (dy / dist) * force * CONFIG.mousePush;
      }
      
      // Move
      p.x += p.vx;
      p.y += p.vy;
      
      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;
      
      // Restore base velocity if too slow
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed < CONFIG.baseSpeed * 0.3) {
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;
      }
      
      // Bounce off edges (soft)
      if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
      if (p.x > width) { p.x = width; p.vx = -Math.abs(p.vx); }
      if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
      if (p.y > height) { p.y = height; p.vy = -Math.abs(p.vy); }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Mouse glow
    drawMouseGlow();
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < CONFIG.maxDistance) {
          const opacity = (1 - dist / CONFIG.maxDistance) * CONFIG.lineOpacity;
          
          // Brighter lines near mouse
          const midX = (particles[i].x + particles[j].x) / 2;
          const midY = (particles[i].y + particles[j].y) / 2;
          const mouseDist = Math.sqrt(
            (mouse.x - midX) ** 2 + (mouse.y - midY) ** 2
          );
          const mouseBoost = mouseDist < CONFIG.mouseRadius ? 
            (1 - mouseDist / CONFIG.mouseRadius) * 0.3 : 0;
          
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${CONFIG.lineColor}, ${opacity + mouseBoost})`;
          ctx.lineWidth = 0.5 + mouseBoost;
          ctx.stroke();
        }
      }
    }
    
    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Check mouse proximity for glow effect
      const mouseDist = Math.sqrt(
        (mouse.x - p.x) ** 2 + (mouse.y - p.y) ** 2
      );
      const isNearMouse = mouseDist < CONFIG.mouseRadius;
      
      const size = p.isAnchor ? p.size * 2.5 : p.size;
      const baseOpacity = p.isAnchor ? 0.8 : p.opacity;
      const glowBoost = isNearMouse ? (1 - mouseDist / CONFIG.mouseRadius) * 0.5 : 0;
      
      // Outer glow for anchor nodes or mouse-near particles
      if (p.isAnchor || isNearMouse) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CONFIG.particleColor}, ${0.05 + glowBoost * 0.1})`;
        ctx.fill();
      }
      
      // Core particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.particleColor}, ${baseOpacity + glowBoost})`;
      ctx.fill();
    }
  }

  function animate() {
    update();
    draw();
    animationId = requestAnimationFrame(animate);
  }

  // ── Event Listeners ──
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Touch support
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // ── Reduce motion preference ──
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    canvas.style.display = 'none';
  } else {
    resize();
    createParticles();
    animate();
  }

  // Pause when tab not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });

})();
