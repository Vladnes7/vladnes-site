# vladnes-site

Готовая к выкладке копия портфолио vladnes.ru. Папки повторяют раскладку на сервере `/var/www/vladnes/`:

| Папка | Что это | Куда смотрит nginx |
|---|---|---|
| `portfolio/` | собранный сайт (Next, статический экспорт) | `root` основного сервера |
| `demos/` | демо-сайты, открываются как `/demo/<имя>/` | `location /demo/` |
| `server/lead.mjs` | приём заявок, пересылает в Telegram | `proxy_pass 127.0.0.1:8787` |
| `deploy/` | `nginx.conf` (vladnes.ru, www, archipila.vladnes.ru) и `vladnes-lead.service` | копируются в `/etc/nginx` и `/etc/systemd/system` |
| `source/` | исходники сайта для правок и пересборки | не выкладывается |

Ключи бота здесь не хранятся: они лежат на сервере в `/etc/vladnes/lead.env`.

## Обновление сайта на сервере

```
cd /var/www/vladnes && git pull
```

## Пересборка (на компьютере)

В `source/`: `npm ci`, затем `npm run build` и `npm run demos`; результат копируется в `portfolio/` (без папки `demo`) и `demos/`.
