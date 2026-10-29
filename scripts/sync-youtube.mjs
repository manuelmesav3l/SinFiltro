import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CHANNEL_HANDLE = '@Sinfiltrovaleyjuanpa';
const CHANNEL_URL = `https://www.youtube.com/${CHANNEL_HANDLE}/videos`;
const OUTPUT_FILE = resolve(__dirname, '../public/data/youtube-videos.json');
const REQUEST_TIMEOUT_MS = 15000;
const OPTIONAL = process.argv.includes('--optional');

// Catálogo de colaboraciones destacadas (Spotify, YouTube y otros)
const COLABORACIONES_CATALOG = [
  {
    id: 'spotify-vsesenta-39',
    type: 'spotify',
    platform: 'spotify',
    badge: 'Spotify · Video Podcast',
    title: '#39 Juanpa & Vale Sin Filtro | Vsesenta Podcast',
    spotifyUrl: 'https://open.spotify.com/embed/episode/6Z7wWNtdLUNHtDScr5Fn9a/video?utm_source=generator&theme=0&si=38bfc682f0044763',
    thumbnail: 'https://image-cdn-fa.spotifycdn.com/image/ab6772ab00001692140b9b4bf540a14a3ca5955a'
  },
  {
    id: 'yt-serez-W8V8WKKRnx0',
    type: 'youtube',
    platform: 'youtube',
    videoId: 'W8V8WKKRnx0',
    badge: 'Serez · YouTube',
    title: 'Confesiones de una pareja abierta | Serez by Manuela Escobar',
    youtubeUrl: 'https://www.youtube.com/watch?v=W8V8WKKRnx0',
    thumbnail: 'https://i.ytimg.com/vi/W8V8WKKRnx0/mqdefault.jpg'
  },
  {
    id: 'yt-segun-quien-7iFrdJKJSNw',
    type: 'youtube',
    platform: 'youtube',
    videoId: '7iFrdJKJSNw',
    badge: 'Según Quién · YouTube',
    title: 'Relaciones abiertas: no más mentiras, ¿funcionan de verdad?',
    youtubeUrl: 'https://www.youtube.com/watch?v=7iFrdJKJSNw',
    thumbnail: 'https://i.ytimg.com/vi/7iFrdJKJSNw/mqdefault.jpg'
  },
  {
    id: 'spotify-primera-vez-poliamor',
    type: 'spotify',
    platform: 'spotify',
    badge: 'Spotify · Podcast',
    title: '07 La primera vez en poliamor | Con Valeria Acosta Isaza',
    spotifyUrl: 'https://open.spotify.com/embed/episode/4TDQcADRdGRzRagUvTtK1B/video?utm_source=generator&theme=0',
    thumbnail: 'https://i.scdn.co/image/ab67656300005f1f9e67c19942732f8202799bf0'
  },
  {
    id: 'yt-incorrecto-G0Lu4CppjNg',
    type: 'youtube',
    platform: 'youtube',
    videoId: 'G0Lu4CppjNg',
    badge: 'Incorrecto Podcast · YouTube',
    title: 'VALE Y JUANPA: SIN FILTRO | Incorrecto Podcast Ep. 29',
    youtubeUrl: 'https://www.youtube.com/watch?v=G0Lu4CppjNg',
    thumbnail: 'https://i.ytimg.com/vi/G0Lu4CppjNg/mqdefault.jpg'
  }
];

