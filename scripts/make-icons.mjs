/**
 * Rasterises public/icons/*.svg into the PNGs the web app manifest needs.
 *
 * Deliberately NOT part of `npm run build` — the PNGs are committed, so a normal
 * build and deploy never depends on sharp being installed. Run by hand only when
 * the icon artwork changes:  node scripts/make-icons.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ICONS = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

const { default: sharp } = await import("sharp").catch(() => {
  console.error("sharp is not installed. Run `npm i -D sharp`, or rasterise the SVGs by hand.");
  process.exit(1);
});

const jobs = [
  ["icon.svg", "icon-192.png", 192],
  ["icon.svg", "icon-512.png", 512],
  ["icon.svg", "apple-touch-icon.png", 180],
  ["icon-maskable.svg", "icon-maskable-512.png", 512],
];

for (const [src, out, size] of jobs) {
  await sharp(readFileSync(join(ICONS, src)))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(ICONS, out));
  console.log(`  ${out.padEnd(26)} ${size}x${size}`);
}
console.log("icons written to public/icons/");
