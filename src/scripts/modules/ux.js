/**
 * ux.js — Mejoras de experiencia de usuario
 *
 * Módulo independiente que maneja:
 *  1. Barra de progreso de scroll
 *  2. Botón "Volver arriba"
 *  3. Detección de sección activa en navegación
 *  4. Indicador de scroll en tablas (overflow)
 *  5. Animación de entrada staggered en cards
 */

// ── 1. Scroll Progress Bar ────────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  function updateProgress() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = `${Math.min(progress, 100)}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ── 2. Back to Top Button ─────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function toggleVisibility() {
    const shouldShow = window.scrollY > 500;
    btn.classList.toggle('visible', shouldShow);
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
}

// ── 3. Active nav link basado en sección visible ──────────────
function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const href = link.getAttribute('href')?.replace('#', '');
          link.classList.toggle('active', href === id);
        });
      });
    },
    {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    }
  );

  sections.forEach((s) => observer.observe(s));
}

// ── 4. Table overflow indicator ───────────────────────────────
function initTableOverflow() {
  const wrappers = document.querySelectorAll('.table-wrapper');
  if (!wrappers.length) return;

  function checkOverflow(wrapper) {
    const table = wrapper.querySelector('table');
    if (!table) return;
    const hasOverflow = table.scrollWidth > wrapper.clientWidth;
    wrapper.classList.toggle('has-overflow', hasOverflow);
  }

  wrappers.forEach((w) => {
    checkOverflow(w);
    w.addEventListener('scroll', () => {
      // Ocultar gradiente si ya se llegó al final
      const atEnd = w.scrollLeft + w.clientWidth >= w.scrollWidth - 4;
      if (atEnd) w.classList.remove('has-overflow');
    });
  });

  window.addEventListener('resize', () => wrappers.forEach(checkOverflow), { passive: true });
}

// ── 5. Staggered reveal para cards de podcast/evento ─────────
function initStaggerReveal() {
  const staggerGroups = document.querySelectorAll(
    '.podcast-action-cards, .proximos-eventos, .cards'
  );
  if (!staggerGroups.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const children = Array.from(entry.target.children);
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * 80}ms`;
          child.classList.add('in-view');
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  staggerGroups.forEach((group) => {
    Array.from(group.children).forEach((child) => {
      if (!child.classList.contains('reveal')) {
        child.classList.add('reveal');
      }
    });
    observer.observe(group);
  });
}

// ── 6. Hover interactivo en filas de tabla ────────────────────
function initTableHover() {
  document.querySelectorAll('.sf-table tbody tr').forEach((row) => {
    row.style.cursor = 'default';
  });
}

// ── Export principal ──────────────────────────────────────────
export function initUX() {
  initScrollProgress();
  initBackToTop();
  initActiveNav();
  initTableOverflow();
  initStaggerReveal();
  initTableHover();
}
