/**
 * countdown.js — Módulo del Contador Central y Campaña de Expectativa Sin Filtro
 * 
 * Gestiona el tiempo restante hasta el 20 de Septiembre de 2026, 7:00 PM hora Colombia (UTC-5),
 * animaciones de expectativa, formulario VIP, audio inmersivo y redirección automática.
 */

// Fecha meta oficial de Lanzamiento: 20 de Septiembre de 2026 a las 7:00 PM Colombia (UTC-5)
const OFFICIAL_LAUNCH_DATE = new Date('2026-09-20T19:00:00-05:00');

export function initCountdown() {
  const daysEl = document.getElementById('countdownDays');
  const hoursEl = document.getElementById('countdownHours');
  const minutesEl = document.getElementById('countdownMinutes');
  const secondsEl = document.getElementById('countdownSeconds');
  const launchOverlay = document.getElementById('launchOverlay');

  // Si los elementos del contador no están en esta página, no ejecutar nada
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const urlParams = new URLSearchParams(window.location.search);
  const isTeaserMode = urlParams.has('teaser');
  const isTestFinishMode = urlParams.has('test_finish');

  // Si se pasa ?test_finish=true, fijar la fecha a 5 segundos en el futuro para pruebas rápidas
  let targetDate = OFFICIAL_LAUNCH_DATE;
  if (isTestFinishMode) {
    targetDate = new Date(Date.now() + 5000);
  }

  // Comprobar si ya pasó la fecha de lanzamiento al cargar la página
  if (Date.now() >= targetDate.getTime() && !isTeaserMode && !isTestFinishMode) {
    // Redirigir directamente al sitio web completo si ya se lanzó
    window.location.href = '/home.html';
    return;
  }

  let lastValues = { days: null, hours: null, minutes: null, seconds: null };
  let isRedirecting = false;

  function updateClock() {
    const now = Date.now();
    const diff = targetDate.getTime() - now;

    if (diff <= 0 && !isRedirecting) {
      isRedirecting = true;
      triggerLaunchSequence();
      return;
    }

    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      updateDigit(daysEl, days, 'days');
      updateDigit(hoursEl, hours, 'hours');
      updateDigit(minutesEl, minutes, 'minutes');
      updateDigit(secondsEl, seconds, 'seconds');
    }
  }

  function updateDigit(element, val, key) {
    const formatted = String(val).padStart(2, '0');
    if (lastValues[key] !== formatted) {
      lastValues[key] = formatted;
      element.textContent = formatted;
      element.classList.remove('tick-pop');
      void element.offsetWidth; // Force reflow
      element.classList.add('tick-pop');
    }
  }

  function triggerLaunchSequence() {
    // Actualizar contador a cero
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';

    // Mostrar overlay de lanzamiento
    if (launchOverlay) {
      launchOverlay.classList.add('active');
    }

    // Efecto de celebración con audio/fuegos si es posible
    triggerConfettiEffect();

    // Redirigir a la web principal tras 2.5 segundos
    setTimeout(() => {
      window.location.href = '/home.html';
    }, 2500);
  }

  // Iniciar temporizador
  updateClock();
  const timerInterval = setInterval(updateClock, 1000);

  // Inicializar funciones interactivas secundarias de la expectativa
  initVIPForm();
  initTeaserQuotes();
  initAmbientAudio();
  initTeaserParticles();
}

/* ── Formulario VIP ── */
function initVIPForm() {
  const form = document.getElementById('teaserForm');
  const feedback = document.getElementById('teaserFeedback');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input || !input.value) return;

    const email = input.value.trim();
    // Guardar en localStorage
    let saved = JSON.parse(localStorage.getItem('sinfiltro_vip_subscribers') || '[]');
    if (!saved.includes(email)) {
      saved.push(email);
      localStorage.setItem('sinfiltro_vip_subscribers', JSON.stringify(saved));
    }

    if (feedback) {
      feedback.textContent = '✨ ¡Gracias por unirte! Te notificaremos minutos antes del gran lanzamiento.';
      feedback.classList.add('success');
    }

    input.value = '';
  });
}

