# Test Plan — Shiftbase (API + Web)

Objek uji: `shiftbase` (Go/Gin + MySQL, JWT, RBAC admin/manager/staff,
zona bisnis Asia/Jakarta) + `shiftbase-web` (Jadwal, Shift, Absensi, Laporan).
Versi: main per 14 Sep 2026.

## 1. Scope

Dalam: auth + RBAC matrix, employees CRUD, shifts CRUD + konflik 409,
attendance check-in/out milik-sendiri-vs-kelola, import CSV (header/aturan/2MB),
reports overtime (>8 jam) + coverage, 4 halaman web per peran.
Luar: deploy/infra, performance.

## 2. Pendekatan

* Manual fungsional + boundary + negatif + matriks RBAC (dokumen ini).
* Otomatis API: Newman (collection bawaan `shiftbase`, register/login/me,
  employees, shifts+409, attendance, reports) — laporan di `reports/`.
* Otomatis UI: Playwright (login 3 peran, shift CRUD, check-in/out, roster) + screenshot.
* Laporan: `Shiftbase-QA-Report.xlsx` via `tools/build_report.py`.

## 3. Environment

* MySQL 8.4 docker `:13306` (DB `shiftbase_qa` fresh migrate + seed),
  API `:18092`, web `:5198`.
* Akun seed: `admin@shiftbase.local / Admin123!`,
  `manager@shiftbase.local / Manager123!`, `staff@shiftbase.local / Staff123!`.
* Browser: Chromium headless.

## 4. Kriteria

* Masuk: `/healthz` 200, login 3 peran sukses.
* Keluar: semua TC tereksekusi, tak ada bug Critical/High terbuka,
  Newman 100%, e2e hijau.

## 5. Risiko

* Attendance memakai jam bisnis Asia/Jakarta (fixed UTC+7): run di luar
  zona itu tetap konsisten (by design) — lampirkan tanggal run.
* Staff tanpa employee link (register baru) → attendance kosong (by design).