function parseEpisodeInfo(rawTitle) {
  // Ejemplos:
  // "Descualquierados · Ep. 9 | Storytime AEFEST México" -> badge: "EP 09", title: "Storytime AEFEST México"
  // "Descualquierados Episodio 8: Primera Fiesta Sin Filtro" -> badge: "EP 08", title: "Primera Fiesta Sin Filtro"
  // "Descualquierados | Episodio 7: Story Times de Fiestas Eróticas" -> badge: "EP 07", title: "Story Times de Fiestas Eróticas"
  // "Confesiones de una pareja abierta" -> badge: "ESPECIAL", title: "Confesiones de una pareja abierta"
  
  const epMatch = rawTitle.match(/(?:ep\.?|episodio)\s*(\d+)/i);
  let badge = 'ESPECIAL';
  let title = rawTitle;

  if (epMatch) {
    const num = parseInt(epMatch[1], 10);
    badge = `EP ${num < 10 ? '0' + num : num}`;
    
    // Limpiar prefijo como "Descualquierados · Ep. 9 | " o "Descualquierados | Episodio 7: "
    title = rawTitle
      .replace(/^Descualquierados\s*[\·\|\:\-]?\s*/i, '')
      .replace(/(?:ep\.?|episodio)\s*\d+\s*[\·\|\:\-]?\s*/i, '')
      .trim();
  }

  // Si el título quedó vacío o muy corto, volver al rawTitle
  if (!title || title.length < 3) {
    title = rawTitle;
  }

  // Quitar puntos finales sobrantes
  title = title.replace(/\.+$/, '').trim();

  return { badge, title };
}

export async function fetchYouTubeVideos() {
  console.log(`📡 Consultando últimos videos de ${CHANNEL_HANDLE}...`);
  
  const response = await fetch(CHANNEL_URL, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    }
  });

  if (!response.ok) {
    throw new Error(`Error HTTP al consultar YouTube: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);

  if (!match) {
    throw new Error('No se pudo encontrar ytInitialData en el contenido de YouTube');
  }

  const json = JSON.parse(match[1]);
  const tabs = json.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
  
  // Buscar la pestaña que contiene los videos
  let contents = [];
  for (const tab of tabs) {
    const grid = tab.tabRenderer?.content?.richGridRenderer?.contents;
    if (Array.isArray(grid) && grid.length > 0) {
      contents = grid;
      break;
    }
  }

  const videos = [];
  const seenIds = new Set();

  for (const item of contents) {
    const model = item.richItemRenderer?.content?.lockupViewModel;
    if (!model || !model.contentId) continue;

    const videoId = model.contentId;
    if (seenIds.has(videoId)) continue;
    seenIds.add(videoId);

    const rawTitle = model.metadata?.lockupMetadataViewModel?.title?.content || '';
    const { badge, title } = parseEpisodeInfo(rawTitle);

    videos.push({
      id: videoId,
      type: 'youtube',
      videoId,
      badge,
      title,
      rawTitle,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`
    });
  }

  // Si YouTube cambia su HTML o devuelve una página de consentimiento no hay videos que leer:
  // fallar aquí evita sobrescribir el catálogo bueno con uno vacío.
  if (videos.length === 0) {
    throw new Error('YouTube no devolvió videos del canal; se conserva el catálogo existente');
  }

  console.log(`✅ ${videos.length} videos extraídos correctamente.`);

  const payload = {
    channel: CHANNEL_HANDLE,
    channelUrl: `https://www.youtube.com/${CHANNEL_HANDLE}`,
    lastUpdated: new Date().toISOString(),
    canal: videos,
    colaboraciones: COLABORACIONES_CATALOG,
    featured: COLABORACIONES_CATALOG[0],
    videos
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`💾 Catálogo guardado en: ${OUTPUT_FILE}`);
  return payload;
}

// Ejecución directa por CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchYouTubeVideos()
    .then((res) => {
      console.log(`✨ Sincronización exitosa. Total episodios disponibles: ${res.videos.length + 1}`);
      process.exit(0);
    })
    .catch((err) => {
      // Con --optional (usado por `npm run build`) un fallo de YouTube no debe tumbar el deploy:
      // se publica con el catálogo ya commiteado. Sin la bandera (GitHub Actions) falla visible.
      if (OPTIONAL && existsSync(OUTPUT_FILE)) {
        console.warn('⚠️ No se pudo sincronizar con YouTube; se usa el catálogo existente:', err.message);
        process.exit(0);
      }
      console.error('❌ Error durante la sincronización:', err);
      process.exit(1);
    });
}
