const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicImgsDir = path.join(__dirname, 'public', 'imgs');

const dirs = ['building', 'player', 'groupPhoto'];
const dataJsonPath = path.join(publicImgsDir, 'data.json');
let data = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));

// Target size ratio: keep roughly 1/4 - 1/3 of original file size.
// 修改后的参数：目标 1/3 体积
const TARGET_RATIO = 0.35;   // 目标比例 (Target Ratio) 设为 35%
const MIN_RATIO = 0.32;      // 最低比例 (Min Ratio) 约为 1/3
const MAX_RATIO = 0.40;      // 最高比例 (Max Ratio)
const MIN_QUALITY = 80;      // 提高起始质量 (Min Quality)
const MAX_QUALITY = 100;

async function encodeWebpByTargetRatio(srcPath, originalSize) {
  let low = MIN_QUALITY;
  let high = MAX_QUALITY;
  let best = null;

  // Binary search quality so output size ratio stays near target range.
  for (let i = 0; i < 8 && low <= high; i++) {
    const quality = Math.round((low + high) / 2);
    const buffer = await sharp(srcPath)
      .rotate()
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();

    const ratio = buffer.length / originalSize;
    const score = Math.abs(ratio - TARGET_RATIO);

    if (!best || score < best.score) {
      best = { buffer, quality, ratio, score };
    }

    if (ratio > MAX_RATIO) {
      high = quality - 1;
    } else if (ratio < MIN_RATIO) {
      low = quality + 1;
    } else {
      best = { buffer, quality, ratio, score: 0 };
      break;
    }
  }

  return best;
}

async function processImages() {
  for (const dir of dirs) {
    const srcDirName = dir;
    const destDirName = `${dir}_thumb`;
    const destDirPath = path.join(publicImgsDir, destDirName);

    if (!fs.existsSync(destDirPath)) {
      fs.mkdirSync(destDirPath, { recursive: true });
    }

    const filePaths = data[srcDirName]; // Array of original paths like "/imgs/building/..."
    if (!filePaths) continue;

    const thumbPaths = [];

    for (const fileUrl of filePaths) {
      if (!fileUrl) continue;

      // Extract parts: e.g. "/imgs/building/20260327/01.png"
      // fileUrl relative to public directory:
      const absoluteSrcPath = path.join(__dirname, 'public', fileUrl.replace(/^\//, ''));
      
      // Calculate destUrl and absoluteDestPath
      // e.g. we want to output to /imgs/building_thumb/20260327/01.webp or flatten it? 
      // It's probably better to flatten or mirror. Let's mirror structure using fileUrl.
      // Replace '/imgs/building/' with '/imgs/building_thumb/' and extension with .webp
      const destUrl = fileUrl.replace(`/imgs/${srcDirName}/`, `/imgs/${destDirName}/`).replace(/\.(png|jpe?g)$/i, '.webp');
      const absoluteDestPath = path.join(__dirname, 'public', destUrl.replace(/^\//, ''));

      // Ensure dest dir for this specific file exists (if there are nested like 20260327/)
      const targetDir = path.dirname(absoluteDestPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      console.log(`Converting ${absoluteSrcPath} -> ${absoluteDestPath}`);
      try {
        const originalSize = fs.statSync(absoluteSrcPath).size;
        const encoded = await encodeWebpByTargetRatio(absoluteSrcPath, originalSize);
        fs.writeFileSync(absoluteDestPath, encoded.buffer);
        const ratioPct = (encoded.ratio * 100).toFixed(1);
        console.log(`  -> q=${encoded.quality}, ratio=${ratioPct}%`);
        
        thumbPaths.push(destUrl);
      } catch (err) {
        console.error(`Error processing ${absoluteSrcPath}:`, err);
      }
    }

    data[destDirName] = thumbPaths;
  }

  fs.writeFileSync(dataJsonPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Finished updating data.json');
}

processImages();
