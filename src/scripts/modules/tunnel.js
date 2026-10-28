/**
 * tunnel.js — Transición circular desde el Hero fijo
 * El Hero permanece inmóvil (sticky, sin parallax ni fundidos) mientras un
 * círculo de color de fondo crece desde su centro con el scroll y revela, completa y
 * unida, la sección "Acuerdos desde adentro" (título + tarjetas + CTA). Una vez
 * completo, la sección queda fija un tramo para leerla y luego continúa el scroll.
 *
 * El JS solo escribe una variable CSS (--reveal, 0 → 1); la geometría vive en tunnel.css.
 * Si la sección no cabe en una vista (móviles verticales) o hay movimiento reducido,
 * no se activa el círculo y la sección fluye normal.
 */

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
// El círculo termina al 60% del recorrido fijo; el resto mantiene la sección completa en pantalla
const REVEAL_END = 0.6;
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

export function initTunnel() {
  const zone = document.getElementById('circleTransition');
  const stage = zone ? zone.querySelector('.circle-transition__stage') : null;
  const section = zone ? zone.querySelector('.filosofia-acuerdos') : null;
  if (!zone || !stage || !section) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;

  // Alto del recorrido en que el stage permanece fijo
  const pinnedDistance = () => zone.offsetHeight - stage.offsetHeight;

  function update() {
    ticking = false;
    if (!zone.classList.contains('is-ready')) return;

    const pinned = pinnedDistance();
    const raw = pinned > 0 ? -zone.getBoundingClientRect().top / pinned : 0;
    const progress = easeInOutSine(clamp(raw / REVEAL_END, 0, 1));
    zone.style.setProperty('--reveal', progress.toFixed(4));
    zone.classList.toggle('is-revealed', progress >= 1);
  }

  // Activa el modo círculo solo si la sección completa cabe en una vista
  function layout() {
    const fits = !reducedMotion.matches && section.offsetHeight <= window.innerHeight + 1;
    zone.classList.toggle('is-ready', fits);
    if (!fits) {
      zone.style.removeProperty('--reveal');
      zone.classList.remove('is-revealed');
    }
    update();
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  // "Conoce nuestra filosofía": aterriza cuando el círculo ya reveló la sección completa
  document.querySelectorAll('[data-scroll-philosophy]').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (!zone.classList.contains('is-ready')) return; // ancla normal a #filosofia
      e.preventDefault();
      window.scrollTo({
        top: zone.offsetTop + pinnedDistance() * REVEAL_END,
        behavior: 'smooth',
      });
    });
  });

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(layout), { passive: true });
  reducedMotion.addEventListener?.('change', layout);
  document.fonts?.ready.then(layout); // el alto del contenido cambia al cargar las fuentes
  layout();
}
