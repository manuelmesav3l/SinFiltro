/**
 * portal.js — 3D Canvas Portal Window with Scroll Expansion Transition
 * Implements fake 3D perspective projection (focal length 850), pointer tilt,
 * rounded-rect point sampling (~44 pts), screen-locked cover mode, and smooth
 * expansion on scroll (cambio de hoja cinematográfico).
 */

export function initPortal() {
  const canvas = document.getElementById('portal-canvas');
  const portalEl = document.getElementById('portal');
  const portalVideo = document.getElementById('portal-video');
  const heroCopy = document.querySelector('.hero-copy');
  const portalHeading = document.querySelector('.portal-heading');

  if (!canvas || !portalEl) return;

  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Responsive Canvas Sizing (DPI-Aware) ──────────────────
  function resizeCanvas() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * d;
    canvas.height = window.innerHeight * d;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // ── Video Playback Management ────────────────────────────
  if (portalVideo) {
    portalVideo.muted = true;
    portalVideo.playsInline = true;
    portalVideo.loop = true;
    portalVideo.play().catch(() => {});
  }

  // ── Draw Media in Screen-Locked Cover Mode ────────────────
  function drawCover(media) {
    if (!media) return;
    const mw = media.videoWidth || media.naturalWidth || window.innerWidth;
    const mh = media.videoHeight || media.naturalHeight || window.innerHeight;
    const scale = Math.max(window.innerWidth / mw, window.innerHeight / mh);
    const w = mw * scale;
    const h = mh * scale;
    const x = (window.innerWidth - w) / 2;
    const y = (window.innerHeight - h) / 2;
    ctx.drawImage(media, x, y, w, h);
  }

  // ── Pointer Tilt (Fake 3D) ───────────────────────────────
  let targetX = 0;
  let targetY = 0;
  let rotX = 0;
  let rotY = 0;

  if (!prefersReduced) {
    window.addEventListener('pointermove', (e) => {
      targetY = (e.clientX / window.innerWidth - 0.5) * 37.4;
      targetX = (e.clientY / window.innerHeight - 0.5) * -33;
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
    });
  }

  // ── Rounded-Rect Point Sampling (~44 Points) ─────────────
  function sampleRoundedRect(w, h, r) {
    const points = [];
    const rad = Math.min(r, w / 2, h / 2);

    const corners = [
      { cx: w / 2 - rad,  cy: -h / 2 + rad, start: -Math.PI / 2, end: 0 },
      { cx: w / 2 - rad,  cy:  h / 2 - rad, start: 0,             end: Math.PI / 2 },
      { cx: -w / 2 + rad, cy:  h / 2 - rad, start: Math.PI / 2,   end: Math.PI },
      { cx: -w / 2 + rad, cy: -h / 2 + rad, start: Math.PI,       end: Math.PI * 1.5 }
    ];

    corners.forEach(corner => {
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const angle = corner.start + (corner.end - corner.start) * (i / steps);
        points.push({
          x: corner.cx + rad * Math.cos(angle),
          y: corner.cy + rad * Math.sin(angle)
        });
      }
    });

    return points;
  }

  // ── 3D Projection (Focal Length 850) ─────────────────────
  function projectPoints(points, cx, cy, rx, ry) {
    const ax = (rx * Math.PI) / 180;
    const ay = (ry * Math.PI) / 180;
    const cosAx = Math.cos(ax);
    const sinAx = Math.sin(ax);
    const cosAy = Math.cos(ay);
    const sinAy = Math.sin(ay);
    const focal = 850;

    return points.map(pt => {
      const xx = pt.x * cosAy;
      const yy = pt.y * cosAx;
      const z = pt.x * sinAy - pt.y * sinAx;
      const p = focal / (focal + z);
      return {
        x: cx + xx * p,
        y: cy + yy * p
      };
    });
  }

  // ── Easing (easeInOutCubic) ──────────────────────────────
  const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // ── Click to Travel to Next Section ──────────────────────
  portalEl.addEventListener('click', () => {
    const filoSection = document.getElementById('filosofia');
    if (filoSection) {
      filoSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // ── Main Render Loop ─────────────────────────────────────
  let lastTime = performance.now();

  function renderLoop() {
    requestAnimationFrame(renderLoop);

    const now = performance.now();
    const dt = Math.min(now - lastTime, 40);
    lastTime = now;

    if (!prefersReduced) {
      rotX += (targetX - rotX) * Math.min(1, dt * 0.009);
      rotY += (targetY - rotY) * Math.min(1, dt * 0.009);
    } else {
      rotX = 0;
      rotY = 0;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const rect = portalEl.getBoundingClientRect();
    const scrollY = window.scrollY;
    const triggerDistance = Math.max(window.innerHeight * 0.75, 450);
    const progress = Math.min(Math.max(scrollY / triggerDistance, 0), 1);
    const e = easeInOutCubic(progress);

    // Fade out hero copy and portal caption as portal expands
    if (heroCopy) {
      heroCopy.style.opacity = `${Math.max(1 - e * 1.6, 0)}`;
      heroCopy.style.transform = `translateY(${-e * 45}px)`;
    }
    if (portalHeading) {
      portalHeading.style.opacity = `${Math.max(1 - e * 2, 0)}`;
    }

    // When scrolled well beyond the hero, skip canvas drawing to save GPU
    if (scrollY > window.innerHeight * 1.8) {
      return;
    }

    const rectCx = rect.left + rect.width / 2;
    const rectCy = rect.top + rect.height / 2;

    const cx = rectCx + (window.innerWidth / 2 - rectCx) * e;
    const cy = rectCy + (window.innerHeight / 2 - rectCy) * e;

    const baseW = rect.width + (window.innerWidth - rect.width) * e;
    const baseH = rect.height + (window.innerHeight - rect.height) * e;

    const r = Math.max(90 * (1 - e), 0);
    const curRx = rotX * (1 - e);
    const curRy = rotY * (1 - e);

    if (baseW > 1 && baseH > 1) {
      const localPts = sampleRoundedRect(baseW, baseH, r);
      const projPts = projectPoints(localPts, cx, cy, curRx, curRy);

      ctx.save();
      ctx.beginPath();
      projPts.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();

      // Clip canvas strictly to the 3D projected portal path
      ctx.clip();

      // Fill rich obsidian dark inside the window
      ctx.fillStyle = '#07020d';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw portal video in screen-locked cover mode (parallax window!)
      if (portalVideo && portalVideo.readyState >= 2) {
        drawCover(portalVideo);
      }

      // Draw cinematic bottom shade
      const shadeY = window.innerHeight * 0.52;
      const shadeGrad = ctx.createLinearGradient(0, shadeY, 0, window.innerHeight);
      shadeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
      ctx.fillStyle = shadeGrad;
      ctx.fillRect(0, shadeY, window.innerWidth, window.innerHeight - shadeY);

      ctx.restore();

      // Glow border around the portal while expanding
      if (e < 0.98) {
        ctx.save();
        ctx.beginPath();
        projPts.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.strokeStyle = `rgba(230, 38, 70, ${0.45 * (1 - e)})`;
        ctx.lineWidth = Math.max(2 * (1 - e), 0.5);
        ctx.shadowColor = 'rgba(230, 38, 70, 0.6)';
        ctx.shadowBlur = 15 * (1 - e);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  requestAnimationFrame(renderLoop);
}
