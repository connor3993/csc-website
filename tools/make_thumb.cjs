const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 压缩参数保持不变
const TARGET_RATIO = 0.35; 
const MIN_RATIO = 0.32;
const MAX_RATIO = 0.40;
const MIN_QUALITY = 72;
const MAX_QUALITY = 100;

async function encodeWebpByTargetRatio(srcPath, originalSize) {
  let low = MIN_QUALITY;
  let high = MAX_QUALITY;
  let best = null;

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

async function run() {
  // 获取所有命令行传入的文件名 
  const fileNames = process.argv.slice(2);

  if (fileNames.length === 0) {
    console.error('Usage (用法): node make_thumb.cjs <file1> <file2> ...');
    process.exit(1);
  }

  console.log(`--- Total files to process (共需处理): ${fileNames.length} ---`);

  // 遍历处理每一个文件 
  for (const fileName of fileNames) {
    const srcPath = path.resolve(process.cwd(), fileName);
    
    if (!fs.existsSync(srcPath)) {
      console.error(`[Skip] File not found (跳过，找不到文件): ${fileName}`);
      continue;
    }

    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const destName = `${baseName}.webp`; 
    const destPath = path.resolve(process.cwd(), destName);

    try {
      const originalSize = fs.statSync(srcPath).size;
      const encoded = await encodeWebpByTargetRatio(srcPath, originalSize);

      // 写入文件，如果重名会直接覆盖 
      fs.writeFileSync(destPath, encoded.buffer);

      const ratioPct = (encoded.ratio * 100).toFixed(1);
      console.log(`✔ Success: ${fileName} -> ${destName} (q=${encoded.quality}, ratio=${ratioPct}%)`);
    } catch (err) {
      console.error(`✘ Failed (失败): ${fileName} - ${err.message}`);
    }
  }

  console.log('--- All tasks completed (所有任务完成) ---');
}

run();