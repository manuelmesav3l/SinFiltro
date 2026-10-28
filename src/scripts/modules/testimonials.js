/**
 * testimonials.js — Carrusel automático de testimonios
 */
export function initTestimonials() {
  const testimonials  = document.querySelectorAll('.testimonial');
  const dotsContainer = document.getElementById('testimonialDots');
  if (!testimonials.length || !dotsContainer) return;

  let current = 0;

  // Crear dots de navegación
  testimonials.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className   = `dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Ver testimonio ${i + 1}`);
    dot.addEventListener('click', () => showTestimonial(i));
    dotsContainer.appendChild(dot);
  });

  function showTestimonial(idx) {
    testimonials[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = idx % testimonials.length;
    testimonials[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
  }

  // Rotación automática cada 6 segundos
  setInterval(() => showTestimonial(current + 1), 6000);
}
