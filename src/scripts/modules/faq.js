/**
 * faq.js — Acordeón de preguntas frecuentes (sólo una abierta a la vez)
 */
export function initFaq() {
  const items = document.querySelectorAll('.accordion-item');
  if (!items.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel   = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Cerrar todos los ítems abiertos
      items.forEach((openItem) => {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
        openItem.querySelector('.accordion-panel').style.maxHeight = null;
      });

      // Abrir el ítem clickeado (si estaba cerrado)
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });
}
