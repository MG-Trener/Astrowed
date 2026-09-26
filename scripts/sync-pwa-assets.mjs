import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const source = path.join(
  root,
  "src",
  "assets",
  "generated",
  "astrowed-logo.webp",
);

const targets = [
  path.join(root, "public", "pwa"),
  path.join(root, "apps", "pages", "public", "pwa"),
];

const background = { r: 11, g: 20, b: 16, alpha: 1 };

async function writeSquare(target, filename, size) {
  await sharp(source)
    .resize(size, size, {
      fit: "contain",
      background,
    })
    .png({ compressionLevel: 9 })
    .toFile(path.join(target, filename));
}

async function writeMaskable(target) {
  const innerSize = 384;
  const margin = 64;
  const inner = await sharp(source)
    .resize(innerSize, innerSize, {
      fit: "contain",
      background,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background,
    },
  })
    .composite([{ input: inner, left: margin, top: margin }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(target, "icon-maskable-512.png"));
}

for (const target of targets) {
  await mkdir(target, { recursive: true });
  await writeSquare(target, "icon-64.png", 64);
  await writeSquare(target, "apple-touch-icon.png", 180);
  await writeSquare(target, "icon-192.png", 192);
  await writeSquare(target, "icon-512.png", 512);
  await writeMaskable(target);
}
