import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE = "chibi character, extremely big round head, tiny small body, short legs, cute kawaii, bright colors, white background, full body, children illustration, soft shading, adorable, big sparkly eyes, rosy cheeks";

const CHARACTERS = [
  { id: 1,  name: "경찰관",   prompt: `cute chibi police officer uniform, blue cap, badge, ${BASE}` },
  { id: 2,  name: "간호사",   prompt: `cute chibi nurse, white uniform, red cross cap, ${BASE}` },
  { id: 3,  name: "의사",     prompt: `cute chibi doctor, white coat, stethoscope, ${BASE}` },
  { id: 4,  name: "소방관",   prompt: `cute chibi firefighter, red helmet, yellow jacket, ${BASE}` },
  { id: 5,  name: "요리사",   prompt: `cute chibi chef, white tall chef hat, apron, ${BASE}` },
  { id: 6,  name: "선생님",   prompt: `cute chibi teacher, holding book, glasses, ${BASE}` },
  { id: 7,  name: "우주인",   prompt: `cute chibi astronaut, space suit, helmet, ${BASE}` },
  { id: 8,  name: "파일럿",   prompt: `cute chibi pilot, navy uniform, pilot cap, ${BASE}` },
  { id: 9,  name: "마법사",   prompt: `cute chibi wizard, purple hat with stars, magic wand, ${BASE}` },
  { id: 10, name: "공주",     prompt: `cute chibi princess, pink dress, tiara, ${BASE}` },
];

const outDir = path.join(__dirname, "../public/characters");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function generateImage(character) {
  const encodedPrompt = encodeURIComponent(character.prompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${character.id}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(outDir, `char_${character.id}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ ${character.id}. ${character.name} → char_${character.id}.png`);
}

async function main() {
  console.log("🎨 캐릭터 20개 생성 시작...\n");
  for (const char of CHARACTERS) {
    try {
      await generateImage(char);
      await new Promise(r => setTimeout(r, 1500)); // rate limit 방지
    } catch (e) {
      console.error(`❌ ${char.id}. ${char.name} 실패:`, e.message);
    }
  }
  console.log("\n🎉 완료! public/characters/ 폴더를 확인하세요.");
}

main();
