/**
 * header.js — Header fijo en formato píldora + menú móvil accesible
 *
 * Menú móvil: se abre/cierra con el botón, con Escape (devuelve el foco al botón),
 * al tocar fuera, al elegir un enlace y al pasar a un ancho de escritorio.
 */
const DESKTOP_MQ = '(min-width: 900px)';

export function initHeader() {
  const header    = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (!header) return;

  // El header conserva siempre el diseño "píldora" (clase `scrolled` fija en el HTML);
  // solo se activa las transiciones tras el primer render.
  requestAnimationFrame(() => {
    header.classList.add('is-ready');
  });

  if (!navToggle || !navLinks) return;

  function setMenu(open, { returnFocus = false } = {}) {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (!open && returnFocus) navToggle.focus();
  }

  navToggle.addEventListener('click', () => {
    setMenu(!navLinks.classList.contains('open'));
  });

  // Elegir un enlace cierra el menú
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  // Escape cierra y devuelve el foco al botón
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      setMenu(false, { returnFocus: true });
    }
  });

  // Tocar fuera del header cierra el menú
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && !header.contains(e.target)) setMenu(false);
  });

  // Al pasar a escritorio (rotar tablet, redimensionar) se restablece el estado
  window.matchMedia(DESKTOP_MQ).addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });
}
