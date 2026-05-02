/**
 * 마이너 아르카나 56장 이미지를 Wikimedia Commons에서 받아 public/tarot/ 에 저장.
 * RWS 덱. 파일명: Wands01-14, Cups01-14, Swords01-14, Pents01-14 → 22.jpg~77.jpg
 *
 * 사용: node scripts/download-tarot-images-minor.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'misterytarot');

/** Commons 파일명 → 우리 카드 id (22~77) */
const MINOR_FILES = [
  ...['Wands01.jpg', 'Wands02.jpg', 'Wands03.jpg', 'Wands04.jpg', 'Wands05.jpg', 'Wands06.jpg', 'Wands07.jpg', 'Wands08.jpg', 'Wands09.jpg', 'Wands10.jpg', 'Wands11.jpg', 'Wands12.jpg', 'Wands13.jpg', 'Wands14.jpg'],
  ...['Cups01.jpg', 'Cups02.jpg', 'Cups03.jpg', 'Cups04.jpg', 'Cups05.jpg', 'Cups06.jpg', 'Cups07.jpg', 'Cups08.jpg', 'Cups09.jpg', 'Cups10.jpg', 'Cups11.jpg', 'Cups12.jpg', 'Cups13.jpg', 'Cups14.jpg'],
  ...['Swords01.jpg', 'Swords02.jpg', 'Swords03.jpg', 'Swords04.jpg', 'Swords05.jpg', 'Swords06.jpg', 'Swords07.jpg', 'Swords08.jpg', 'Swords09.jpg', 'Swords10.jpg', 'Swords11.jpg', 'Swords12.jpg', 'Swords13.jpg', 'Swords14.jpg'],
  ...['Pents01.jpg', 'Pents02.jpg', 'Pents03.jpg', 'Pents04.jpg', 'Pents05.jpg', 'Pents06.jpg', 'Pents07.jpg', 'Pents08.jpg', 'Pents09.jpg', 'Pents10.jpg', 'Pents11.jpg', 'Pents12.jpg', 'Pents13.jpg', 'Pents14.jpg'],
];

async function getImageUrl(filename) {
  const title = `File:${filename}`;
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  const pages = data.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const url = page?.imageinfo?.[0]?.url;
  if (!url) {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(filename)}%20Rider%20Waite&srnamespace=6&srlimit=1&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const hit = searchData.query?.search?.[0];
    if (hit) {
      const fileTitle = hit.title.replace(/^File:/, '');
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const infoRes = await fetch(infoUrl);
      const infoData = await infoRes.json();
      const infoPages = infoData.query?.pages ?? {};
      const infoPage = Object.values(infoPages)[0];
      return infoPage?.imageinfo?.[0]?.url ?? null;
    }
  }
  return url ?? null;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  for (let i = 0; i < MINOR_FILES.length; i++) {
    const filename = MINOR_FILES[i];
    const cardId = 22 + i;
    const outPath = path.join(OUT_DIR, `${cardId}.jpg`);
    if (fs.existsSync(outPath)) {
      console.log(`[${i + 1}/56] skip (exists) ${filename} -> ${outPath}`);
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }
    const url = await getImageUrl(filename);
    if (!url && filename === 'Wands09.jpg') {
      const fallback = await getImageUrl('Tarot_Nine_of_Wands.jpg');
      if (fallback) {
        const outPath = path.join(OUT_DIR, '30.jpg');
        if (!fs.existsSync(outPath)) {
          try {
            let res = await fetch(fallback, { redirect: 'follow' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
            console.log(`[9/56] saved Tarot_Nine_of_Wands.jpg -> ${outPath}`);
          } catch (e) {
            console.error(`[9/56] fallback failed:`, e.message);
          }
        }
        await new Promise((r) => setTimeout(r, 1200));
        continue;
      }
    }
    if (!url) {
      console.warn(`[${i + 1}/56] no URL for ${filename}, skipping`);
      await new Promise((r) => setTimeout(r, 800));
      continue;
    }
    try {
      let res = await fetch(url, { redirect: 'follow' });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 4000));
        res = await fetch(url, { redirect: 'follow' });
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      fs.writeFileSync(outPath, Buffer.from(buf));
      console.log(`[${i + 1}/56] saved ${filename} -> ${outPath}`);
    } catch (e) {
      console.error(`[${i + 1}/56] failed ${filename}:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  console.log('Done. Minor arcana: /tarot/22.jpg ... /tarot/77.jpg');
}

main();
