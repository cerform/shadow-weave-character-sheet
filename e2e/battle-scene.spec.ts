import { test, expect } from '@playwright/test';

test.describe('Battle Scene Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Логин как DM
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'dm@test.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button:has-text("Войти")');
    await page.waitForURL('/');
  });

  test('should create and start battle session', async ({ page }) => {
    // Переход на страницу DM
    await page.goto('/dm-dashboard');
    
    // Создание новой сессии
    await page.click('button:has-text("Создать сессию")');
    await page.fill('input[name="sessionName"]', 'Test Battle Session');
    await page.fill('textarea[name="description"]', 'E2E Test Battle');
    await page.click('button:has-text("Создать")');

    // Проверка создания сессии
    await expect(page.locator('text=Test Battle Session')).toBeVisible();

    // Открытие сессии
    await page.click('text=Test Battle Session');
    await expect(page).toHaveURL(/\/dm-session\/.+/);

    // Загрузка боевой карты
    await page.click('button:has-text("Загрузить карту")');
    await page.setInputFiles('input[type="file"]', {
      name: 'test-map.png',
      mimeType: 'image/png',
      buffer: Buffer.from('test image data')
    });

    // Проверка загрузки карты
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
  });

  test('should add tokens to battle map', async ({ page }) => {
    await page.goto('/unified-battle');

    // Добавление токена игрока
    await page.click('button:has-text("Добавить токен")');
    await page.fill('input[name="tokenName"]', 'Test Hero');
    await page.fill('input[name="hp"]', '50');
    await page.fill('input[name="ac"]', '16');
    await page.click('button:has-text("Создать")');

    // Проверка появления токена
    await expect(page.locator('text=Test Hero')).toBeVisible();

    // Перемещение токена
    const token = page.locator('[data-token="Test Hero"]');
    await token.dragTo(page.locator('canvas'), {
      targetPosition: { x: 200, y: 200 }
    });

    // Проверка изменения позиции
    await expect(token).toHaveAttribute('data-x', /200/);
  });

  test('should manage initiative tracker', async ({ page }) => {
    await page.goto('/unified-battle');

    // Открытие инициативы
    await page.click('button:has-text("Инициатива")');

    // Добавление участников
    await page.click('button:has-text("Добавить в инициативу")');
    await page.fill('input[name="characterName"]', 'Fighter');
    await page.fill('input[name="initiative"]', '18');
    await page.click('button:has-text("Добавить")');

    await page.click('button:has-text("Добавить в инициативу")');
    await page.fill('input[name="characterName"]', 'Goblin');
    await page.fill('input[name="initiative"]', '12');
    await page.click('button:has-text("Добавить")');

    // Проверка порядка инициативы
    const initiatives = await page.locator('[data-initiative-list] > div').allTextContents();
    expect(initiatives[0]).toContain('Fighter');
    expect(initiatives[1]).toContain('Goblin');

    // Начало боя
    await page.click('button:has-text("Начать бой")');
    await expect(page.locator('text=/Раунд 1/i')).toBeVisible();

    // Следующий ход
    await page.click('button:has-text("Следующий ход")');
    await expect(page.locator('[data-current-turn]')).toContainText('Goblin');
  });

  test('should handle dice rolls in combat', async ({ page }) => {
    await page.goto('/unified-battle');

    // Открытие окна броска кубиков
    await page.click('button[aria-label="Бросить кубик"]');

    // Выбор d20
    await page.click('button:has-text("d20")');
    
    // Бросок
    await page.click('button:has-text("Бросить")');

    // Проверка результата
    await expect(page.locator('[data-dice-result]')).toBeVisible();
    const result = await page.locator('[data-dice-result]').textContent();
    expect(parseInt(result || '0')).toBeGreaterThanOrEqual(1);
    expect(parseInt(result || '0')).toBeLessThanOrEqual(20);
  });

  test('should update token HP', async ({ page }) => {
    await page.goto('/unified-battle');

    // Создание токена
    await page.click('button:has-text("Добавить токен")');
    await page.fill('input[name="tokenName"]', 'Test Monster');
    await page.fill('input[name="hp"]', '30');
    await page.click('button:has-text("Создать")');

    // Клик по токену для редактирования
    await page.click('text=Test Monster');
    
    // Нанесение урона
    await page.click('button:has-text("Урон")');
    await page.fill('input[name="damage"]', '10');
    await page.click('button:has-text("Применить")');

    // Проверка обновления HP
    await expect(page.locator('text=/20.*30/i')).toBeVisible();
  });
});
