import { test, expect } from '@playwright/test';

test.describe('Session Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Логин как DM
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'dm@test.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button:has-text("Войти")');
    await page.waitForURL('/');
  });

  test('should create new game session', async ({ page }) => {
    await page.goto('/dm-dashboard');

    // Создание сессии
    await page.click('button:has-text("Создать сессию")');
    await page.fill('input[name="sessionName"]', 'Epic Campaign');
    await page.fill('textarea[name="description"]', 'An epic adventure awaits');
    await page.fill('input[name="maxPlayers"]', '6');
    await page.click('button:has-text("Создать")');

    // Проверка создания
    await expect(page.locator('text=Epic Campaign')).toBeVisible();
    await expect(page.locator('text=An epic adventure awaits')).toBeVisible();

    // Проверка генерации кода сессии
    const sessionCode = await page.locator('[data-session-code]').textContent();
    expect(sessionCode).toMatch(/[A-Z0-9]{6}/);
  });

  test('should edit session settings', async ({ page }) => {
    await page.goto('/dm-dashboard');

    // Открытие существующей сессии
    await page.click('text=Epic Campaign');
    
    // Настройки
    await page.click('button:has-text("Настройки")');
    
    // Изменение настроек
    await page.click('input[name="fogOfWar"]');
    await page.click('input[name="gridEnabled"]');
    await page.fill('input[name="gridSize"]', '50');
    await page.click('button:has-text("Сохранить")');

    // Проверка сохранения
    await expect(page.locator('text=/настройки сохранены/i')).toBeVisible();
  });

  test('should allow players to join session', async ({ page, context }) => {
    // DM создает сессию
    await page.goto('/dm-dashboard');
    await page.click('button:has-text("Создать сессию")');
    await page.fill('input[name="sessionName"]', 'Player Test Session');
    await page.click('button:has-text("Создать")');
    
    const sessionCode = await page.locator('[data-session-code]').textContent();

    // Открываем новую вкладку как игрок
    const playerPage = await context.newPage();
    await playerPage.goto('/');
    
    // Присоединение к сессии
    await playerPage.click('button:has-text("Присоединиться к игре")');
    await playerPage.fill('input[name="sessionCode"]', sessionCode || '');
    await playerPage.fill('input[name="playerName"]', 'Test Player');
    await playerPage.click('button:has-text("Присоединиться")');

    // Проверка успешного присоединения
    await expect(playerPage.locator('text=Player Test Session')).toBeVisible();
    
    // DM должен увидеть игрока
    await page.reload();
    await expect(page.locator('text=Test Player')).toBeVisible();
  });

  test('should handle session disconnect and reconnect', async ({ page }) => {
    await page.goto('/dm-session/test-session-id');

    // Симуляция отключения
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);

    // Проверка индикатора отключения
    await expect(page.locator('text=/отключен/i')).toBeVisible();

    // Восстановление соединения
    await page.context().setOffline(false);
    await page.waitForTimeout(3000);

    // Проверка восстановления
    await expect(page.locator('text=/подключен/i')).toBeVisible();
  });

  test('should end session properly', async ({ page }) => {
    await page.goto('/dm-dashboard');
    await page.click('text=Test Session');

    // Завершение сессии
    await page.click('button:has-text("Завершить сессию")');
    await page.click('button:has-text("Подтвердить")');

    // Проверка завершения
    await expect(page).toHaveURL('/dm-dashboard');
    await expect(page.locator('text=/сессия завершена/i')).toBeVisible();
  });

  test('should archive old sessions', async ({ page }) => {
    await page.goto('/dm-dashboard');

    // Переход в архив
    await page.click('text=Архив');

    // Проверка отображения завершенных сессий
    await expect(page.locator('[data-archived-session]')).toHaveCount(1, { timeout: 5000 });

    // Восстановление сессии
    await page.click('button:has-text("Восстановить")');
    
    // Проверка восстановления
    await page.click('text=Активные');
    await expect(page.locator('text=Test Session')).toBeVisible();
  });

  test('should export session data', async ({ page }) => {
    await page.goto('/dm-session/test-session-id');

    // Экспорт данных
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Экспорт")');
    const download = await downloadPromise;

    // Проверка загрузки файла
    expect(download.suggestedFilename()).toMatch(/session.*\.json/);
  });
});
