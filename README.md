# shiftbase-qa

QA portfolio untuk Shiftbase — test plan, 38 test cases, 2 bug report,
Newman API suite, Playwright e2e 3 peran, laporan Excel.

## Hasil (run 2026-09-14, env terisolasi)

| Suite | Hasil |
|---|---|
| Test cases | 38/38 Pass |
| Newman API (`shiftbase` collection) | 15/15 assertions |
| Playwright e2e (Chromium headless) | 6/6 |
| `go test` + swagger validate | Pass, service 79.8% |
| Bug terbuka | 2 (Low) |

Fokus: matriks RBAC admin/manager/staff, konflik shift 409, import CSV
(header/aturan/2MB), overtime >8 jam, roster per peran.

Laporan utama: [`reports/Shiftbase-QA-Report.xlsx`](reports/Shiftbase-QA-Report.xlsx)
(generate via `tools/build_report.py`, jangan edit manual).

## Struktur

```
test-plan.md, data/testcases.yaml, data/bugs.yaml, data/results.yaml
tools/build_report.py, tools/redact_reports.py
e2e/ (Playwright: web.spec.ts, web2.spec.ts)
reports/ (newman.json, playwright.json, XLSX)
```

## Cara run (urutan penting — isolasi!)

```bash
# 1. MySQL docker + migrate + seed (DB shiftbase_qa)
docker run --rm --name sb-qa-mysql -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=shiftbase_qa -e MYSQL_USER=shift -e MYSQL_PASSWORD=shiftpass \
  -p 13306:3306 mysql:8.4 &
goose -dir ../shiftbase/migrations mysql \
  "shift:shiftpass@tcp(127.0.0.1:13306)/shiftbase_qa?parseTime=true" up
# seed via mysql client di container

# 2. API :18092, 3. API checks, 4. Newman, 5. e2e (:5198)
PORT=18092 JWT_SECRET=x DB_DSN="shift:shiftpass@tcp(127.0.0.1:13306)/shiftbase_qa?parseTime=true" /tmp/sb-qa &
python3 /tmp/sb_run.py   # → data/results.yaml (ad-hoc)
npx newman run ../shiftbase/api/postman_collection.json --env-var baseUrl=http://localhost:18092
cp e2e/.env.example e2e/.env  # isi SB_PASS_*
cd e2e && npx playwright test

# 6. Generate + sanitasi
python3 tools/build_report.py && python3 tools/redact_reports.py
```

## Bug temuan (ringkas)

* BUG-SB-001 (Low): dropdown pegawai tak refresh setelah import CSV.
* BUG-SB-002 (Low): tab aktif tak persist setelah reload (tanpa router).

## Hygiene

Kredensial seed (`*@shiftbase.local`) adalah akun demo fiktif (publik by design).
Password e2e via env (`SB_PASS_*`); reports selalu lewat `redact_reports.py`.
