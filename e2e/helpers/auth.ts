import { Page } from '@playwright/test';

export async function loginAsDM(page: Page) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'dm@test.com');
  await page.fill('input[type="password"]', 'testpassword');
  await page.click('button:has-text("Войти")');
  await page.waitForURL('/');
}

export async function loginAsPlayer(page: Page) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'player@test.com');
  await page.fill('input[type="password"]', 'testpassword');
  await page.click('button:has-text("Войти")');
  await page.waitForURL('/');
}

export async function logout(page: Page) {
  await page.click('[aria-label="User menu"]');
  await page.click('text=Выйти');
  await page.waitForURL('/auth');
}
