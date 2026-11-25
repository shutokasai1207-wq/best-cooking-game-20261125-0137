// Sizzle & Serve — hand-in program for the make.fun cooking-game bounty.
// Copies game/ and screenshots/ into the output directory and writes the
// dossier with the kit's buildDossier. Node 22 standard library only.
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const rootDir = new URL('.', import.meta.url).pathname;

mkdirSync(outDir, { recursive: true });

for (const name of ['game', 'screenshots']) {
  const src = join(rootDir, name);
  const dst = join(outDir, name);
  if (!existsSync(src)) {
    throw new Error(`missing ${name}/ in the repository`);
  }
  cpSync(src, dst, { recursive: true });
}

// The dossier needs at least one screenshot; fail loudly instead of
// handing in an entry the gate would refuse.
const shotCount = readdirSync(join(outDir, 'screenshots'))
  .filter((f) => /\.(png|jpe?g)$/i.test(f)).length;
if (shotCount < 3) {
  throw new Error(`expected at least 3 screenshots, found ${shotCount}`);
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`wrote ${outDir}/dossier.json (${dossier.length} bytes)`);
