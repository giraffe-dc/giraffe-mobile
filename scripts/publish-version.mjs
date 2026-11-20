// Публікує маніфест версії APK у БД сайту (POST /api/mobile/version).
// Заміняє стару схему «скопіювати version.json у giraffe-site і задеплоїти»:
// після релізу додатка деплой сайту не потрібен.
//
// Використання:
//   node scripts/publish-version.mjs --file release.json [--api https://giraffe-teplyk.vercel.app]
//
// Ключ: env MOBILE_RELEASE_KEY; якщо не задано — шукаємо у сусідньому
// giraffe-site/.env.local (той самий файл, що й на Vercel), щоб збірка
// працювала без ручного налаштування env.
// Виводить JSON: { ok, status, body }.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const file = arg("file", "release.json");
const apiBase = (arg("api") || process.env.EXPO_PUBLIC_API_BASE ||
  "https://giraffe-teplyk.vercel.app").replace(/\/$/, "");

function keyFromEnvFile() {
  const siteEnv = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..", "..", "giraffe-site", ".env.local",
  );
  try {
    return fs
      .readFileSync(siteEnv, "utf8")
      .match(/^MOBILE_RELEASE_KEY=(.+)$/m)?.[1]
      ?.trim() || null;
  } catch {
    return null;
  }
}

const key = process.env.MOBILE_RELEASE_KEY || keyFromEnvFile();

if (!key) {
  console.error(
    "Потрібен MOBILE_RELEASE_KEY (env або giraffe-site/.env.local).",
  );
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error(`Не вдалося прочитати ${file}:`, error.message);
  process.exit(1);
}

const res = await fetch(`${apiBase}/api/mobile/version`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  },
  body: JSON.stringify(manifest),
});

let body = null;
try {
  body = await res.json();
} catch {
  // відповідь не JSON — залишаємо null
}

const ok = res.ok && body?.success === true;
console.log(JSON.stringify({ ok, status: res.status, body }));
if (!ok) process.exit(1);
