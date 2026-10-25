#!/bin/sh
# Выкладка на сервер Timeweb. Запускать из папки site:  sh deploy/deploy.sh
# Пароль или ключ SSH спросит сам rsync. В файле их нет и быть не должно.
set -eu

SERVER="${SERVER:-root@37.77.106.12}"
ARCHIPILA_URL="${ARCHIPILA_URL:-http://37.77.106.12:8081/}"

NEXT_PUBLIC_ARCHIPILA_URL="$ARCHIPILA_URL" npm run build
npm run demos

ssh "$SERVER" "mkdir -p /var/www/vladnes/portfolio /var/www/vladnes/demos"
rsync -az --delete out/ "$SERVER:/var/www/vladnes/portfolio/"
rsync -az --delete demos/ "$SERVER:/var/www/vladnes/demos/"
rsync -az deploy/nginx.conf "$SERVER:/etc/nginx/sites-available/vladnes"
# Обработчик заявок. Ключи бота в выкладку не входят: они лежат на сервере в /etc/vladnes/lead.env.
ssh "$SERVER" "mkdir -p /var/www/vladnes/server"
rsync -az server/lead.mjs "$SERVER:/var/www/vladnes/server/"
rsync -az deploy/vladnes-lead.service "$SERVER:/etc/systemd/system/vladnes-lead.service"

echo "Файлы на сервере. Первый раз выполните на сервере:"
echo "  ln -sf /etc/nginx/sites-available/vladnes /etc/nginx/sites-enabled/vladnes"
echo "  rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl reload nginx"
