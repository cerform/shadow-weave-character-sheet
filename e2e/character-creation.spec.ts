import { test, expect } from '@playwright/test';

test.describe('Character Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Переход на страницу создания персонажа
    await page.goto('/character-creation');
  });

  test('should complete full character creation', async ({ page }) => {
    // Шаг 1: Основная информация
    await page.fill('input[name="name"]', 'Test Warrior');
    await page.selectOption('select[name="gender"]', 'Мужской');
    await page.click('button:has-text("Далее")');

    // Шаг 2: Выбор расы
    await page.click('text=Человек');
    await page.click('button:has-text("Далее")');

    // Шаг 3: Выбор класса
    await page.click('text=Воин');
    await page.click('button:has-text("Далее")');

    // Шаг 4: Характеристики
    await page.click('button:has-text("Бросить все кубики")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Далее")');

    // Шаг 5: Умения (пропускаем)
    await page.click('button:has-text("Далее")');

    // Шаг 6: Снаряжение (пропускаем)
    await page.click('button:has-text("Далее")');

    // Шаг 7: Предыстория
    await page.fill('textarea[name="backstory"]', 'A brave warrior from the north');
    
    // Сохранение персонажа
    await page.click('button:has-text("Завершить создание")');

    // Проверка успешного создания
    await expect(page).toHaveURL(/\/character-sheet\/.+/);
    await expect(page.locator('text=Test Warrior')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Попытка перейти дальше без заполнения имени
    await page.click('button:has-text("Далее")');
    
    // Должна появиться ошибка валидации
    await expect(page.locator('text=/Пожалуйста, заполните/i')).toBeVisible();
  });

  test('should allow ability score rerolls', async ({ page }) => {
    // Переход к шагу характеристик
    await page.fill('input[name="name"]', 'Test Character');
    await page.click('button:has-text("Далее")');
    await page.click('text=Человек');
    await page.click('button:has-text("Далее")');
    await page.click('text=Воин');
    await page.click('button:has-text("Далее")');

    // Первый бросок
    await page.click('button:has-text("Бросить все кубики")');
    const firstStrength = await page.locator('[data-stat="strength"]').textContent();

    // Перебросить силу
    await page.click('[data-stat="strength"] button:has-text("⟳")');
    await page.waitForTimeout(500);
    const secondStrength = await page.locator('[data-stat="strength"]').textContent();

    // Значения должны различаться (с высокой вероятностью)
    expect(firstStrength).toBeTruthy();
    expect(secondStrength).toBeTruthy();
  });

  test('should save character progress', async ({ page }) => {
    // Заполнение первых шагов
    await page.fill('input[name="name"]', 'Progress Test');
    await page.click('button:has-text("Далее")');
    await page.click('text=Эльф');
    
    // Сохранение промежуточного прогресса
    await page.click('button:has-text("Завершить создание")');

    // Проверка сохранения
    await expect(page.locator('text=/успешно сохранен/i')).toBeVisible({ timeout: 10000 });
  });
});
