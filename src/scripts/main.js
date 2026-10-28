/**
 * main.js — Orquestador principal de Sin Filtro
 *
 * Importa e inicializa cada módulo de forma independiente.
 * Cada módulo es responsable de su propio comportamiento.
 */

import { initHeroCanvas }   from './modules/canvas.js';
import { initHeader }       from './modules/header.js';
import { initHeroBackground, initHeroParallax, initHeroQuotes, initReveal } from './modules/hero.js';
import { initTunnel }       from './modules/tunnel.js';
import { initTestimonials } from './modules/testimonials.js';
import { initFaq }          from './modules/faq.js';
import { initEncuentros }   from './modules/encuentros.js';
import { initModal }        from './modules/modal.js';
import { initUX }           from './modules/ux.js';
import { initSpotifyPlayer } from './modules/spotify-player.js';

// ── Año actual en el footer ───────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Inicializar módulos ───────────────────────────────────
initHeroBackground();
initHeroCanvas();
initTunnel();
initHeader();
initHeroParallax();
initHeroQuotes();
initReveal();
initTestimonials();
initFaq();
initEncuentros();
initModal();
initUX();
initSpotifyPlayer();

