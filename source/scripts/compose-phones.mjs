import puppeteer from "puppeteer-core";
import { writeFileSync } from "node:fs";
// Собирает слои «экран» для телефонов блока «Наш подход»: node scripts/compose-phones.mjs <папка вывода> <site/public/works>.
// Нужен puppeteer-core и Chrome. Из PNG в <папка вывода> получить WebP: cwebp -q 90 -alpha_q 95 l-screen.png -o site/public/art/phone-l-screen.webp
const S = process.argv[2], W = process.argv[3];
// Углы стекла (с чёрной рамкой): верх-лево, верх-право, низ-право, низ-лево, в пикселях картинки 1024×1536.
const PHONES = {
  l: { quad: [[240.5,34],[734.8,103],[900,1444],[384,1486]], shot: "daviddive-m.webp" },
  r: { quad: [[251.5,133],[785,22.5],[745,1498],[183,1438]], shot: "marea-m.webp" },
};
const PW = 636, PH = 1334; // плоскость экрана: 600×1298 скриншот + по 18 px чёрной рамки
function homography(src, dst) {
  // решаем 8 уравнений для 3×3 матрицы, переводящей src в dst
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  for (let i = 0; i < 8; i++) {
    let m = i; for (let r = i + 1; r < 8; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r;
    [A[i], A[m]] = [A[m], A[i]]; [b[i], b[m]] = [b[m], b[i]];
    for (let r = i + 1; r < 8; r++) { const f = A[r][i] / A[i][i]; for (let c = i; c < 8; c++) A[r][c] -= f * A[i][c]; b[r] -= f * b[i]; }
  }
  const h = Array(8).fill(0);
  for (let i = 7; i >= 0; i--) { let s = b[i]; for (let c = i + 1; c < 8; c++) s -= A[i][c] * h[c]; h[i] = s / A[i][i]; }
  return h; // h33 = 1
}
function matrix3d(h) {
  const [a, b, c, d, e, f, g, hh] = h;
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
}
const grow = (q, k) => { // немного раздвигаем четырёхугольник от центра, чтобы чёрное перекрыло края рамки
  const cx = q.reduce((s, p) => s + p[0], 0) / 4, cy = q.reduce((s, p) => s + p[1], 0) / 4;
  return q.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
};
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
for (const [id, p] of Object.entries(PHONES)) {
  const q = grow(p.quad, 1.012);
  const h = homography([[0, 0], [PW, 0], [PW, PH], [0, PH]], q);
  const html = `<!doctype html><meta charset=utf-8><style>
  html,body{margin:0;background:transparent}
  #plane{position:absolute;left:0;top:0;width:${PW}px;height:${PH}px;transform-origin:0 0;transform:${matrix3d(h)};background:#000;border-radius:96px;overflow:hidden}
  #plane img{position:absolute;left:18px;top:18px;width:600px;height:1298px;object-fit:cover;object-position:top;border-radius:78px}
  #isl{position:absolute;left:${PW / 2 - 92}px;top:34px;width:184px;height:52px;border-radius:30px;background:#000}
  </style><div id=plane><img src="file://${W}/${p.shot}"><div id=isl></div></div>`;
  writeFileSync(`${S}/${id}-compose.html`, html);
  const page = await b.newPage();
  await page.setViewport({ width: 1024, height: 1536 });
  await page.goto(`file://${S}/${id}-compose.html`);
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: `${S}/${id}-screen.png`, omitBackground: true });
  await page.close();
}
await b.close();
console.log("ok");
