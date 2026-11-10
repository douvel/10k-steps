#!/usr/bin/env node
// Generate dedicated 1200×630 og:images for all site pages.
// Uses only pngjs (already in node_modules, no extra deps).
// Run: node scripts/site/gen_og_images.js
'use strict';

const { PNG } = require('../../node_modules/pngjs');
const fs = require('fs');
const path = require('path');

const W = 1200, H = 630;
const BG   = [0x0b, 0x0b, 0x0f];
const OG   = [0xff, 0x5e, 0x2e]; // brand orange #ff5e2e
const FOOT = [0x11, 0x0a, 0x06]; // dark orange tint for footer area

// ---- primitives ----------------------------------------------------------

function canvas(w, h, [r, g, b]) {
  const png = new PNG({ width: w, height: h, filterType: -1 });
  const len = w * h * 4;
  for (let i = 0; i < len; i += 4) {
    png.data[i] = r; png.data[i + 1] = g;
    png.data[i + 2] = b; png.data[i + 3] = 255;
  }
  return png;
}

function fillRect(png, x0, y0, rw, rh, [r, g, b]) {
  for (let y = y0; y < y0 + rh; y++) {
    if (y < 0 || y >= png.height) continue;
    for (let x = x0; x < x0 + rw; x++) {
      if (x < 0 || x >= png.width) continue;
      const i = (png.width * y + x) << 2;
      png.data[i] = r; png.data[i + 1] = g;
      png.data[i + 2] = b; png.data[i + 3] = 255;
    }
  }
}

function fillCircle(png, cx, cy, radius, [r, g, b], alpha = 255) {
  const r2 = radius * radius;
  for (let y = cy - radius; y <= cy + radius; y++) {
    if (y < 0 || y >= png.height) continue;
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (x < 0 || x >= png.width) continue;
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) {
        const i = (png.width * y + x) << 2;
        const a = alpha / 255;
        png.data[i]     = Math.round(r * a + png.data[i]     * (1 - a));
        png.data[i + 1] = Math.round(g * a + png.data[i + 1] * (1 - a));
        png.data[i + 2] = Math.round(b * a + png.data[i + 2] * (1 - a));
        png.data[i + 3] = 255;
      }
    }
  }
}

// Nearest-neighbor scale
function scalePng(src, nw, nh) {
  const dst = new PNG({ width: nw, height: nh });
  const { width: sw, height: sh } = src;
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      const sx = Math.floor(x * sw / nw);
      const sy = Math.floor(y * sh / nh);
      const si = (sw * sy + sx) << 2;
      const di = (nw * y + x) << 2;
      dst.data[di] = src.data[si]; dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2]; dst.data[di + 3] = src.data[si + 3];
    }
  }
  return dst;
}

// Alpha-composite src over dst at offset (ox, oy)
function composite(dst, src, ox, oy) {
  for (let y = 0; y < src.height; y++) {
    const dy = oy + y;
    if (dy < 0 || dy >= dst.height) continue;
    for (let x = 0; x < src.width; x++) {
      const dx = ox + x;
      if (dx < 0 || dx >= dst.width) continue;
      const si = (src.width * y + x) << 2;
      const di = (dst.width * dy + dx) << 2;
      const a = src.data[si + 3] / 255;
      if (a === 0) continue;
      dst.data[di]     = Math.round(src.data[si]     * a + dst.data[di]     * (1 - a));
      dst.data[di + 1] = Math.round(src.data[si + 1] * a + dst.data[di + 1] * (1 - a));
      dst.data[di + 2] = Math.round(src.data[si + 2] * a + dst.data[di + 2] * (1 - a));
      dst.data[di + 3] = 255;
    }
  }
}

// Draw an orange dot-grid pattern in a rectangular region
function dotGrid(png, x0, y0, rw, rh, cols, rows, dotR) {
  const colStep = rw / cols;
  const rowStep = rh / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = Math.round(x0 + colStep * c + colStep / 2);
      const cy = Math.round(y0 + rowStep * r + rowStep / 2);
      fillCircle(png, cx, cy, dotR, OG, 60);
    }
  }
}

