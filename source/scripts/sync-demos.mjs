// Собирает демо-сайты в папку demos/ рядом с out/: её выкладывает deploy.sh,
// а локальный просмотр (npm run preview:local) подключает как out/demo.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const projects = resolve(site, "../../..");
const chatgpt = resolve(site, "../сайты-из-ChatGPT");
// Сайты Влада с GitHub, собранные под /demo/<имя>/ (см. сайты-github/README.md).
const github = resolve(site, "../сайты-github");
const target = join(site, "demos");

const sources = {
  marea: { from: join(chatgpt, "marea-portfolio/dist") },
  daviddive: {
    from: join(projects, "Сайты для клиентов/DavidDive/site"),
    only: ["index.html", "script.js", "styles.css", "motion.css", "motion.js", "img", "video"],
  },
  archipila: { from: join(github, "archipila") },
  zharko: { from: join(github, "zharko") },
  "mokry-nos": { from: join(github, "mokry-nos") },
  avelia: { from: join(github, "avelia") },
  elan: { from: join(github, "elan") },
  pinehaven: { from: join(github, "pinehaven") },
  "verde-auto": { from: join(github, "verde-auto") },
};

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

for (const [name, { from, only }] of Object.entries(sources)) {
  if (!existsSync(from)) {
    console.log(`пропущено ${name}: нет ${from} (сначала соберите этот сайт)`);
    continue;
  }
  const to = join(target, name);
  if (only) {
    mkdirSync(to, { recursive: true });
    for (const item of only) if (existsSync(join(from, item))) cpSync(join(from, item), join(to, item), { recursive: true });
  } else {
    cpSync(from, to, { recursive: true });
  }
  console.log(`готово ${name}`);
}
