import { test, expect } from '@playwright/test';
import { login, sbPass } from './helpers';

test('TC-WEB-01 nav per peran', async ({ page }) => {
  await login(page, 'admin');
  await expect(page.getByRole('button', { name: 'Laporan' })).toBeVisible();
  await page.getByRole('button', { name: 'Keluar' }).click();
  await login(page, 'staff');
  await expect(page.getByRole('button', { name: 'Jadwal' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Laporan' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Shift' })).toHaveCount(0);
});

test('TC-WEB-02 roster tampil', async ({ page }) => {
  await login(page, 'manager');
  await page.getByRole('button', { name: 'Jadwal' }).click();
  await page.locator('input[type="date"]').first().fill('2030-02-01');
  await expect(page.getByText('Budi Santoso').first()).toBeVisible();
});

test('TC-WEB-03 tambah shift bentrok ramah', async ({ page, request }) => {
  const lr = await request.post('http://localhost:18092/v1/auth/login', {
    data: { email: 'admin@shiftbase.local', password: sbPass('admin') },
  });
  const tok = (await lr.json()).token;
  const auth = { Authorization: `Bearer ${tok}` };
  const cr = await request.post('http://localhost:18092/v1/shifts', {
    headers: auth,
    data: { employee_id: 1, date: '2030-02-01', start_time: '08:00', end_time: '12:00' },
  });
  const sid = (await cr.json()).id;
  await login(page, 'manager');
  await page.getByRole('button', { name: 'Shift' }).click();
  await page.getByRole('button', { name: 'Tambah shift' }).click();
  await page.locator('select').first().selectOption('1');
  await page.locator('input[type="date"]').last().fill('2030-02-01');
  const times = page.locator('input[type="time"]');
  await times.nth(0).fill('10:00');
  await times.nth(1).fill('14:00');
  await page.getByRole('button', { name: 'Simpan' }).click();
  await expect(page.getByText(/tabrakan/i).first()).toBeVisible();
  await request.delete(`http://localhost:18092/v1/shifts/${sid}`, { headers: auth });
});
