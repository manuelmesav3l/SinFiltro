/**
 * hero-smoke.js — Humo animado con WebGL para cuando el video no puede reproducirse solo
 *
 * iOS (Modo de bajo consumo) y otros móviles bloquean el autoplay de <video>, pero no el WebGL.
 * Este módulo toma la imagen still del hero y la deforma con ruido fluido que sube, así el humo
 * se mueve sin depender de ningún gesto del usuario. Si WebGL no está disponible devuelve null
 * y el hero conserva el movimiento CSS de respaldo.
 */

const VERTEX = `
attribute vec2 a;
varying vec2 v;
void main() {
  v = a * 0.5 + 0.5;
  gl_Position = vec4(a, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
varying vec2 v;
uniform sampler2D tex;
uniform float t;
uniform vec2 res;
uniform float imgAspect;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}

void main() {
  float T = t * 1.4;
  float ca = res.x / res.y;

  // Equivale a object-fit: cover + object-position: right bottom del <img> original
  vec2 visible = ca > imgAspect ? vec2(1.0, imgAspect / ca) : vec2(ca / imgAspect, 1.0);

  // El patrón de ruido sube con el tiempo: el humo "sale" hacia arriba
  vec2 p = vec2(v.x * ca, v.y) * 1.6 - vec2(0.0, T * 0.05);
  vec2 q = vec2(fbm(p + vec2(0.0, T * 0.03)), fbm(p + vec2(5.2, 1.3) - vec2(T * 0.02, 0.0)));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + 0.12 * T),
                fbm(p + 3.0 * q + vec2(8.3, 2.8) + 0.10 * T));

  vec2 vv = clamp(v + (r - 0.5) * 0.05, 0.0, 1.0);
  vec2 uv = vec2((1.0 - visible.x) + vv.x * visible.x, vv.y * visible.y);

  vec3 color = texture2D(tex, uv).rgb * (0.94 + 0.12 * r.x);
  gl_FragColor = vec4(color, 1.0);
}`;

// Presupuesto de píxeles: el humo es suave, no hace falta resolución nativa y así se cuida la batería.
const MAX_RENDER_PIXELS = 700000;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

/**
 * @param {HTMLElement} container  .hero-bg (el canvas se inserta aquí, sobre la imagen still)
 * @param {string} imageUrl        URL de la imagen still (debe enviar CORS para usarla como textura)
 * @returns {Promise<{stop: () => void} | null>}
 */
export function startSmoke(container, imageUrl) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onerror = () => resolve(null);
    image.onload = () => resolve(createSmoke(container, image));
    image.src = imageUrl;
  });
}

function createSmoke(container, image) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-bg__smoke';
  canvas.setAttribute('aria-hidden', 'true');

  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // Un triángulo que cubre toda la pantalla
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const uTime = gl.getUniformLocation(program, 't');
  const uRes = gl.getUniformLocation(program, 'res');
  gl.uniform1i(gl.getUniformLocation(program, 'tex'), 0);
  gl.uniform1f(gl.getUniformLocation(program, 'imgAspect'), image.naturalWidth / image.naturalHeight);

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = container.clientWidth || 1;
    const cssH = container.clientHeight || 1;
    const k = Math.min(dpr, Math.sqrt(MAX_RENDER_PIXELS / (cssW * cssH)));
    canvas.width = Math.max(1, Math.round(cssW * k));
    canvas.height = Math.max(1, Math.round(cssH * k));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let rafId = 0;
  let running = true;
  const start = performance.now();

  function frame(now) {
    if (!running) return;
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    canvas.classList.remove('is-active');
    // Se retira después del fundido para no dejar un salto visual
    setTimeout(() => canvas.remove(), 900);
  }

  // Si el sistema reclama el contexto GPU, se cae al movimiento CSS de respaldo
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    stop();
    container.classList.add('is-still');
  });

  // El canvas va justo después de la imagen still, debajo del video
  const plate = container.querySelector('.hero-bg__plate');
  if (plate) plate.after(canvas);
  else container.prepend(canvas);

  rafId = requestAnimationFrame((now) => {
    frame(now);
    canvas.classList.add('is-active');
  });

  return { stop };
}
