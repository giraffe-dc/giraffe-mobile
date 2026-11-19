// Завантажує APK у GitHub Releases репозиторію giraffe-dc/newSite.
// APK не зберігається в git/Vercel (ліміти розміру) — дистрибуція лише через Releases.
//
// Використання:
//   node scripts/upload-release.mjs --apk <шлях.apk> --tag v1.0.2 --name giraffe-mobile-1.0.2-b3.apk [--notes "..."]
//
// Аутентифікація — через `git credential fill` (credential manager зберігає токен GitHub).
// Виводить JSON: { url, size }.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const apkPath = arg("apk");
const tag = arg("tag");
const name = arg("name", "giraffe-mobile.apk");
const notes = arg("notes", "Mobilnyi dodatok Zhyrafyk.");
const repo = arg("repo", "giraffe-dc/newSite");

if (!apkPath || !tag) {
  console.error("Потрібні --apk і --tag");
  process.exit(1);
}

const cred = execFileSync("git", ["credential", "fill"], {
  input: "protocol=https\nhost=github.com\n\n",
  encoding: "utf8",
  windowsHide: true,
});
const token = (cred.split("\n").find((l) => l.startsWith("password=")) || "").slice(9).trim();
if (!token) {
  console.error("Немає токена GitHub у git credential helper");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "giraffe-build",
};

let rel = null;
const check = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${tag}`, { headers });
if (check.ok) rel = await check.json();
if (!rel) {
  const create = await fetch(`https://api.github.com/repos/${repo}/releases`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ tag_name: tag, name: `Zhyrafyk APK ${tag}`, body: notes }),
  });
  if (!create.ok) {
    console.error("Не вдалося створити release:", create.status, (await create.text()).slice(0, 300));
    process.exit(1);
  }
  rel = await create.json();
}

const buf = fs.readFileSync(apkPath);
const asset = (rel.assets || []).find((a) => a.name === name);
if (asset) {
  console.log(JSON.stringify({ url: asset.browser_download_url, size: asset.size, reused: true }));
  process.exit(0);
}

const up = await fetch(
  `https://uploads.github.com/repos/${repo}/releases/${rel.id}/assets?name=${encodeURIComponent(name)}`,
  {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Length": String(buf.length),
    },
    body: buf,
  },
);
if (!up.ok) {
  console.error("Не вдалося завантажити APK:", up.status, (await up.text()).slice(0, 300));
  process.exit(1);
}
const uploaded = await up.json();
console.log(JSON.stringify({ url: uploaded.browser_download_url, size: uploaded.size }));
