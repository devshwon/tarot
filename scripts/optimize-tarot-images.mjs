/**
 * public/tarot/*.jpg 리사이즈·압축으로 배포 용량 축소.
 * - 최대 너비 448px (224px 카드 × 2 레티나), 비율 유지
 * - JPEG 품질 82, 기존 파일 덮어쓰기
 *
 * 사용: npm run tarot:optimize
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TAROT_DIR = path.join(__dirname, '..', 'public', 'misterytarot');
const MAX_WIDTH = 448;
const JPEG_QUALITY = 82;

async function main() {
  if (!fs.existsSync(TAROT_DIR)) {
    console.error('public/tarot not found');
    process.exit(1);
  }
  const files = fs.readdirSync(TAROT_DIR).filter((f) => f.endsWith('.jpg'));
  let totalBefore = 0;
  let totalAfter = 0;
  for (const file of files) {
    const filePath = path.join(TAROT_DIR, file);
    const stat = fs.statSync(filePath);
    totalBefore += stat.size;
    const buf = await sharp(filePath)
      .resize(MAX_WIDTH, null, { withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();
    const tmpPath = path.join(TAROT_DIR, `.tmp.${file}`);
    fs.writeFileSync(tmpPath, buf);
    fs.renameSync(tmpPath, filePath);
    totalAfter += buf.length;
  }
  console.log(`Optimized ${files.length} files`);
  console.log(`Before: ${(totalBefore / 1024 / 1024).toFixed(2)} MB → After: ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
