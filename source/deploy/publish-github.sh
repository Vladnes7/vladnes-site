#!/bin/sh
# Выкладка vladnes.ru с GitHub (Vladnes7/vladnes-site) на сервер Timeweb.
# Запускать на Mac с ВЫКЛЮЧЕННЫМ VPN:  sh deploy/publish-github.sh
# Повторный запуск безопасен: обновит сайт через git pull и довыпустит сертификат.
# Ключи бота берутся из ~/.claude/.env и уходят прямо в файл на сервере, на экран не печатаются.
set -eu

SERVER="${SERVER:-sites}"
LOG="$(cd "$(dirname "$0")" && pwd)/publish.log"

main() {
  echo "== $(date '+%F %T') выкладка на $SERVER"

  # 1. Ключи бота -> /etc/vladnes/lead.env (права 600)
  TOKEN=$(grep '^TELEGRAM_BOT_TOKEN=' "$HOME/.claude/.env" | cut -d= -f2-)
  CHAT=$(grep '^TELEGRAM_CHAT_ID=' "$HOME/.claude/.env" | cut -d= -f2-)
  [ -n "$TOKEN" ] && [ -n "$CHAT" ] || { echo "Нет TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID в ~/.claude/.env"; exit 1; }
  printf 'TELEGRAM_BOT_TOKEN=%s\nTELEGRAM_CHAT_ID=%s\nALLOWED_ORIGINS=https://vladnes.ru,https://www.vladnes.ru\n' "$TOKEN" "$CHAT" |
    ssh -o ConnectTimeout=15 "$SERVER" 'umask 077; mkdir -p /etc/vladnes; cat > /etc/vladnes/lead.env'
  echo "ключи бота записаны"

  # 2. Всё остальное на сервере
  ssh -o ConnectTimeout=15 "$SERVER" 'bash -s' <<'REMOTE'
set -eu
export DEBIAN_FRONTEND=noninteractive
IP=37.77.106.12
REPO=https://github.com/Vladnes7/vladnes-site.git

command -v git >/dev/null || apt-get install -y -q git

# Сайт из GitHub
if [ -d /var/www/vladnes/.git ]; then
  git -C /var/www/vladnes fetch -q --depth 1 origin main
  git -C /var/www/vladnes reset -q --hard origin/main
elif [ -e /var/www/vladnes ]; then
  mv /var/www/vladnes "/var/www/vladnes.bak-$(date +%Y%m%d-%H%M)"
  git clone -q --depth 1 "$REPO" /var/www/vladnes
else
  git clone -q --depth 1 "$REPO" /var/www/vladnes
fi
echo "сайт: $(git -C /var/www/vladnes log -1 --format='%h %s')"

# Node 18+ для приёма заявок
NODE_MAJOR=$(node -v 2>/dev/null | sed 's/^v\([0-9]*\).*/\1/' || true)
if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 18 ]; then
  echo "ставлю Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null
  apt-get install -y -q nodejs >/dev/null
fi
echo "node: $(node -v)"

# Служба заявок
cp /var/www/vladnes/deploy/vladnes-lead.service /etc/systemd/system/vladnes-lead.service
systemctl daemon-reload
systemctl enable -q vladnes-lead
systemctl restart vladnes-lead
sleep 1
echo "служба заявок: $(systemctl is-active vladnes-lead)"

# nginx: копия старого конфига, новый, проверка, откат при ошибке
[ -f /etc/nginx/sites-available/vladnes ] && cp /etc/nginx/sites-available/vladnes "/root/nginx-vladnes.bak-$(date +%Y%m%d-%H%M)"
HAD_LINK=no; [ -e /etc/nginx/sites-enabled/vladnes ] && HAD_LINK=yes
cp /var/www/vladnes/deploy/nginx.conf /etc/nginx/sites-available/vladnes
ln -sf /etc/nginx/sites-available/vladnes /etc/nginx/sites-enabled/vladnes
if nginx -t 2>/tmp/nginx-test.txt; then
  systemctl reload nginx
  echo "nginx: конфиг принят"
else
  cat /tmp/nginx-test.txt
  [ "$HAD_LINK" = no ] && rm -f /etc/nginx/sites-enabled/vladnes
  B=$(ls -t /root/nginx-vladnes.bak-* 2>/dev/null | head -1 || true)
  [ -n "$B" ] && cp "$B" /etc/nginx/sites-available/vladnes
  echo "nginx: ОШИБКА, откатил. Остальные сайты не тронуты."
  exit 1
fi

# Сертификат только для имён, которые уже смотрят на сервер
DOMAINS=""
for d in vladnes.ru www.vladnes.ru archipila.vladnes.ru; do
  if getent ahostsv4 "$d" | grep -q "^$IP "; then DOMAINS="$DOMAINS -d $d"; echo "DNS ok: $d"
  else echo "DNS ещё не смотрит на сервер: $d"; fi
done
if [ -n "$DOMAINS" ]; then
  command -v certbot >/dev/null || apt-get install -y -q certbot python3-certbot-nginx >/dev/null
  certbot --nginx --non-interactive --agree-tos --redirect --expand --cert-name vladnes \
    -m zemanovvlad351@gmail.com $DOMAINS
  echo "сертификат: готово"
else
  echo "сертификат пропущен: добавь A-записи и запусти скрипт ещё раз"
fi

curl -s -o /dev/null -w "проверка vladnes.ru на сервере: %{http_code}\n" -H 'Host: vladnes.ru' http://127.0.0.1/
REMOTE

  echo "== готово"
}

main 2>&1 | tee "$LOG"
