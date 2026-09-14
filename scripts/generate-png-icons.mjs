import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Table for CRC-32
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const combined = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(combined);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng(width, height, isMaskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw RGBA pixels with scanline filter 0
  const rowBytes = width * 4;
  const rawData = Buffer.alloc((rowBytes + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) / 2;

  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // filter byte: none

    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: Dark cinema aesthetic #0a0c13 to #141724
      const t = (x + y) / (width + height);
      let r = Math.round(10 + t * 15);
      let g = Math.round(12 + t * 15);
      let b = Math.round(19 + t * 25);
      let a = 255;

      // Outer border / shape
      if (!isMaskable) {
        const cornerDist = Math.max(Math.abs(dx), Math.abs(dy));
        if (cornerDist > maxR * 0.96) {
          // rounded corner anti-aliasing
          const cornerR = maxR * 0.25;
          const innerX = Math.max(0, Math.abs(dx) - (maxR - cornerR));
          const innerY = Math.max(0, Math.abs(dy) - (maxR - cornerR));
          if (Math.hypot(innerX, innerY) > cornerR) {
            a = 0;
          }
        }
      }

      if (a > 0) {
        // Glowing purple center
        const glowDist = dist / (maxR * 0.8);
        if (glowDist < 1) {
          const glow = Math.pow(1 - glowDist, 1.8);
          r = Math.min(255, Math.round(r + 139 * glow * 0.7));
          g = Math.min(255, Math.round(g + 92 * glow * 0.6));
          b = Math.min(255, Math.round(b + 246 * glow * 0.8));
        }

        // Camera / Clapper icon in center
        const scale = width / 512;
        const iconW = 180 * scale;
        const iconH = 120 * scale;

        // Inside clapperboard box
        if (Math.abs(dx) < iconW / 2 && Math.abs(dy - 10 * scale) < iconH / 2) {
          r = 25;
          g = 29;
          b = 43;

          // Play triangle in center
          const triSize = 24 * scale;
          const triX = dx - 2 * scale;
          const triY = dy - 10 * scale;
          if (triX >= -triSize * 0.5 && triX <= triSize * 0.8 &&
              Math.abs(triY) <= (triSize * 0.8 - triX * 0.6)) {
            // Neon cyan to purple
            r = 255;
            g = 255;
            b = 255;
          }
        }

        // Top clapper stripe bar
        if (Math.abs(dx) < iconW / 2 && dy >= -iconH / 2 - 25 * scale && dy <= -iconH / 2 + 5 * scale) {
          const stripe = Math.floor((dx + dy) / (18 * scale)) % 2 === 0;
          if (stripe) {
            r = 236;
            g = 72;
            b = 153; // Magenta
          } else {
            r = 139;
            g = 92;
            b = 246; // Purple
          }
        }
      }

      rawData[pos++] = r;
      rawData[pos++] = g;
      rawData[pos++] = b;
      rawData[pos++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. 192x192 PNG
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192, false));
console.log('Created pwa-192x192.png');

// 2. 512x512 PNG
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512, false));
console.log('Created pwa-512x512.png');

// 3. 512x512 Maskable PNG
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
console.log('Created pwa-maskable-512x512.png');

// 4. Apple Touch Icon 180x180 PNG
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180, false));
console.log('Created apple-touch-icon.png');
