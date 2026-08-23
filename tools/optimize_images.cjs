/**
 * 图片优化脚本（一次性跑）：
 * 1. 原图 -> webp，限宽 1920，q80（替换 public/imgs/<dir>/ 下的 png/jpg/jpeg）
 * 2. 缩略图重生成 -> webp，限宽 800，q75（public/imgs/<dir>_thumb/）
 * 3. 更新 public/imgs/data.json 的引用路径
 * 4. 原 PNG/JPG 移动到项目外备份目录（不删除）
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const projRoot = path.join(__dirname, '..');
const publicImgs = path.join(projRoot, 'public', 'imgs');
const backupRoot = path.join(projRoot, '..', 'csc-originals-backup', 'imgs');
const dataJsonPath = path.join(publicImgs, 'data.json');

const dirs = ['building', 'player', 'groupPhoto'];
const FULL_MAX_W = 1920;
const FULL_Q = 80;
const THUMB_MAX_W = 800;
const THUMB_Q = 75;

const fmt = (bytes) => (bytes / 1048576).toFixed(2) + ' MB';

async function convert(srcAbs, destAbs, maxWidth, quality) {
  await fs.promises.mkdir(path.dirname(destAbs), { recursive: true });
  const buf = await sharp(srcAbs)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer();
  await fs.promises.writeFile(destAbs, buf);
  return buf.length;
}

function moveToBackup(srcAbs) {
  const rel = path.relative(publicImgs, srcAbs);
  const dest = path.join(backupRoot, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(srcAbs, dest);
}

async function main() {
  const data = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));
  let totalOrig = 0;
  let totalNew = 0;
  let totalThumb = 0;

  for (const dir of dirs) {
    const list = data[dir];
    if (!Array.isArray(list)) continue;

    const newFull = [];
    const newThumb = [];

    for (const url of list) {
      if (!url) continue;
      const srcAbs = path.join(projRoot, 'public', url.replace(/^\//, ''));
      if (!fs.existsSync(srcAbs)) {
        console.warn(`[跳过] 文件不存在: ${url}`);
        newFull.push(url);
        newThumb.push(url);
        continue;
      }

      const isWebp = /\.webp$/i.test(srcAbs);
      const fullUrl = url.replace(/\.(png|jpe?g)$/i, '.webp');
      const fullAbs = isWebp ? srcAbs : path.join(projRoot, 'public', fullUrl.replace(/^\//, ''));
      const thumbUrl = url
        .replace(`/imgs/${dir}/`, `/imgs/${dir}_thumb/`)
        .replace(/\.(png|jpe?g)$/i, '.webp');
      const thumbAbs = path.join(projRoot, 'public', thumbUrl.replace(/^\//, ''));

      const origSize = fs.statSync(srcAbs).size;
      totalOrig += origSize;

      try {
        if (!isWebp) {
          const fullSize = await convert(srcAbs, fullAbs, FULL_MAX_W, FULL_Q);
          totalNew += fullSize;
          moveToBackup(srcAbs);
          console.log(`[原图] ${url}  ${fmt(origSize)} -> ${fmt(fullSize)}`);
        } else {
          totalNew += origSize;
        }
        const thumbSize = await convert(fullAbs, thumbAbs, THUMB_MAX_W, THUMB_Q);
        totalThumb += thumbSize;
      } catch (err) {
        console.error(`[失败] ${url}:`, err.message);
      }

      newFull.push(fullUrl);
      newThumb.push(thumbUrl);
    }

    data[dir] = newFull;
    data[`${dir}_thumb`] = newThumb;
  }

  fs.writeFileSync(dataJsonPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('\n===== 汇总 =====');
  console.log(`原图原始体积: ${fmt(totalOrig)}`);
  console.log(`原图压缩后:   ${fmt(totalNew)}`);
  console.log(`缩略图总体积: ${fmt(totalThumb)}`);
  console.log(`备份目录:     ${backupRoot}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
