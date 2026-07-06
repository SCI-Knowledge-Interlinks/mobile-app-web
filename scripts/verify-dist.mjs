import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const indexHtml = path.join(distDir, "index.html");

if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
  console.error("ERROR: No output directory found after build");
  console.error(`Expected: ${distDir}`);
  process.exit(1);
}

if (!fs.existsSync(indexHtml)) {
  console.error("ERROR: Build output is missing index.html");
  console.error(`Expected: ${indexHtml}`);
  process.exit(1);
}

console.log(`Build output verified: ${distDir}`);
