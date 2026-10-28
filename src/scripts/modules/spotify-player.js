/**
 * spotify-player.js — Playlist de Spotify en el header con reproducción automática
 *
 * Características:
 *  - Botón accesible en el header con ecualizador animado reactivo.
 *  - Tarjeta desplegable bajo el header con estética glassmorphism.
 *  - Integración con Spotify iFrame API v1 para control programático de reproducción.
 *  - Estrategia robusta de Autoplay respetando las directivas del navegador:
 *    Intenta reproducir inmediatamente; si la política del navegador exige interacción,
 *    se activa en el primer gesto del usuario (clic en página, botón de edad, o FAB).
 *  - Fallback a iframe nativo sin interrupción si falla la API externa.
 */

const SPOTIFY_PLAYLIST_URI = 'spotify:playlist:6vUsQULGQ2KDeQ76xxmJv6';
const SPOTIFY_IFRAME_API_URL = 'https://open.spotify.com/embed/iframe-api/v1';

export function initSpotifyPlayer() {
  const widget = document.getElementById('spotifyFloatingWidget');
  if (!widget) return;

  const card = document.getElementById('spotifyCard');
  const fabBtn = document.getElementById('spotifyFloatingBtn');
  const closeBtn = document.getElementById('spotifyCardClose');
  const playToggleBtn = document.getElementById('spotifyPlayToggle');
  const statusText = document.getElementById('spotifyStatusText');
  const embedContainer = document.getElementById('spotifyEmbedContainer');
  const ageGateYesBtn = document.getElementById('btnAgeGateYes');

  let embedController = null;
  let isPlaying = false;
  let hasUserInteracted = false;
  let userPaused = false; // el usuario pausó a propósito: abrir la tarjeta no debe reanudar

  // ── 1. Manejo del estado visual ─────────────────────────────
  function setPlayingState(playing) {
    isPlaying = playing;
    widget.classList.toggle('is-playing', playing);
    fabBtn?.classList.toggle('is-playing', playing);

    if (statusText) {
      statusText.textContent = playing ? 'Reproduciendo música' : 'Música en pausa';
    }

    if (playToggleBtn) {
      playToggleBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    }

    fabBtn?.setAttribute('aria-label', playing ? 'Playlist Sin Filtro: sonando, abrir reproductor' : 'Playlist Sin Filtro: abrir reproductor');
  }

  // Alinea la tarjeta bajo el botón sin salirse de la pantalla
  function positionCard() {
    if (!fabBtn || !card) return;
    // En móvil la posición la fija el CSS (ancho útil, bajo el header)
    if (window.innerWidth < 900) {
      widget.style.left = '';
      return;
    }
    const margin = 12;
    const cardWidth = card.offsetWidth || 380;
    const left = Math.min(fabBtn.getBoundingClientRect().left, window.innerWidth - cardWidth - margin);
    widget.style.left = `${Math.max(margin, left)}px`;
  }

  function openCard() {
    if (!card) return;
    positionCard();
    card.classList.add('is-open');
    card.setAttribute('aria-hidden', 'false');
    fabBtn?.setAttribute('aria-expanded', 'true');
  }

  function closeCard() {
    if (!card) return;
    card.classList.remove('is-open');
    card.setAttribute('aria-hidden', 'true');
    fabBtn?.setAttribute('aria-expanded', 'false');
  }

  function toggleCard() {
    if (!card) return;
    const isOpen = card.classList.contains('is-open');
    if (isOpen) {
      closeCard();
    } else {
      // Si el menú móvil estuviera abierto, cerrarlo para no solapar
      const navLinks = document.getElementById('navLinks');
      const navToggle = document.getElementById('navToggle');
      if (navLinks?.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
        navToggle?.setAttribute('aria-label', 'Abrir menú');
      }
      openCard();
      // Si aún no está reproduciendo (y no fue una pausa del usuario), iniciar al abrir
      if (!isPlaying && !userPaused) attemptPlay();
    }
  }

  // ── 2. Control de reproducción ──────────────────────────────
  function attemptPlay() {
    if (embedController) {
      try {
        embedController.play();
        setPlayingState(true);
      } catch (err) {
        console.info('Autoplay restringido por política de navegador hasta interacción:', err);
      }
    }
  }

  function attemptPause() {
    if (embedController) {
      try {
        embedController.pause();
        setPlayingState(false);
      } catch (err) {
        console.error('Error al pausar Spotify:', err);
      }
    }
  }

  function togglePlay() {
    if (isPlaying) {
      userPaused = true;
      attemptPause();
    } else {
      userPaused = false;
      attemptPlay();
    }
  }

  // ── 3. Disparador de interacción previa del usuario (Autoplay Policy) ─
  function onFirstUserGesture() {
    if (hasUserInteracted) return;
    hasUserInteracted = true;
    cleanupGestureListeners();
    attemptPlay();
  }

  function setupGestureListeners() {
    window.addEventListener('click', onFirstUserGesture, { once: true, passive: true });
    window.addEventListener('touchstart', onFirstUserGesture, { once: true, passive: true });
    window.addEventListener('keydown', onFirstUserGesture, { once: true, passive: true });
  }

  function cleanupGestureListeners() {
    window.removeEventListener('click', onFirstUserGesture);
    window.removeEventListener('touchstart', onFirstUserGesture);
    window.removeEventListener('keydown', onFirstUserGesture);
  }

  // ── 4. Carga e inicialización de Spotify iFrame API ──────────
  function setupSpotifyIframeApi() {
    // Si ya existe la función global previa, la encadenamos
    const previousReady = window.onSpotifyIframeApiReady;

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      if (typeof previousReady === 'function') previousReady(IFrameAPI);

      const targetEl = document.getElementById('spotifyEmbedContainer');
      if (!targetEl) return;

      const options = {
        uri: SPOTIFY_PLAYLIST_URI,
        width: '100%',
        height: '352'
      };

      IFrameAPI.createController(targetEl, options, (controller) => {
        embedController = controller;

        // Escuchar eventos de reproducción para sincronizar el estado visual
        controller.addListener('playback_update', (event) => {
          if (event && event.data) {
            const paused = Boolean(event.data.isPaused);
            setPlayingState(!paused);
          }
        });

        controller.addListener('ready', () => {
          // Intentar autoplay de inmediato
          attemptPlay();
        });

        // Intentar reproducción directa
        attemptPlay();
      });
    };

    // Inyectar el script oficial si no está presente
    if (!document.querySelector(`script[src="${SPOTIFY_IFRAME_API_URL}"]`)) {
      const script = document.createElement('script');
      script.src = SPOTIFY_IFRAME_API_URL;
      script.async = true;
      script.onerror = () => {
        console.warn('No se pudo cargar Spotify iFrame API (posible bloqueador). Manteniendo iframe estático.');
      };
      document.head.appendChild(script);
    }
  }

  // ── 5. Eventos de UI y Accesibilidad ─────────────────────────
  fabBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    // En móvil el botón vive en el menú: se cierra para que la tarjeta no quede debajo de él
    if (document.getElementById('navLinks')?.classList.contains('open')) {
      document.getElementById('navToggle')?.click(); // pasa por header.js: estado, etiqueta y aria coherentes
    }
    hasUserInteracted = true;
    cleanupGestureListeners();
    toggleCard();
  });

  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeCard();
  });

  playToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    hasUserInteracted = true;
    cleanupGestureListeners();
    togglePlay();
  });

  window.addEventListener('resize', () => {
    if (card?.classList.contains('is-open')) positionCard();
  }, { passive: true });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && card?.classList.contains('is-open')) {
      closeCard();
      fabBtn?.focus();
    }
  });

  // Cerrar al hacer clic fuera del widget
  document.addEventListener('click', (e) => {
    if (card?.classList.contains('is-open') && !widget.contains(e.target) && !fabBtn?.contains(e.target)) {
      closeCard();
    }
  });

  // Conexión con el modal de Age Gate si el usuario hace clic en "Sí tengo más de 18 años"
  if (ageGateYesBtn) {
    ageGateYesBtn.addEventListener('click', () => {
      hasUserInteracted = true;
      cleanupGestureListeners();
      // Pequeño timeout para permitir cierre del modal antes del autoplay
      setTimeout(() => {
        attemptPlay();
      }, 300);
    });
  }

  // ── Iniciar flujo ────────────────────────────────────────────
  setupGestureListeners();
  setupSpotifyIframeApi();
}
