import { test, expect } from '@playwright/test';
import { login } from './helpers';
import * as fs from 'node:fs';

test('BUG-SB-001 dropdown refresh setelah import', async ({ page }) => {
  await login(page, 'manager');
  await page.getByRole('button', { name: 'Absensi' }).click();
  const stamp = Date.now();
  const csv = `name,email,phone,position,hire_date\nBug Refresh${stamp},bug-refresh-${stamp}@example.com,0812,kasir,2025-04-01\n`;
  fs.writeFileSync('/tmp/sb-bug1.csv', csv);
  await page.locator('input[type="file"]').setInputFiles('/tmp/sb-bug1.csv');
  await page.getByRole('button', { name: 'Impor' }).click();
  await expect(page.getByText(/gagal 0/).first()).toBeVisible();
  await expect(page.locator('select option', { hasText: `Bug Refresh${stamp}` })).toHaveCount(1);
});

test('BUG-SB-002 tab persist setelah reload', async ({ page }) => {
  await login(page, 'manager');
  await page.getByRole('button', { name: 'Absensi' }).click();
  await expect(page.getByRole('button', { name: 'Catat masuk' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Catat masuk' })).toBeVisible();
});
