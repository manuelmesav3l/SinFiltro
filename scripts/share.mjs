/**
 * share.mjs — Levanta el túnel público y muestra la URL lista para compartir.
 * Uso: npm run share
 */

import localtunnel from 'localtunnel';
import { execSync }  from 'child_process';

// Obtiene la IP pública para el bypass de localtunnel
let publicIp = '';
try {
  publicIp = execSync('curl -s https://ipv4.icanhazip.com', { timeout: 5000 })
    .toString()
    .trim();
} catch {
  publicIp = '(no disponible)';
}

const PORT = 4173;

console.log('\n🚀  Creando túnel público...\n');

const tunnel = await localtunnel({ port: PORT });

const divider = '─'.repeat(52);

console.log(`\n${divider}`);
console.log('  ✅  ENLACE LISTO PARA COMPARTIR');
console.log(divider);
console.log(`\n  🌐  URL:  ${tunnel.url}\n`);
console.log(`  Si aparece pantalla de verificación,`);
console.log(`  ingresa esta IP:  ${publicIp}`);
console.log(`\n${divider}`);
console.log('  Presiona Ctrl+C para cerrar el túnel.');
console.log(`${divider}\n`);

tunnel.on('close', () => {
  console.log('\n🔴  Túnel cerrado.\n');
  process.exit(0);
});

process.on('SIGINT', () => tunnel.close());
process.on('SIGTERM', () => tunnel.close());
