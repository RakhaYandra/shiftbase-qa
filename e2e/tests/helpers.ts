import type { Page } from '@playwright/test';

function pass(role: string): string {
  const p = process.env[`SB_PASS_${role.toUpperCase()}`];
  if (!p) throw new Error(`SB_PASS_${role.toUpperCase()} belum di-set (lihat e2e/.env.example)`);
  return p;
}

export const sbPass = pass;

export async function login(page: Page, role: 'admin' | 'manager' | 'staff' = 'admin') {
  await page.goto('/');
  await page.getByLabel('Email').fill(`${role}@shiftbase.local`);
  await page.getByLabel('Kata sandi').fill(pass(role));
  await page.getByRole('button', { name: 'Masuk' }).click();
}

export const API = {
  admin: { email: 'admin@shiftbase.local', password: () => pass('admin') },
};
