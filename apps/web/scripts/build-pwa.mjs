import { createHash } from "node:crypto";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { deflateSync } from "node:zlib";

const dist = new URL("../dist/", import.meta.url);
const brand = JSON.parse(
  await readFile(new URL("../src/brand.json", import.meta.url), "utf8"),
);

// Dependency-free PNGs from the same simple geometric mark as public/icon.svg.
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}
function icon(size) {
  const pixels = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = Math.abs(((x + 0.5) * 512) / size - 256);
      const dy = Math.abs(((y + 0.5) * 512) / size - 256);
      const star = Math.max(dx, dy) + Math.min(dx, dy) * (114 / 42) <= 156;
      const dot =
        Math.hypot(
          ((x + 0.5) * 512) / size - 368,
          ((y + 0.5) * 512) / size - 144,
        ) <= 20;
      const color = star
        ? [237, 242, 255]
        : dot
          ? [164, 234, 210]
          : [51, 79, 197];
      pixels.set(color, y * (size * 3 + 1) + 1 + x * 3);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(pixels)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
for (const size of [192, 512])
  await writeFile(new URL(`icon-${size}.png`, dist), icon(size));
await writeFile(
  new URL("manifest.webmanifest", dist),
  JSON.stringify(
    {
      id: "/",
      name: brand.name,
      short_name: brand.name,
      description: "코드를 읽고 추적하며 스스로 리뷰하는 무료 학습",
      lang: "ko",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#f7f9fd",
      theme_color: "#334fc5",
      icons: [192, 512].map((size) => ({
        src: `/icon-${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "any maskable",
      })),
    },
    null,
    2,
  ),
);

const files = (await readdir(dist, { recursive: true }))
  .filter(
    (name) =>
      /\.(html|js|css|svg|png|webmanifest)$/.test(name) && name !== "sw.js",
  )
  .sort();
const digest = createHash("sha256");
for (const name of files) {
  digest.update(name);
  digest.update(await readFile(new URL(name, dist)));
}
const cacheName = `lumet-static-${digest.digest("hex").slice(0, 16)}`;
await writeFile(
  new URL("sw.js", dist),
  `// Generated from this build's asset contents; no runtime/user data is cached.
const CACHE = ${JSON.stringify(cacheName)};
const ASSETS = ${JSON.stringify(files.map((name) => `/${name}`))};
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  // Wait for old clients to close; never replace an active learning session.
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('lumet-static-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // The shell and fixtures are a single atomic version, including while offline.
  if (event.request.mode === 'navigate' && url.pathname === '/') {
    event.respondWith(caches.open(CACHE).then((cache) => cache.match('/index.html')).then((cached) => cached || fetch(event.request)));
  } else if (!url.search && ASSETS.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then((cache) => cache.match(url.pathname)).then((cached) => cached || fetch(event.request)));
  }
});
`,
);
console.log(`PWA: ${files.length} static assets, cache ${cacheName}`);
