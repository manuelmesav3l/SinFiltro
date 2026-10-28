/**
 * encuentros.js — Selector de formatos de encuentros (patrón WAI-ARIA "tabs")
 *
 * Pestañas verticales + paneles de detalle. Soporta ratón, tacto y teclado:
 * flechas (↑ ↓ ← →), Inicio y Fin; solo la pestaña activa entra en el orden de tabulación.
 */

export function initEncuentros() {
  const root = document.getElementById('formatosContainer');
  if (!root) return;

  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  if (!tabs.length) return;

  function select(tab, { focus = false } = {}) {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    });

    panels.forEach((p) => p.classList.toggle('active', p.id === tab.dataset.target));
    if (focus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));

    tab.addEventListener('keydown', (e) => {
      const last = tabs.length - 1;
      const next = {
        ArrowDown: i === last ? 0 : i + 1,
        ArrowRight: i === last ? 0 : i + 1,
        ArrowUp: i === 0 ? last : i - 1,
        ArrowLeft: i === 0 ? last : i - 1,
        Home: 0,
        End: last,
      }[e.key];

      if (next === undefined) return;
      e.preventDefault();
      select(tabs[next], { focus: true });
    });
  });
}
