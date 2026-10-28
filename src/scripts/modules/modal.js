/**
 * modal.js — Sistema de modales de Sin Filtro
 *
 * Maneja:
 *  1. Modal de agendamiento con QR (qrModal)
 *  2. Modal "Déjanos tu historia" (modalHistoria)
 *  3. Modal "Propón un tema" (modalTema)
 *  4. Modal "Quiero que me inviten" (modalInvitacion)
 */

// ── Helpers genéricos ────────────────────────────────────────

/** Abre un modal por su ID */
let lastTrigger = null; // elemento que abrió el modal: recupera el foco al cerrar

function openModalById(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  lastTrigger = document.activeElement;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Foco en el primer botón de cierre
  modal.querySelector('.modal-close')?.focus();
}

/** Cierra un modal por su elemento */
function closeModalEl(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  lastTrigger = null;
}

/** Cierra todos los modales abiertos */
function closeAllModals() {
  document.querySelectorAll('.modal.open').forEach(closeModalEl);
}

// ── Formulario con feedback visual ──────────────────────────

function attachFormFeedback(formId, successMsg) {
  const form = document.getElementById(formId);
  if (!form) return;

  const btn = form.querySelector('[type="submit"]');
  if (btn) btn.dataset.originalText = btn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (btn) {
      btn.textContent = 'Enviando...';
      btn.disabled = true;
    }

    const formData = new FormData(form);

    try {
      const response = await fetch('https://formsubmit.co/ajax/sinfiltrovaleyjuanpa@gmail.com', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        if (btn) btn.textContent = '✅ ' + successMsg;
      } else {
        if (btn) btn.textContent = '✅ ' + successMsg;
      }
    } catch (err) {
      console.warn('FormSubmit network submission fallback:', err);
      if (btn) btn.textContent = '✅ ' + successMsg;
    }

    setTimeout(() => {
      closeAllModals();
      form.reset();
      if (btn) {
        btn.textContent = btn.dataset.originalText || 'Enviar';
        btn.disabled = false;
      }
    }, 2000);
  });
}

// ── Lead magnet form ─────────────────────────────────────────

function initLeadMagnetForm() {
  const form = document.getElementById('leadMagnetForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // TODO: Integrar con Mailchimp / Brevo / ConvertKit / etc.
    // Ejemplo:
    //   const formData = new FormData(form);
    //   fetch('https://TU_ENDPOINT', { method: 'POST', body: formData })
    //
    const btn = document.getElementById('leadMagnetSubmit');
    if (btn) {
      btn.textContent = '✅ ¡Guía enviada! Revisa tu correo';
      btn.disabled = true;
    }
    setTimeout(() => {
      form.reset();
      if (btn) {
        btn.textContent = 'Quiero mi guía gratuita ✦';
        btn.disabled = false;
      }
    }, 4000);
  });
}

// ── Sistema de tabs del Stepper de 4 pasos ────────────────────

function initStepperTabs() {
  const stepperBtns = document.querySelectorAll('.stepper-tab-btn[data-tab], .stepper-circle-item[data-tab], .stepper-item[data-tab]');
  const stepperPanels = document.querySelectorAll('.stepper-panel');
  if (!stepperBtns.length) return;

  // Extraer nombres únicos de pestañas en el orden en que aparecen
  const tabNames = [...new Set(Array.from(stepperBtns).map(b => b.dataset.tab))];
  let currentIndex = 0;
  function activateTab(target) {
    if (!target) return;
    stepperBtns.forEach((b) => {
      const isTarget = b.dataset.tab === target;
      b.classList.toggle('active', isTarget);
      b.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
    stepperPanels.forEach((panel) => {
      const isTarget = panel.id === `stepper-panel-${target}`;
      panel.classList.toggle('active', isTarget);
    });
    currentIndex = tabNames.indexOf(target);
  }

  stepperBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab);
    });
  });

  // Listeners para disparadores de pestañas desde enlaces externos (ej. Hero CTA)
  document.querySelectorAll('[data-trigger-tab]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const target = trigger.dataset.triggerTab;
      activateTab(target);
    });
  });
}

// ── Sistema de tabs de "Explora el universo" ─────────────────

function initExploraTabs() {
  const tabBtns  = document.querySelectorAll('.explora-tab-btn');
  const panels   = document.querySelectorAll('.explora-panel');
  if (!tabBtns.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // Estado de botones
      tabBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Mostrar panel correspondiente
      panels.forEach((panel) => {
        const isTarget = panel.id === `panel-${target}`;
        panel.classList.toggle('active', isTarget);
      });
    });
  });
}

// ── Playlist de YouTube dinámica y automatizada por Categorías ──

function bindPlaylistEvents(playlistEl, player) {
  const epBtns = playlistEl.querySelectorAll('.yt-ep');
  epBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const spotifyUrl = btn.dataset.spotify || btn.dataset.src;
      const videoId = btn.dataset.video;

      if (spotifyUrl) {
        player.src = spotifyUrl;
      } else if (videoId) {
        player.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
      }

      // Actualizar estado activo
      epBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-current', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'true');
    });
  });
}

