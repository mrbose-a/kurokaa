import pngToIco from './node_modules/png-to-ico/index.js';
import sharp from './node_modules/sharp/lib/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;

await sharp(path.join(root, 'assets/kurokaa-favicon.png'))
  .resize(48, 48, { kernel: sharp.kernel.lanczos3 })
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, '_ico-48-tmp.png'));

const buf = await pngToIco([
  path.join(root, 'favicon-16x16.png'),
  path.join(root, 'favicon-32x32.png'),
  path.join(root, '_ico-48-tmp.png'),
]);

fs.writeFileSync(path.join(root, 'favicon.ico'), buf);
console.log('favicon.ico written,', buf.length, 'bytes');

const imageCount = buf.readUInt16LE(4);
console.log('Image count:', imageCount);
for (let i = 0; i < imageCount; i++) {
  const off = 6 + i * 16;
  console.log('  image', i, ':', (buf[off] || 256) + 'x' + (buf[off + 1] || 256));
}

fs.unlinkSync(path.join(root, '_ico-48-tmp.png'));
console.log('Done.');
