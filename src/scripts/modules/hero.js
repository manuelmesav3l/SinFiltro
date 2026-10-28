/**
 * hero.js — Fondo del hero, parallax de halos + citas rotatorias con altura dinámica
 * El hero en sí es fijo: no se desplaza, no se funde ni se oscurece al hacer scroll.
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmallScreen = () => window.innerWidth < 700;

// ── Background de Video y Plate ───────────────────────────
export function initHeroBackground() {
  const video = document.querySelector('.hero-bg__video');
  if (!video) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    video.pause();
    return;
  }

  function handleLoaded() {
    video.classList.add('is-loaded');
  }

  if (video.readyState >= 2) {
    handleLoaded();
  } else {
    video.addEventListener('loadeddata', handleLoaded, { once: true });
  }

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Si el navegador bloquea autoplay, se mantiene visible la imagen still plate
    });
  }
}

// ── Parallax de halos (el hero permanece fijo) ────────────
export function initHeroParallax() {
  if (prefersReducedMotion || isSmallScreen()) return;

  const heroSection = document.getElementById('inicio');

  const filoSection = document.getElementById('filosofia');
  const filoCopy = document.querySelector('.filosofia-header');

  const ctaSection = document.getElementById('cta-tab');
  const ctaCopy = document.querySelector('.cta-copy');
  const porQueSection = document.getElementById('por-que-diferente');
  const haloCards = document.querySelectorAll('.halo-card');

  if (!heroSection) return;

  let windowH = window.innerHeight;
  let heroH = heroSection.offsetHeight || windowH;
  let ctaTop = ctaSection ? ctaSection.offsetTop : heroH;
  let porQueTop = porQueSection ? porQueSection.offsetTop : ctaTop + windowH;

  function updateMetrics() {
    windowH = window.innerHeight;
    heroH = heroSection.offsetHeight || windowH;
    if (ctaSection) ctaTop = ctaSection.offsetTop;
    if (porQueSection) porQueTop = porQueSection.offsetTop;
  }

  window.addEventListener('resize', updateMetrics, { passive: true });
  updateMetrics();

  let ticking = false;

  function onHeroScroll() {
    const scrollY = window.scrollY;

    // Halo Cards Parallax Ultra Fluido
    haloCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < windowH && rect.bottom > 0) {
        const centerOffset = rect.top + rect.height / 2 - windowH / 2;
        const halo = card.querySelector('.halo');
        if (halo) {
          halo.style.transform = `translate3d(-50%, calc(-50% + ${centerOffset * 0.15}px), 0)`;
        }
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onHeroScroll);
      ticking = true;
    }
  }, { passive: true });

  onHeroScroll();
}

// ── Citas animadas — Teclado que escribe, borra y vuelve a escribir (Typewriter) ──
const HERO_QUOTES = [
  'No existen relaciones perfectas. Existen relaciones que se construyen con intención.',
  'Nadie nos enseñó a relacionarnos. Por eso decidimos empezar la conversación.',
  'No tenemos todas las respuestas. Pero sí algunas preguntas que vale la pena hacerse.',
  'No importa el tipo de relación que elijas. Importa cómo la construyes.',
  'No se trata de amar diferente. Se trata de amar con más conciencia.',
  'Las relaciones cambian. Tú también. Tus conversaciones deberían hacerlo.',
  'El problema no fue la otra persona. Fue un modelo que nadie eligió y todo el mundo firmó.'
];

export function initHeroQuotes() {
  const container = document.getElementById('heroQuote');
  if (!container) return;

  // Quitar cualquier contenedor de controles / stepper residual
  const oldControls = document.getElementById('heroQuoteControls');
  if (oldControls) oldControls.remove();

  // Asegurar elementos internos de texto y cursor
  let textEl = container.querySelector('.typewriter-text');
  let cursorEl = container.querySelector('.typewriter-cursor');

  if (!textEl) {
    container.innerHTML = '<span class="typewriter-text"></span><span class="typewriter-cursor" aria-hidden="true">|</span>';
    textEl = container.querySelector('.typewriter-text');
    cursorEl = container.querySelector('.typewriter-cursor');
  }

  if (prefersReducedMotion) {
    textEl.textContent = HERO_QUOTES[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timeoutId = null;
  let isHovered = false;

  function typeLoop() {
    if (isHovered && !isDeleting) {
      // Si el usuario tiene el cursor encima leyendo, esperar un poco más
      timeoutId = setTimeout(typeLoop, 500);
      return;
    }

    const currentPhrase = HERO_QUOTES[phraseIndex];

    if (!isDeleting) {
      // Escribiendo letra por letra
      charIndex++;
      textEl.textContent = currentPhrase.substring(0, charIndex);

      if (charIndex === currentPhrase.length) {
        // Frase completa: pausa para lectura
        isDeleting = true;
        timeoutId = setTimeout(typeLoop, 2800);
        return;
      }

      // Velocidad humana orgánica de teclado (entre 30ms y 55ms)
      const typingSpeed = 35 + Math.random() * 20;
      timeoutId = setTimeout(typeLoop, typingSpeed);
    } else {
      // Borrando letra por letra
      charIndex--;
      textEl.textContent = currentPhrase.substring(0, charIndex);

      if (charIndex === 0) {
        // Frase completamente borrada: pasar a la siguiente frase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % HERO_QUOTES.length;
        // Pausa breve antes de comenzar a escribir la siguiente
        timeoutId = setTimeout(typeLoop, 400);
        return;
      }

      // Velocidad rápida al borrar (backspace: 18ms)
      timeoutId = setTimeout(typeLoop, 18);
    }
  }

  // Pausa durante hover para lectura cómoda
  container.addEventListener('mouseenter', () => { isHovered = true; });
  container.addEventListener('mouseleave', () => { isHovered = false; });

  // Iniciar la animación
  timeoutId = setTimeout(typeLoop, 600);
}

// ── Reveal on scroll (Carga instantánea asegurada) ──────────────────────
export function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  els.forEach((el) => el.classList.add('in-view', 'visible'));
}
