import { test, expect } from '@playwright/test';
import { login, sbPass } from './helpers';
import * as fs from 'node:fs';

test('TC-WEB-04 check-in lalu check-out', async ({ page, request }) => {
  const stamp = Date.now();
  const lr = await request.post('http://localhost:18092/v1/auth/login', {
    data: { email: 'admin@shiftbase.local', password: sbPass('admin') },
  });
  const tok = (await lr.json()).token;
  const auth = { Authorization: `Bearer ${tok}` };
  const cr = await request.post('http://localhost:18092/v1/employees', {
    headers: auth,
    data: { name: `QA Punch${stamp}`, email: `qa-punch-${stamp}@example.com`, hire_date: '2025-01-01' },
  });
  const eid = (await cr.json()).id;
  await login(page, 'admin');
  await page.getByRole('button', { name: 'Absensi' }).click();
  await page.locator('select').first().selectOption(String(eid));
  await page.getByRole('button', { name: 'Catat masuk' }).click();
  await expect(page.getByText('Masuk tercatat.')).toBeVisible();
  await page.getByRole('button', { name: 'Catat keluar' }).click();
  await expect(page.getByText(/Keluar tercatat/).first()).toBeVisible();
  await request.delete(`http://localhost:18092/v1/employees/${eid}`, { headers: auth });
});

test('TC-WEB-05 import CSV via UI', async ({ page }) => {
  await login(page, 'manager');
  await page.getByRole('button', { name: 'Absensi' }).click();
  const stamp = Date.now();
  const csv = `name,email,phone,position,hire_date\nQA Web${stamp},qa-web-${stamp}@example.com,0812,kasir,2025-04-01\n`;
  fs.writeFileSync('/tmp/qa-web-import.csv', csv);
  await page.locator('input[type="file"]').setInputFiles('/tmp/qa-web-import.csv');
  await page.getByRole('button', { name: 'Impor' }).click();
  await expect(page.getByText(/gagal 0/).first()).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Absensi' }).click();
  await expect(page.locator('select option', { hasText: `QA Web${stamp}` })).toHaveCount(1);
});

test('TC-WEB-06 laporan tampil', async ({ page, request }) => {
  const lr = await request.post('http://localhost:18092/v1/auth/login', {
    data: { email: 'manager@shiftbase.local', password: sbPass('manager') },
  });
  const tok = (await lr.json()).token;
  await login(page, 'manager');
  await page.getByRole('button', { name: 'Laporan' }).click();
  const dates = page.locator('input[type="date"]');
  await dates.nth(0).fill('2030-01-01');
  await dates.nth(1).fill('2030-12-31');
  await expect(page.locator('main')).toContainText(/lembur|Belum ada data lembur/i);
  void tok;
});
