# 🌹 Sin Filtro — El universo del amor consciente

> Asesorías y consultorías para parejas: comunicación consciente, relaciones abiertas y no monogamia ética, acompañadas por Vale y JuanPa.

---

## 📋 Tabla de contenidos

1. [Descripción del proyecto](#-descripción-del-proyecto)
2. [Tecnologías](#-tecnologías)
3. [Estructura del proyecto](#-estructura-del-proyecto)
4. [Requisitos previos](#-requisitos-previos)
5. [Instalación](#-instalación)
6. [Comandos disponibles](#-comandos-disponibles)
7. [Desarrollo local](#-desarrollo-local)
8. [Compartir en red local / público](#-compartir-en-red-local--público)
9. [Build de producción](#-build-de-producción)
10. [Deploy en Vercel](#-deploy-en-vercel)
11. [Módulos JavaScript](#-módulos-javascript)
12. [Estilos CSS](#-estilos-css)
13. [Assets y recursos](#-assets-y-recursos)
14. [SEO](#-seo)

---

## 📖 Descripción del proyecto

**Sin Filtro** es un sitio web de landing page para el proyecto de asesorías de pareja de Vale y JuanPa. El sitio ofrece:

- 🎯 Sección **Hero** con canvas animado, citas rotatorias y efecto parallax
- 📋 Sección de **Servicios** con las modalidades de consultoría
- 👫 Sección **Sobre nosotros** con la historia de Vale y JuanPa
- 💬 **Testimonios** de clientes con carrusel automático
- ❓ Sección de **Preguntas frecuentes (FAQ)** con acordeón interactivo
- 📞 **CTA** (llamado a la acción) para agendar consultas
- 📝 **Modal** de contacto/agendamiento integrado

---

## 🛠 Tecnologías

| Tecnología           | Versión | Uso                              |
| -------------------- | ------- | -------------------------------- |
| **HTML5**            | —       | Estructura y semántica           |
| **CSS3 Vanilla**     | —       | Estilos y animaciones            |
| **JavaScript (ESM)** | —       | Interactividad y módulos         |
| **Vite**             | ^8.1.3  | Bundler y servidor de desarrollo |
| **localtunnel**      | ^2.0.2  | Túnel público para compartir     |
| **concurrently**     | ^10.0.3 | Correr múltiples procesos        |
| **Google Fonts**     | —       | Playfair Display + Poppins       |

---

## 📁 Estructura del proyecto

```
SinFiltro/
├── index.html               # Página principal (único punto de entrada)
├── package.json             # Dependencias y scripts npm
├── vite.config.js           # Configuración de Vite
├── .gitignore               # Archivos ignorados por Git
│
├── public/                  # Archivos estáticos (copiados tal cual al build)
│   └── assets/
│       ├── logo/
│       │   ├── logo-white.svg
│       │   └── logo-color.svg
│       └── images/
│           └── couple.png
│
├── scripts/                 # Scripts utilitarios de Node
│   └── share.mjs            # Levanta el túnel público (localtunnel)
│
├── src/
│   ├── styles/              # Estilos CSS
│   │   ├── styles.css       # Punto de entrada CSS (importa todo)
│   │   ├── base.css         # Reset, variables, tipografía global
│   │   └── components/      # Un archivo por sección
│   │       ├── header.css
│   │       ├── hero.css
│   │       ├── services.css
│   │       ├── about.css
│   │       ├── testimonials.css
│   │       ├── faq.css
│   │       ├── cta.css
│   │       ├── modal.css
│   │       ├── footer.css
│   │       └── buttons.css
│   │
│   └── scripts/             # JavaScript
│       ├── main.js          # Orquestador: importa e inicia todos los módulos
│       └── modules/         # Un módulo por funcionalidad
│           ├── canvas.js    # Canvas animado del Hero
│           ├── header.js    # Navbar scroll / menú móvil
│           ├── hero.js      # Parallax + citas rotatorias + reveal
│           ├── testimonials.js # Carrusel de testimonios
│           ├── faq.js       # Acordeón FAQ
│           └── modal.js     # Apertura/cierre del modal
│
└── dist/                    # Build de producción (generado, en .gitignore)
```

---

## ✅ Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** ≥ 18.0.0 → [descargar aquí](https://nodejs.org/)
- **npm** ≥ 9.0.0 (viene incluido con Node.js)
- **Git** (opcional, para clonar el repositorio)

Verifica tus versiones con:

```bash
node --version   # debe mostrar v18.x.x o superior
npm --version    # debe mostrar 9.x.x o superior
```

---

## 📦 Instalación

### 1. Clona el repositorio

```bash
git clone <url-del-repositorio>
cd SinFiltro
```

### 2. Instala las dependencias

```bash
npm install
```

Esto instalará:

- `vite` — servidor de desarrollo y bundler
- `localtunnel` — para generar URLs públicas temporales
- `concurrently` — para correr Vite y el túnel al mismo tiempo

---

## 🚀 Comandos disponibles

| Comando                | Descripción                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| `npm run dev`          | Inicia el servidor de desarrollo en `http://localhost:3000`           |
| `npm run sync:youtube` | Sincroniza automáticamente los últimos videos del canal de YouTube 📺 |
| `npm run build`        | Sincroniza YouTube y genera el build de producción en `/dist`         |
| `npm run preview`      | Previsualiza el build de producción localmente                        |
| `npm run tunnel`       | Solo levanta el túnel público (sin Vite)                              |
| `npm run share`        | Corre Vite + túnel al mismo tiempo ⚡                                 |

---

## 💻 Desarrollo local

### Paso 1 — Iniciar el servidor

```bash
npm run dev
```

El servidor arrancará en:

```
http://localhost:3000
```

> El navegador se abrirá automáticamente gracias a `open: true` en `vite.config.js`.

### Paso 2 — Editar archivos

Vite usa **Hot Module Replacement (HMR)**. Cualquier cambio en los archivos HTML, CSS o JS se refleja en el navegador **instantáneamente** sin necesidad de recargar la página.

- **HTML** → edita `index.html`
- **Estilos** → edita los archivos en `src/styles/components/`
- **Lógica** → edita los módulos en `src/scripts/modules/`

### Paso 3 — Detener el servidor

Presiona `Ctrl + C` en la terminal para detener Vite.

---

## 🌐 Compartir en red local / público

### Opción A — Compartir en la misma red WiFi

Cuando corres `npm run dev`, Vite expone la app en tu IP local:

```
Local:   http://localhost:5173
Network: http://192.168.x.x:5173   ← accesible desde otros dispositivos en tu red
```

Cualquier teléfono o computador en la misma red WiFi puede entrar a esa URL.

---

### Opción B — Compartir con URL pública temporal (localtunnel)

Para compartir con alguien fuera de tu red, usa el script de túnel:

```bash
npm run share
```

Esto correrá **Vite + localtunnel al mismo tiempo**. Verás en la terminal:

```
────────────────────────────────────────────────────
  ✅  ENLACE LISTO PARA COMPARTIR
────────────────────────────────────────────────────

  🌐  URL:  https://xxxxxxxx.loca.lt

  Si aparece pantalla de verificación,
  ingresa esta IP:  123.456.78.90

────────────────────────────────────────────────────
  Presiona Ctrl+C para cerrar el túnel.
────────────────────────────────────────────────────
```

**Comparte la URL** con quien quieras. Funciona desde cualquier lugar del mundo.

> ⚠️ **Nota:** localtunnel puede pedir que el visitante ingrese una IP de "bypass" antes de ver el sitio. Esa IP se muestra en la terminal. Compártela junto con la URL si fuese necesario.

---

### Opción C — Solo el túnel (sin arrancar Vite de nuevo)

Si ya tienes `npm run dev` corriendo en otra terminal:

```bash
npm run tunnel
```

---

## 📦 Build de producción

Cuando el sitio esté listo para publicar, genera el bundle optimizado:

```bash
npm run build
```

Los archivos resultantes estarán en la carpeta `dist/`. Para verificar que el build funciona correctamente antes de subir:

```bash
npm run preview
```

Esto abre un servidor local apuntando a `dist/`, simulando el entorno de producción.

---

## 🚀 Deploy en Vercel

El proyecto ya tiene configuración de Vercel (carpeta `.vercel`).

### Primera vez

1. Instala la CLI de Vercel (si no la tienes):
   ```bash
   npm install -g vercel
   ```
2. Desde la raíz del proyecto:
   ```bash
   vercel
   ```
3. Sigue el asistente: vincula con tu cuenta y el proyecto existente.

### Deploys posteriores

```bash
vercel --prod
```

O simplemente haz **push a la rama principal** en GitHub si tienes la integración continua configurada en Vercel.

---

## 🧩 Módulos JavaScript

Cada funcionalidad vive en su propio módulo dentro de `src/scripts/modules/`:

| Módulo            | Función exportada    | Descripción                                               |
| ----------------- | -------------------- | --------------------------------------------------------- |
| `canvas.js`       | `initHeroCanvas()`   | Dibuja y anima el canvas de partículas del Hero           |
| `header.js`       | `initHeader()`       | Controla el scroll del navbar y el menú hamburguesa móvil |
| `hero.js`         | `initHeroParallax()` | Efecto parallax sobre canvas y copy del Hero              |
| `hero.js`         | `initHeroQuotes()`   | Rotación automática de citas (cada 4.5 s) con altura fija |
| `hero.js`         | `initReveal()`       | Observer que añade la clase `in-view` al hacer scroll     |
| `testimonials.js` | `initTestimonials()` | Carrusel automático de testimonios                        |
| `faq.js`          | `initFaq()`          | Acordeón de preguntas frecuentes                          |
| `modal.js`        | `initModal()`        | Apertura, cierre y trampa de foco del modal               |

Todos los módulos son inicializados desde `src/scripts/main.js`.

---

## 🎨 Estilos CSS

Los estilos siguen una arquitectura **component-based**:

- **`base.css`** — Variables CSS (colores, fuentes, espaciado), reset y utilidades globales.
- **`styles.css`** — Archivo raíz que importa `base.css` y todos los componentes.
- **`components/`** — Un archivo por sección del sitio, manteniendo estilos encapsulados.

### Variables de diseño

El sistema de diseño usa variables CSS. Para ajustar la paleta de colores o tipografía, edita las variables `--color-*` y `--font-*` en `base.css`.

---

## 🖼 Assets y recursos

Los assets estáticos viven en `public/assets/` y Vite los copia directamente al `dist/` sin procesarlos.

```
public/assets/
├── logo/
│   ├── logo-white.svg   # Logo para fondo oscuro (hero)
│   └── logo-color.svg   # Logo para fondo claro (header scrolled)
└── images/
    └── couple.png       # Imagen OG y decorativa
```

> Para agregar nuevas imágenes, colócalas en `public/assets/images/` y referencíalas con rutas absolutas desde la raíz, por ejemplo: `/assets/images/nueva-imagen.jpg`.

---

## 🔍 SEO

El `index.html` incluye configuración SEO completa:

- ✅ `<title>` descriptivo
- ✅ `<meta name="description">`
- ✅ `<meta name="robots" content="index, follow">`
- ✅ `<link rel="canonical">`
- ✅ Open Graph (Facebook, WhatsApp, LinkedIn)
- ✅ Twitter Card
- ✅ `lang="es"` en `<html>`
- ✅ `og:locale` en `es_CO`
- ✅ `fetchpriority="high"` en el logo (LCP)
- ✅ `loading="lazy"` en imágenes no críticas

---

## 📝 Flujo de trabajo recomendado

```
1. npm install          → instalar dependencias (solo la primera vez)
2. npm run dev          → abrir servidor de desarrollo
3. Editar archivos      → los cambios se reflejan en tiempo real
4. npm run share        → si necesitas compartir con alguien externamente
5. npm run build        → generar bundle de producción
6. npm run preview      → verificar build localmente
7. npm run deploy       → sincroniza YouTube, compila y publica en producción (Vercel)
```

---

## 📺 Automatización de videos de YouTube y Colaboraciones

El sitio web cuenta con un sistema de **sincronización y actualización autónoma** de los videos de YouTube del canal [@Sinfiltrovaleyjuanpa](https://www.youtube.com/@Sinfiltrovaleyjuanpa):

### ¿Cómo funciona la sincronización automática?

1. **GitHub Actions (Cron autónomo en la nube)**:
   - Archivo: `.github/workflows/sync-youtube.yml`
   - Se ejecuta en GitHub cada 3 horas (`0 */3 * * *`), por botón manual (`workflow_dispatch`) o por webhook (`repository_dispatch`).
   - Si detecta un video nuevo en el canal de YouTube, actualiza `public/data/youtube-videos.json` y hace commit & push automático al repositorio.

2. **Sincronización en cada despliegue (Build)**:
   - Al ejecutar `npm run build`, se ejecuta automáticamente `scripts/sync-youtube.mjs` antes de compilar con Vite.
   - Cualquier deploy en Vercel, Netlify o Cloudflare Pages siempre compila con los videos más recientes del canal.

3. **Ejecución manual / local**:
   - `npm run sync:youtube`: Extrae los videos del canal en ~1 segundo y actualiza el archivo JSON local.

4. **Cliente Web sin caché obsoleta**:
   - `src/scripts/modules/modal.js` solicita el catálogo con `cache-busting` (`/data/youtube-videos.json?t=timestamp`) para que ningún usuario vea videos antiguos.
   - Permite de manera opcional configurar `VITE_YOUTUBE_API_KEY` en `.env` para consulta directa a la API de YouTube cada 15 minutos.

---

## 🤝 Contribución

1. Crea una rama descriptiva: `git checkout -b feature/nueva-seccion`
2. Haz tus cambios en los archivos correspondientes
3. Verifica que el build no tenga errores: `npm run build`
4. Haz commit con mensaje claro: `git commit -m "feat: agrega sección de precios"`
5. Abre un Pull Request hacia `main`

---