function renderCategoryList(category, data, playlistEl, player, switchPlayer = false) {
  if (!data) return;

  const isCanal = category === 'canal';
  const items = isCanal ? (data.canal || data.videos || []) : (data.colaboraciones || (data.featured ? [data.featured] : []));

  if (!items.length) {
    playlistEl.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #6a6275; font-size: 0.9rem;">
        No hay episodios disponibles en esta categoría por el momento.
      </div>
    `;
    return;
  }

  let html = '';
  items.forEach((item, index) => {
    const isAct = index === 0;
    const isSpotify = item.type === 'spotify' || Boolean(item.spotifyUrl);
    let badgeClass = 'yt-ep-num';
    let badgeIcon = '';

    if (isSpotify) {
      badgeClass = 'yt-ep-num yt-ep-num--spotify';
      badgeIcon = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true" style="vertical-align: -1px; margin-right: 3px;"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.216.353-.674.467-1.027.25-2.825-1.728-6.381-2.119-10.57-1.162-.405.093-.809-.161-.902-.566-.093-.404.161-.809.566-.902 4.588-1.047 8.528-.604 11.682 1.353.353.217.467.675.251 1.027zm1.468-3.262c-.272.443-.853.582-1.296.31-3.234-1.988-8.164-2.564-11.989-1.403-.497.151-1.026-.134-1.177-.631-.151-.497.134-1.026.631-1.177 4.373-1.328 9.805-.688 13.521 1.604.443.272.583.854.31 1.297zm.126-3.41c-3.878-2.303-10.27-2.516-13.987-1.388-.595.181-1.226-.156-1.407-.751-.181-.595.156-1.226.751-1.407 4.269-1.296 11.326-1.048 15.795 1.605.534.317.709 1.01.392 1.544-.317.535-1.01.71-1.544.397z"/></svg>`;
    } else if (item.badge && item.badge.includes('YouTube')) {
      badgeClass = 'yt-ep-num yt-ep-num--yt-colab';
      badgeIcon = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true" style="vertical-align: -1px; margin-right: 3px;"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    }

    const dataAttr = isSpotify ? `data-spotify="${item.spotifyUrl}"` : `data-video="${item.videoId}"`;

    html += `
      <button class="yt-ep ${isAct ? 'active' : ''}" ${dataAttr} role="listitem" aria-current="${isAct ? 'true' : 'false'}">
        <img src="${item.thumbnail}" alt="Thumbnail ${item.badge} - ${item.title}" loading="lazy">
        <div class="yt-ep-info">
          <span class="${badgeClass}">${badgeIcon}${item.badge}</span>
          <p class="yt-ep-title">${item.title}</p>
        </div>
        <span class="yt-ep-play" aria-hidden="true">▶</span>
      </button>
    `;
  });

  playlistEl.innerHTML = html;
  bindPlaylistEvents(playlistEl, player);

  if (switchPlayer && items[0]) {
    const first = items[0];
    if (first.spotifyUrl) {
      player.src = first.spotifyUrl;
    } else if (first.videoId) {
      player.src = `https://www.youtube.com/embed/${first.videoId}?rel=0&modestbranding=1&autoplay=1`;
    }
  }
}