// ---- page configs --------------------------------------------------------

const CONFIGS = [
  // key, logo size, logo x, logo y ('center' = auto), dot grid variant
  { key: 'fr-home',     logoSize: 250, variant: 'home'  },
  { key: 'en-home',     logoSize: 250, variant: 'home'  },
  { key: 'fr-distance', logoSize: 200, variant: 'guide' },
  { key: 'en-distance', logoSize: 200, variant: 'guide' },
  { key: 'fr-steps',    logoSize: 200, variant: 'guide' },
  { key: 'en-steps',    logoSize: 200, variant: 'guide' },
  { key: 'fr-pace',     logoSize: 200, variant: 'guide' },
  { key: 'en-pace',     logoSize: 200, variant: 'guide' },
  { key: 'fr-compare',  logoSize: 200, variant: 'guide' },
  { key: 'en-compare',  logoSize: 200, variant: 'guide' },
  { key: 'fr-privacy',  logoSize: 160, variant: 'legal' },
  { key: 'en-privacy',  logoSize: 160, variant: 'legal' },
  { key: 'default',     logoSize: 200, variant: 'home'  },
];

// ---- main ----------------------------------------------------------------

const SITE     = path.join(__dirname, '..', '..', 'site');
const LOGO_SRC = path.join(SITE, 'img', 'logo-512.png');
const OUT_DIR  = path.join(SITE, 'img', 'og');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const logoFull = PNG.sync.read(fs.readFileSync(LOGO_SRC));

for (const { key, logoSize, variant } of CONFIGS) {
  const img = canvas(W, H, BG);

  if (variant === 'home') {
    // Orange left bar
    fillRect(img, 0, 0, 10, H, OG);
    // Subtle orange glow circle behind logo
    fillCircle(img, 600, 290, 180, OG, 20);
    // Logo centered (accounting for footer strip)
    const logo = scalePng(logoFull, logoSize, logoSize);
    composite(img, logo, (W - logoSize) >> 1, Math.floor((H - 80 - logoSize) / 2));
    // Footer strip
    fillRect(img, 0, H - 80, W, 1, [0x2a, 0x14, 0x0a]);
    fillRect(img, 0, H - 79, W, 79, FOOT);
    fillRect(img, 10, H - 80, W - 10, 2, OG);

  } else if (variant === 'guide') {
    // Orange left bar
    fillRect(img, 0, 0, 10, H, OG);
    // Dot grid on the right half
    dotGrid(img, 620, 60, 540, 450, 7, 5, 6);
    // Logo left-of-center
    const logo = scalePng(logoFull, logoSize, logoSize);
    const logoX = 150;
    composite(img, logo, logoX, (H - logoSize) >> 1);
    // Orange vertical accent at the border between logo and dots
    fillRect(img, 600, 60, 2, H - 120, OG);
    // Footer
    fillRect(img, 0, H - 70, W, 1, [0x2a, 0x14, 0x0a]);
    fillRect(img, 0, H - 69, W, 69, FOOT);
    fillRect(img, 10, H - 70, W - 10, 2, OG);

  } else {
    // legal: minimal centered design
    fillRect(img, 0, 0, 10, H, OG);
    const logo = scalePng(logoFull, logoSize, logoSize);
    composite(img, logo, (W - logoSize) >> 1, (H - logoSize) >> 1);
    // Top + bottom orange lines
    fillRect(img, 10, 0, W - 10, 3, OG);
    fillRect(img, 10, H - 3, W - 10, 3, OG);
  }

  const outPath = path.join(OUT_DIR, `${key}.png`);
  fs.writeFileSync(outPath, PNG.sync.write(img));
  console.log(`✓ ${key}.png`);
}

console.log(`\nAll og:images written to ${OUT_DIR}`);
