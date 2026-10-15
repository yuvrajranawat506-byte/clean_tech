// generate_icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generateEcoTrackPng(size) {
  const width = size;
  const height = size;

  // Colors:
  // Background: Forest Evergreen #003527 = rgb(0, 53, 39)
  // Accent Mint: #6cf8bb = rgb(108, 248, 187)
  // Inner Accent: #064e3b = rgb(6, 78, 59)
  // White: #ffffff = rgb(255, 255, 255)

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const radius = size * 0.22; // rounded corner radius
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    scanlines[offset++] = 0; // Filter byte: 0 (None)

    for (let x = 0; x < width; x++) {
      // Check rounded rect corner mask
      let insideRounded = true;
      const cornerX = x < radius ? radius - x : (x >= width - radius ? x - (width - radius) : 0);
      const cornerY = y < radius ? radius - y : (y >= height - radius ? y - (height - radius) : 0);
      if (cornerX > 0 && cornerY > 0) {
        if (Math.hypot(cornerX, cornerY) > radius) {
          insideRounded = false;
        }
      }

      if (!insideRounded) {
        // Transparent
        scanlines[offset++] = 0;
        scanlines[offset++] = 0;
        scanlines[offset++] = 0;
        scanlines[offset++] = 0;
        continue;
      }

      // Background color: Deep evergreen gradient from (0, 53, 39) to (6, 78, 59)
      const gradFactor = (x + y) / (width + height);
      let r = Math.round(0 * (1 - gradFactor) + 6 * gradFactor);
      let g = Math.round(53 * (1 - gradFactor) + 78 * gradFactor);
      let b = Math.round(39 * (1 - gradFactor) + 59 * gradFactor);
      let a = 255;

      // Draw stylized EcoTrack recycling symbol (3 folded arrow leaves forming triangle loop)
      const dx = (x - cx) / (width * 0.5);
      const dy = (y - cy) / (height * 0.5);
      const dist = Math.hypot(dx, dy);

      // Outer ring for logo
      if (dist >= 0.42 && dist <= 0.68) {
        const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
        // 3 gaps around the ring at 0, 2pi/3, 4pi/3
        const seg = angle / ((2 * Math.PI) / 3);
        const segFrac = seg - Math.floor(seg);

        if (segFrac > 0.12 && segFrac < 0.94) {
          // Leaf blade gradient from vibrant mint #6cf8bb to clean emerald #006c49
          const mintFactor = segFrac;
          r = Math.round(108 * (1 - mintFactor) + 0 * mintFactor);
          g = Math.round(248 * (1 - mintFactor) + 108 * mintFactor);
          b = Math.round(187 * (1 - mintFactor) + 73 * mintFactor);
        }
      }

      // Inner Eco Leaf in center
      if (dist < 0.28) {
        // Leaf shape: curve
        const leafY = dy + 0.05;
        const leafX = dx;
        if (Math.abs(leafX) < 0.22 * (1 - leafY * leafY)) {
          r = 108;
          g = 248;
          b = 187;
        }
      }

      scanlines[offset++] = r;
      scanlines[offset++] = g;
      scanlines[offset++] = b;
      scanlines[offset++] = a;
    }
  }

  // PNG Header
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.join(__dirname, 'frontend', 'public');

const p192 = generateEcoTrackPng(192);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), p192);
console.log('Created icon-192.png:', p192.length, 'bytes');

const p512 = generateEcoTrackPng(512);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), p512);
console.log('Created icon-512.png:', p512.length, 'bytes');

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), p192);
console.log('Created apple-touch-icon.png');
