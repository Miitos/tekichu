// Petit serveur local, le temps de l'export : reçoit les icônes dessinées par icones.html
// et les écrit dans public/. Lancer, ouvrir http://localhost:5183/icones.html?export=1, arrêter.
import { createServer } from 'node:http';
import { writeFileSync } from 'node:fs';

const ALLOWED = new Set(['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'icon.svg']);
const cors = { 'Access-Control-Allow-Origin': 'http://localhost:5183', 'Access-Control-Allow-Headers': 'content-type' };

createServer((req, res) => {
  if (req.method === 'OPTIONS') return res.writeHead(204, cors).end();
  if (req.method !== 'POST') return res.writeHead(405, cors).end();
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    try {
      const { name, data } = JSON.parse(body);
      if (!ALLOWED.has(name)) throw new Error('nom refusé');
      const bytes = name.endsWith('.svg') ? Buffer.from(data, 'utf8') : Buffer.from(data.split(',')[1], 'base64');
      writeFileSync(new URL(`../public/${name}`, import.meta.url), bytes);
      console.log(name, bytes.length, 'octets');
      res.writeHead(200, cors).end('ok');
    } catch (e) {
      res.writeHead(400, cors).end(String(e));
    }
  });
}).listen(5199, '127.0.0.1', () => console.log('prêt sur 5199'));
