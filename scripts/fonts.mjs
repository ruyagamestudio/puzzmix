// Yazı tiplerini internetsiz çalışması için uygulamaya gömer.
// npm paketlerindeki (fontsource) latin ve latin-ext dosyalarını www/fonts içine kopyalar.
import fs from "fs";
import path from "path";

const out = "www/fonts";
fs.mkdirSync(out, { recursive: true });

const jobs = [
  { pkg: "@fontsource-variable/bricolage-grotesque", css: ["wght.css"], from: "Bricolage Grotesque Variable", to: "Bricolage Grotesque" },
  { pkg: "@fontsource-variable/instrument-sans", css: ["wght.css"], from: "Instrument Sans Variable", to: "Instrument Sans" },
  { pkg: "@fontsource/ibm-plex-mono", css: ["400.css", "500.css"], from: "IBM Plex Mono", to: "IBM Plex Mono" },
];

let css = "";
let faces = 0;
for (const j of jobs) {
  const base = path.join("node_modules", j.pkg);
  for (const f of j.css) {
    const text = fs.readFileSync(path.join(base, f), "utf8");
    for (const block of text.match(/@font-face\s*{[^}]*}/g) || []) {
      const m = block.match(/url\(\.\/files\/([^)]+?-(latin|latin-ext)-[^)]*?\.woff2)\)/);
      if (!m) continue;
      fs.copyFileSync(path.join(base, "files", m[1]), path.join(out, m[1]));
      const fixed = block
        .replace(/src:[^;]*;/, `src: url(${m[1]}) format("woff2");`)
        .split(j.from).join(j.to);
      css += fixed + "\n";
      faces++;
    }
  }
}
if (faces < 6) {
  console.error("Yazı tipi dosyaları bulunamadı, bulunan: " + faces);
  process.exit(1);
}
fs.writeFileSync(path.join(out, "fonts.css"), css);
console.log("Yazı tipi bloğu sayısı: " + faces);