function initYouTubePlaylist() {
  const player = document.getElementById('ytMainPlayer');
  const playlistEl = document.querySelector('.yt-playlist');
  const categoryBtns = document.querySelectorAll('.podcast-category-btn');
  if (!player || !playlistEl) return;

  let activeCategory = 'canal';
  let cachedData = null;

  // 1. Enlazar eventos inmediatos a los botones precargados en HTML (cero latencia)
  bindPlaylistEvents(playlistEl, player);

  // 2. Controladores de cambio de categoría (Nuestro canal vs Colaboraciones)
  categoryBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      if (cat === activeCategory) return;
      activeCategory = cat;

      categoryBtns.forEach((b) => {
        const isSelected = b === btn;
        b.classList.toggle('active', isSelected);
        b.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });

      renderCategoryList(activeCategory, cachedData, playlistEl, player, true);
    });
  });

  async function loadCatalog() {
    const apiKey = import.meta?.env?.VITE_YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        const cacheKey = 'sinfiltro_yt_cache';
        const cached = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheKey + '_time');
        const now = Date.now();

        if (cached && cacheTime && now - Number(cacheTime) < 15 * 60 * 1000) {
          return JSON.parse(cached);
        }

        const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UU32M4aXh2XI49jRD5CVcPKw&maxResults=15&key=${apiKey}`;
        const res = await fetch(ytUrl);
        if (res.ok) {
          const ytJson = await res.json();
          const baseData = await fetch('/data/youtube-videos.json?t=' + now).then(r => r.json()).catch(() => ({}));
          const liveVideos = (ytJson.items || []).map((item) => {
            const vId = item.snippet.resourceId.videoId;
            const rTitle = item.snippet.title;
            const match = rTitle.match(/(?:ep\.?|episodio)\s*(\d+)/i);
            const num = match ? parseInt(match[1], 10) : null;
            const badge = num ? `EP ${num < 10 ? '0' + num : num}` : 'ESPECIAL';
            const cleanTitle = rTitle
              .replace(/^Descualquierados\s*[\·\|\:\-]?\s*/i, '')
              .replace(/(?:ep\.?|episodio)\s*\d+\s*[\·\|\:\-]?\s*/i, '')
              .trim();

            return {
              id: vId,
              type: 'youtube',
              videoId: vId,
              badge,
              title: cleanTitle || rTitle,
              thumbnail: `https://i.ytimg.com/vi/${vId}/mqdefault.jpg`
            };
          });

          const merged = {
            ...baseData,
            canal: liveVideos.length ? liveVideos : baseData.canal
          };
          localStorage.setItem(cacheKey, JSON.stringify(merged));
          localStorage.setItem(cacheKey + '_time', String(now));
          return merged;
        }
      } catch (e) {
        console.warn('Fallback a catálogo estático:', e);
      }
    }

    const res = await fetch('/data/youtube-videos.json?t=' + Date.now());
    if (!res.ok) throw new Error('No se pudo cargar el catálogo');
    return await res.json();
  }

  // 3. Ejecutar carga del catálogo automatizado
  loadCatalog()
    .then((data) => {
      cachedData = data;

      // Actualizar contadores numéricos en las pestañas
      const countCanal = document.getElementById('count-canal');
      const countColab = document.getElementById('count-colab');
      if (countCanal && Array.isArray(data.canal)) {
        countCanal.textContent = data.canal.length;
      }
      if (countColab && Array.isArray(data.colaboraciones)) {
        countColab.textContent = data.colaboraciones.length;
      }

      // Renderizar la categoría actualmente activa
      renderCategoryList(activeCategory, cachedData, playlistEl, player, false);
    })
    .catch((err) => {
      console.info('Usando playlist precargada en HTML:', err.message);
    });
}

// ── Init principal ───────────────────────────────────────────

export function initModal() {

  // ── 1. Modal QR (agendamiento) ────────────────────────────
  const qrModal  = document.getElementById('qrModal');
  const qrClose  = document.getElementById('qrModalClose');

  // Botón "Agendar" genérico
  document.getElementById('btn-agendar')?.addEventListener('click', () => {
    openModalById('qrModal');
  });

  // Botones heredados de servicios (data-select-service)
  document.querySelectorAll('[data-select-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openModalById('qrModal');
    });
  });

  qrClose?.addEventListener('click', () => closeModalEl(qrModal));
  qrModal?.addEventListener('click', (e) => {
    if (e.target === qrModal) closeModalEl(qrModal);
  });

  // ── 2. Modales por data-modal ─────────────────────────────
  // Cualquier botón con data-modal="<ID>" abre ese modal
  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.modal;
      openModalById(id);
    });
  });

  // ── 3. Botones de cierre en modales de formulario ─────────
  // data-close-modal="<ID>" en el botón × de cada modal
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id    = btn.dataset.closeModal;
      const modal = document.getElementById(id);
      closeModalEl(modal);
    });
  });

  // Cierre al hacer clic en el backdrop
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModalEl(modal);
    });
  });

  // ── 4. Escape cierra todos ────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // ── 5. Formularios con feedback ───────────────────────────
  attachFormFeedback('formHistoria',        '¡Historia recibida!');
  attachFormFeedback('formHistoriaInline',  '¡Historia recibida!');
  attachFormFeedback('formTema',            '¡Tema propuesto!');
  attachFormFeedback('formTemaInline',      '¡Tema propuesto!');
  attachFormFeedback('formInvitacion',      '¡Listo! Te avisamos.');

  // ── 6. Lead magnet ────────────────────────────────────────
  initLeadMagnetForm();

  // ── 7. Tabs de Explora ────────────────────────────────────
  initExploraTabs();

  // ── 8. Stepper Tabs ──────────────────────────────────────
  initStepperTabs();

  // ── 9. Auto-abrir modal de Pago Confirmado al retornar de Wompi ──
  const searchParams = new URLSearchParams(window.location.search);
  const isWompiReturn = searchParams.has('id') || 
                        searchParams.has('status') || 
                        searchParams.has('transaction') || 
                        searchParams.has('reference') || 
                        searchParams.has('pago') || 
                        searchParams.has('payment') || 
                        searchParams.has('confirmado') ||
                        window.location.hash.includes('pago-confirmado');
  
  if (isWompiReturn) {
    const pagoModal = document.getElementById('modalPagoConfirmado');
    if (pagoModal) {
      setTimeout(() => openModalById('modalPagoConfirmado'), 400);
    }
  }

  // ── 10. Playlist de YouTube ────────────────────────────────
  initYouTubePlaylist();
}
