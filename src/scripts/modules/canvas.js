/**
 * canvas.js — Animación del hero con partículas de corazones y orbes
 */
export function initHeroCanvas() {
  const canvases = document.querySelectorAll('.hero-canvas, #heroCanvas, #ctaCanvas');
  if (!canvases.length) return;

  canvases.forEach(canvas => {
    initSingleCanvas(canvas);
  });
}

function initSingleCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Tamaño del canvas ──────────────────────────────────
  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // ── Forma de corazón ──────────────────────────────────
  function drawHeart(ctx, size) {
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.3);
    ctx.bezierCurveTo( size * 0.5, -size,  size * 1.1, -size * 0.2, 0,  size * 0.6);
    ctx.bezierCurveTo(-size * 1.1, -size * 0.2, -size * 0.5, -size, 0, -size * 0.3);
    ctx.closePath();
  }

  // ── Sistema de partículas ─────────────────────────────
  const PARTICLE_COUNT = 60;
  const particles      = [];

  const PALETTES = [
    'rgba(255,255,255,',
    'rgba(255,180,230,',
    'rgba(255,220,245,',
    'rgba(200,140,255,',
    'rgba(255,255,255,',
  ];

  function createParticle(initialSpawn = false) {
    const size      = 4 + Math.random() * 14;
    const colorBase = PALETTES[Math.floor(Math.random() * PALETTES.length)];

    return {
      x:          Math.random() * (canvas.width || 300),
      y:          initialSpawn ? Math.random() * (canvas.height || 300) : (canvas.height || 300) + size * 2,
      size,
      colorBase,
      opacity:    0.15 + Math.random() * 0.55,
      speedY:     0.2  + Math.random() * 0.6,
      speedX:     (Math.random() - 0.5) * 0.4,
      rotation:   Math.random() * Math.PI * 2,
      rotSpeed:   (Math.random() - 0.5) * 0.02,
      wobble:     Math.random() * Math.PI * 2,
      wobbleSpeed:0.01 + Math.random() * 0.02,
      wobbleAmp:  0.3  + Math.random() * 0.8,
      pulse:      Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02,
    };
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle(true));
  }

  // ── Orbes con gradiente ────────────────────────────────
  const orbs = Array.from({ length: 4 }, (_, i) => ({
    x:      ((canvas.width || 300) / 4) * i + (canvas.width || 300) / 8,
    y:      Math.random() * (canvas.height || 300),
    r:      180 + Math.random() * 160,
    phase:  Math.random() * Math.PI * 2,
    speedX: (Math.random() - 0.5) * 0.25,
    speedY: (Math.random() - 0.5) * 0.15,
    color:  i % 2 === 0 ? [186, 0, 124] : [55, 18, 96],
  }));

  // ── Loop de animación ──────────────────────────────────
  let rafId = null;
  let isVisible = true;

  function draw() {
    rafId = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo degradado
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#371260');
    grad.addColorStop(1, '#ba007c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Orbes
    orbs.forEach((orb) => {
      orb.phase += 0.005;
      orb.x += Math.sin(orb.phase) * orb.speedX;
      orb.y += Math.cos(orb.phase * 0.7) * orb.speedY;

      if (orb.x < -orb.r)               orb.x = canvas.width + orb.r;
      if (orb.x > canvas.width + orb.r)  orb.x = -orb.r;
      if (orb.y < -orb.r)               orb.y = canvas.height + orb.r;
      if (orb.y > canvas.height + orb.r) orb.y = -orb.r;

      const [r, g, b]  = orb.color;
      const g2 = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      g2.addColorStop(0, `rgba(${r},${g},${b},0.35)`);
      g2.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (prefersReduced) return;

    // Partículas
    particles.forEach((p, i) => {
      p.wobble    += p.wobbleSpeed;
      p.pulse     += p.pulseSpeed;
      p.rotation  += p.rotSpeed;
      p.x         += p.speedX + Math.sin(p.wobble) * p.wobbleAmp;
      p.y         -= p.speedY;

      if (p.y < -p.size * 3) {
        particles[i] = createParticle(false);
        return;
      }

      const alpha = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = `${p.colorBase}${alpha})`;
      drawHeart(ctx, p.size);
      ctx.fill();
      ctx.restore();
    });
  }

  if (!prefersReduced) {
    draw();

    // Pausar la animación cuando el canvas sale del viewport para ahorrar CPU/GPU
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && rafId === null) {
          draw();
        } else if (!isVisible && rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    }, { threshold: 0 });
    io.observe(canvas);
  } else {
    // Solo fondo estático en modo reducido
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#371260');
    grad.addColorStop(1, '#ba007c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
