/**
 * src/assets/imgs 首页/页面背景图优化：
 * png/jpg -> webp（限宽 1920，q80），已有 webp 重压一遍
 * 原文件移动到备份目录
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const projRoot = path.join(__dirname, '..');
const assetsImgs = path.join(projRoot, 'src', 'assets', 'imgs');
const backupDir = path.join(projRoot, '..', 'csc-originals-backup', 'assets-imgs');

const MAX_W = 1920;
const Q = 80;
const fmt = (b) => (b / 1048576).toFixed(2) + ' MB';

async function main() {
  const files = fs.readdirSync(assetsImgs).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  let before = 0;
  let after = 0;

  fs.mkdirSync(backupDir, { recursive: true });

  for (const f of files) {
    const src = path.join(assetsImgs, f);
    const size = fs.statSync(src).size;
    before += size;
    const webpName = f.replace(/\.(png|jpe?g|webp)$/i, '.webp');
    const dest = path.join(assetsImgs, webpName);

    const buf = await sharp(fs.readFileSync(src))
      .rotate()
      .resize({ width: MAX_W, withoutEnlargement: true })
      .webp({ quality: Q, effort: 5 })
      .toBuffer();

    if (/\.webp$/i.test(f) && f === webpName) {
      // 原样重压（覆盖自身）
      fs.writeFileSync(dest, buf);
    } else {
      fs.writeFileSync(dest, buf);
      fs.renameSync(src, path.join(backupDir, f));
    }
    after += buf.length;
    console.log(`${f}  ${fmt(size)} -> ${fmt(buf.length)}`);
  }

  console.log(`\n合计: ${fmt(before)} -> ${fmt(after)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
