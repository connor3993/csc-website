import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const imgsDir = path.join(root, 'public', 'imgs');
const dataPath = path.join(imgsDir, 'data.json');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const tinyList = [];
for (const srcUrl of data.building) {
  // /imgs/building/20260327/01.webp -> building/20260327/01.webp
  const rel = srcUrl.replace(/^\/imgs\//, '');
  const srcFile = path.join(imgsDir, rel);

  // 生成到 building_tiny，保持目录结构
  const tinyRel = rel.replace(/^building\//, 'building_tiny/');
  const tinyFile = path.join(imgsDir, tinyRel);
  fs.mkdirSync(path.dirname(tinyFile), { recursive: true });

  await sharp(srcFile)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 70, effort: 4 })
    .toFile(tinyFile);

  tinyList.push('/imgs/' + tinyRel.replace(/\\/g, '/'));
}

data.building_tiny = tinyList;
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`generated ${tinyList.length} building_tiny images`);