/* ── Frases Teaser Interactivas ── */
function initTeaserQuotes() {
  const quotes = [
    "No existen parejas perfectas. Existen relaciones que se construyen con intención.",
    "Nadie nos enseñó a relacionarnos. Por eso decidimos empezar la conversación sin tabúes.",
    "¿Qué pasaría si hablara de mis deseos sin miedo al juicio?",
    "No se trata de amar diferente. Se trata de amar con más conciencia y claridad.",
    "El problema no fue la otra persona. Fue un modelo que nadie eligió y todo el mundo firmó."
  ];

  const cardEl = document.getElementById('teaserQuoteCard');
  if (!cardEl) return;

  let index = 0;
  setInterval(() => {
    index = (index + 1) % quotes.length;
    cardEl.style.opacity = '0';
    cardEl.style.transform = 'translateY(10px)';

    setTimeout(() => {
      cardEl.textContent = quotes[index];
      cardEl.style.opacity = '1';
      cardEl.style.transform = 'translateY(0)';
    }, 400);
  }, 6000);
}

/* ── Audio de Ambiente Inmersivo (Web Audio API Synth) ── */
function initAmbientAudio() {
  const audioBtn = document.getElementById('ambientAudioBtn');
  if (!audioBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let oscillators = [];
  let gainNode = null;

  audioBtn.addEventListener('click', () => {
    if (!isPlaying) {
      startAmbientSound();
      audioBtn.classList.add('active');
      audioBtn.innerHTML = '🔊 Sonido Inmersivo Activado';
      isPlaying = true;
    } else {
      stopAmbientSound();
      audioBtn.classList.remove('active');
      audioBtn.innerHTML = '🔈 Activar Sonido Ambiental';
      isPlaying = false;
    }
  });

  function startAmbientSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 3);

      // Tríada ambiental suave (Frecuencias: 220Hz, 277.18Hz, 329.63Hz) - Acorde La Mayor cálido
      const freqs = [110, 164.81, 220, 277.18, 329.63];
      freqs.forEach(f => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime);
        osc.connect(gainNode);
        osc.start();
        oscillators.push(osc);
      });

      gainNode.connect(audioCtx.destination);
    } catch (e) {
      console.log('Audio no soportado o bloqueado por navegador', e);
    }
  }

  function stopAmbientSound() {
    if (gainNode && audioCtx) {
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
      setTimeout(() => {
        oscillators.forEach(osc => osc.stop());
        oscillators = [];
        audioCtx.close();
      }, 1000);
    }
  }
}

/* ── Partículas Teaser ── */
function initTeaserParticles() {
  const canvas = document.getElementById('teaserCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2.5 + 0.5,
    alpha: Math.random() * 0.5 + 0.2,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4 - 0.2
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(186, 0, 124, ${p.alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ba007c';
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ── Efecto de Confeti de Lanzamiento ── */
function triggerConfettiEffect() {
  const canvas = document.getElementById('teaserCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  const confetti = Array.from({ length: 120 }, () => ({
    x: width / 2,
    y: height / 2,
    vx: (Math.random() - 0.5) * 16,
    vy: (Math.random() - 0.5) * 16 - 4,
    size: Math.random() * 8 + 4,
    color: ['#ba007c', '#ff85d0', '#ffd700', '#ffffff', '#901bb0'][Math.floor(Math.random() * 5)],
    rotation: Math.random() * 360,
    rSpeed: Math.random() * 10 - 5
  }));

  function renderConfetti() {
    ctx.clearRect(0, 0, width, height);
    confetti.forEach(c => {
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.2; // gravedad
      c.rotation += c.rSpeed;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
      ctx.restore();
    });

    requestAnimationFrame(renderConfetti);
  }

  renderConfetti();
}
