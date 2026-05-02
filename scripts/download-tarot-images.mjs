/**
 * 메이저 아르카나 22장 이미지를 Wikimedia Commons에서 받아 public/tarot/ 에 저장.
 * RWS(Rider-Waite-Smith) 퍼블릭 도메인. 한 번 실행 후 앱은 로컬 이미지 사용.
 *
 * 사용: node scripts/download-tarot-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'misterytarot');

const WIKI_FILES = [
  'RWS_Tarot_00_Fool.jpg',
  'RWS_Tarot_01_Magician.jpg',
  'RWS_Tarot_02_High_Priestess.jpg',
  'RWS_Tarot_03_Empress.jpg',
  'RWS_Tarot_04_Emperor.jpg',
  'The_Lovers.jpg',
  'RWS_Tarot_07_Chariot.jpg',
  'RWS_Tarot_08_Strength.jpg',
  'RWS_Tarot_10_Wheel_of_Fortune.jpg',
  'RWS_Tarot_17_Star.jpg',
  'RWS_Tarot_18_Moon.jpg',
  'RWS_Tarot_19_Sun.jpg',
  'RWS_Tarot_05_Hierophant.jpg',
  'RWS_Tarot_09_Hermit.jpg',
  'RWS_Tarot_11_Justice.jpg',
  'RWS_Tarot_12_Hanged_Man.jpg',
  'RWS_Tarot_13_Death.jpg',
  'RWS_Tarot_14_Temperance.jpg',
  'RWS_Tarot_15_Devil.jpg',
  'RWS_Tarot_16_Tower.jpg',
  'RWS_Tarot_20_Judgement.jpg',
  'RWS_Tarot_21_World.jpg',
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
    const normalized = filename.replace(/_/g, ' ');
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(normalized)}%20Rider%20Waite%20tarot&srnamespace=6&srlimit=1&format=json&origin=*`;
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

  for (let i = 0; i < WIKI_FILES.length; i++) {
    const filename = WIKI_FILES[i];
    const outPath = path.join(OUT_DIR, `${String(i).padStart(2, '0')}.jpg`);
    if (fs.existsSync(outPath)) {
      console.log(`[${i + 1}/22] skip (exists) ${filename} -> ${outPath}`);
      continue;
    }
    let url = await getImageUrl(filename);
    if (!url && filename === 'The_Lovers.jpg') {
      url = await getImageUrl('RWS_Tarot_06_Lovers.jpg');
    }
    if (!url) {
      console.warn(`[${i + 1}/22] no URL for ${filename}, skipping`);
      continue;
    }
    try {
      let res = await fetch(url, { redirect: 'follow' });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 3000));
        res = await fetch(url, { redirect: 'follow' });
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      fs.writeFileSync(outPath, Buffer.from(buf));
      console.log(`[${i + 1}/22] saved ${filename} -> ${outPath}`);
    } catch (e) {
      console.error(`[${i + 1}/22] failed ${filename}:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  console.log('Done. Run app and use /tarot/00.jpg ... /tarot/21.jpg');
}

main();
