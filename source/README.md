# Сайт Vladnes

Одностраничный сайт-портфолио. Next.js (статический экспорт), обычный CSS, GSAP.

## Команды

- `npm run dev` — разработка на http://127.0.0.1:4500
- `npm run build` — сборка в `out/`
- `npm run preview:local` — сборка, демо-сайты и просмотр на http://127.0.0.1:4500
- `sh deploy/deploy.sh` — выкладка на сервер Timeweb

## Где что менять

- Тексты, цены, контакты, работы: `lib/site.js`
- Цвета и шрифты: начало `app/globals.css`
- Порядок блоков: `app/page.jsx`
- Анимации прокрутки: `components/Motion.jsx` (управляются атрибутами `data-split`, `data-reveal`, `data-px`)
- Синие лучи: `components/Aurora.jsx`

## Демо-сайты

`npm run demos` собирает в `demos/` три сайта: MAREA и Diving David (открываются в `/demo/...`)
и Archipila. Archipila собрана с путями от корня сайта, поэтому на сервере она работает
на отдельном порту 8081, а её адрес задаётся переменной `NEXT_PUBLIC_ARCHIPILA_URL` при сборке.

Скриншоты работ лежат в `public/works/`.
