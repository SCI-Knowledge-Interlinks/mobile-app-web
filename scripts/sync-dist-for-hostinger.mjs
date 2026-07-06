import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");

function copyEntry(source, destination) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyEntry(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

if (!fs.existsSync(path.join(distDir, "index.html"))) {
  console.error("ERROR: dist/index.html not found before Hostinger publish sync");
  process.exit(1);
}

for (const entry of fs.readdirSync(distDir)) {
  if (entry === ".git" || entry === "node_modules") {
    continue;
  }

  const source = path.join(distDir, entry);
  const destination = path.join(rootDir, entry);
  copyEntry(source, destination);
}

console.log("Synced dist/ to repository root for Hostinger static hosting.");
