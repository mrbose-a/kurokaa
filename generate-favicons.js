const sharp = require('./node_modules/sharp');
const toIco = require('./node_modules/to-ico');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'assets', 'kurokaa-favicon.png');
const OUT = __dirname;

const PNG_SIZES = [
  { name: 'favicon-16x16.png',          size: 16 },
  { name: 'favicon-32x32.png',          size: 32 },
  { name: 'apple-touch-icon.png',        size: 180 },
  { name: 'android-chrome-192x192.png',  size: 192 },
  { name: 'favicon-192x192.png',         size: 192 },
  { name: 'android-chrome-512x512.png',  size: 512 },
  { name: 'favicon-512x512.png',         size: 512 },
  // intermediate sizes for ICO
  { name: '_ico-48.png', size: 48, temp: true },
];

const ICO_SIZES = [16, 32, 48];

async function run() {
  // Generate all PNGs
  for (const entry of PNG_SIZES) {
    const dest = path.join(OUT, entry.name);
    await sharp(SRC)
      .resize(entry.size, entry.size, { kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 9, effort: 10 })
      .toFile(dest);
    console.log(`  wrote ${entry.name} (${entry.size}x${entry.size})`);
  }

  // Build favicon.ico from 16, 32, 48 buffers
  const icoBuffers = await Promise.all(
    ICO_SIZES.map(s => {
      if (s <= 32) {
        return fs.promises.readFile(path.join(OUT, `favicon-${s}x${s}.png`));
      }
      return fs.promises.readFile(path.join(OUT, `_ico-48.png`));
    })
  );
  const ico = await toIco(icoBuffers);
  await fs.promises.writeFile(path.join(OUT, 'favicon.ico'), ico);
  console.log('  wrote favicon.ico (16, 32, 48)');

  // Clean up temp files
  for (const entry of PNG_SIZES.filter(e => e.temp)) {
    await fs.promises.unlink(path.join(OUT, entry.name));
    console.log(`  removed temp ${entry.name}`);
  }

  console.log('\nDone.');
}

run().catch(err => { console.error(err); process.exit(1); });
