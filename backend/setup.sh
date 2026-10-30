#!/usr/bin/env bash
# Создаёт Supabase-проект «taza-aba», применяет schema.sql, создаёт приватный бакет taza-aba-avatars и записывает URL + anon key в ../config.js.
# Требуется: SUPABASE_ACCESS_TOKEN (Personal access token, https://supabase.com/dashboard/account/tokens), curl, python3.
# SUPABASE_REF=<ref> — использовать существующий проект (объекты изолированы префиксом taza_).
# Необязательно: SUPABASE_ORG_ID (иначе берётся первая организация), SUPABASE_REGION (по умолчанию ap-south-1 — Мумбаи, ближе всего к Центральной Азии; альтернатива eu-central-1),
#   SUPABASE_DB_PASS (иначе генерируется и сохраняется в backend/.db_pass, файл не публикуется), SITE_URL (для Auth redirect).
set -euo pipefail
: "${SUPABASE_ACCESS_TOKEN:?Нужен SUPABASE_ACCESS_TOKEN}"
cd "$(dirname "$0")"
API=https://api.supabase.com/v1; H=(-H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json")
REGION="${SUPABASE_REGION:-ap-south-1}"; SITE="${SITE_URL:-https://taza-aba.surge.sh/}"
if [ -z "${SUPABASE_DB_PASS:-}" ]; then SUPABASE_DB_PASS=$(python3 -c 'import secrets;print(secrets.token_urlsafe(24))'); umask 077; echo "$SUPABASE_DB_PASS" > .db_pass; fi
REF="${SUPABASE_REF:-}"; [ -n "$REF" ] || REF=$(curl -fsS "${H[@]}" $API/projects | python3 -c 'import json,sys;p=[x for x in json.load(sys.stdin) if x["name"]==sys.argv[1]];print(p[0]["id"] if p else "")' "${SUPABASE_PROJECT_NAME:-taza-aba}")
if [ -z "$REF" ]; then
  ORG="${SUPABASE_ORG_ID:-$(curl -fsS "${H[@]}" $API/organizations | python3 -c 'import json,sys;o=json.load(sys.stdin);print(o[0]["id"] if o else "")')}"
  echo "Создаю проект taza-aba в $REGION (организация $ORG)…"
  REF=$(curl -fsS "${H[@]}" -X POST $API/projects -d "$(python3 -c 'import json,sys;print(json.dumps({"name":"taza-aba","organization_id":sys.argv[1],"region":sys.argv[2],"db_pass":sys.argv[3]}))' "$ORG" "$REGION" "$SUPABASE_DB_PASS")" | python3 -c 'import json,sys;print(json.load(sys.stdin)["id"])')
fi
echo "Проект: $REF — жду готовности…"
for i in $(seq 1 60); do S=$(curl -fsS "${H[@]}" $API/projects/$REF | python3 -c 'import json,sys;print(json.load(sys.stdin).get("status",""))'); echo "  $S"; [ "$S" = "ACTIVE_HEALTHY" ] && break; sleep 10; done
echo "Применяю schema.sql…"
curl -fsS "${H[@]}" -X POST $API/projects/$REF/database/query -d "$(python3 -c 'import json;print(json.dumps({"query":open("schema.sql").read()}))')" >/dev/null
echo "Настраиваю Auth (адрес сайта для писем подтверждения)…"
curl -fsS "${H[@]}" -X PATCH $API/projects/$REF/config/auth -d "$(python3 -c 'import json,sys;print(json.dumps({"site_url":sys.argv[1],"uri_allow_list":sys.argv[1]+"**,https://lalalalallalalalalalala.github.io/taza-aba/**"}))' "$SITE")" >/dev/null || echo "  (не удалось обновить настройки Auth — задайте Site URL вручную)"
ANON=$(curl -fsS "${H[@]}" "$API/projects/$REF/api-keys" | python3 -c 'import json,sys;k=[x for x in json.load(sys.stdin) if x.get("name")=="anon"];print(k[0]["api_key"])')
URL="https://$REF.supabase.co"
python3 - "$URL" "$ANON" <<'PY'
import re,sys
p="../config.js"; s=open(p).read()
s=re.sub(r'SUPABASE_URL:\s*"[^"]*"','SUPABASE_URL: "%s"'%sys.argv[1],s); s=re.sub(r'SUPABASE_ANON_KEY:\s*"[^"]*"','SUPABASE_ANON_KEY: "%s"'%sys.argv[2],s)
open(p,"w").write(s); print("config.js обновлён:",sys.argv[1])
PY
echo "Готово. Пересоберите zip/exe и задеплойте."
