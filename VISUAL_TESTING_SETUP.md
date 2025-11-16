# 📸 Настройка Visual Regression Testing

## ✅ Что уже сделано

1. ✅ Установлены все зависимости (Storybook + Chromatic)
2. ✅ Создана конфигурация Storybook (`.storybook/`)
3. ✅ Созданы примеры Stories для критических компонентов
4. ✅ Настроен GitHub Actions workflow
5. ✅ Создан chromatic.config.json

## 🚀 Что нужно сделать

### Шаг 1: Добавить скрипты в package.json

Добавьте следующие скрипты в секцию `"scripts"`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "chromatic": "chromatic --exit-zero-on-changes"
  }
}
```

### Шаг 2: Зарегистрироваться в Chromatic

1. Перейдите на https://www.chromatic.com/
2. Войдите через GitHub
3. Нажмите "Add project"
4. Выберите ваш репозиторий
5. Скопируйте Project Token

### Шаг 3: Добавить секрет в GitHub

1. Откройте репозиторий на GitHub
2. Settings → Secrets and variables → Actions
3. Нажмите "New repository secret"
4. Name: `CHROMATIC_PROJECT_TOKEN`
5. Value: вставьте токен из Chromatic
6. Сохраните

### Шаг 4: Обновить chromatic.config.json

Замените в файле `chromatic.config.json`:

```json
{
  "projectId": "ВАШИ_PROJECT_ID_ИЗ_CHROMATIC",
  ...
}
```

### Шаг 5: Включить Branch Protection

1. GitHub → Settings → Branches
2. Add rule для `main` или `master`
3. Включите:
   - ✅ Require status checks to pass
   - ✅ Выберите "Visual Regression Tests (Chromatic)"
   - ✅ Require branches to be up to date

## 🧪 Тестирование

### Локально

```bash
# Запустить Storybook
npm run storybook

# Открыть в браузере
http://localhost:6006
```

### Первый снимок в Chromatic

```bash
# Запустить Chromatic локально
npm run chromatic

# Или через CLI
npx chromatic --project-token=<your-token>
```

### В CI/CD

Теперь при каждом PR:
1. GitHub Actions автоматически запустит Chromatic
2. Сделает снимки всех stories
3. Сравнит с базовой версией
4. Если есть изменения - заблокирует merge
5. Добавит комментарий с ссылкой на review

## 📝 Созданные Stories

Уже готовы stories для:

- ✅ `ErrorBoundary` - 4 варианта (default, error, custom fallback, retry)
- ✅ `Model3DErrorBoundary` - 4 варианта (default, error, enemy, custom color)
- ✅ `Button` - 12 вариантов (все варианты и размеры)

### Добавить больше stories

Создайте файл `ComponentName.stories.tsx` рядом с компонентом:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'Category/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // ваши props
  },
};
```

## 🎯 Рекомендации по покрытию

### Критические компоненты для добавления stories:

1. **Навигация**
   - Header/Navigation
   - Sidebar
   - Menu items

2. **Формы**
   - Input, Textarea, Select
   - FormField wrapper
   - Validation states

3. **Battle компоненты**
   - BattleMap
   - TokenCard
   - InitiativeTracker
   - DiceRoller

4. **Session компоненты**
   - SessionCard
   - PlayerList
   - ChatMessage

5. **Admin компоненты**
   - TestPanel
   - ReportAnalysis
   - Статистика

### Для каждого компонента создайте:

- ✅ Default state
- ✅ Loading state
- ✅ Error state
- ✅ Empty state
- ✅ With data
- ✅ Light/Dark theme
- ✅ Mobile/Desktop view

## 🔧 Настройка workflow

### Изменить чувствительность

В `chromatic.config.json`:

```json
{
  // Меньше = строже (0.0 - 1.0)
  "diffThreshold": 0.2,
  
  // Игнорировать определенные элементы
  "ignoreSelectors": [
    ".dynamic-timestamp",
    "[data-test-id='ignore-me']"
  ]
}
```

### Ускорить проверки

```json
{
  // Только измененные stories
  "onlyChanged": true,
  
  // TurboSnap - только затронутые компоненты
  "turboSnap": true
}
```

## 📊 Мониторинг

### Dashboard Chromatic

После настройки доступно:

- 📈 История всех builds
- 🎨 Визуальные изменения
- ⚡ Performance metrics
- 📊 Coverage статистика
- 👥 Team activity

### GitHub PR Checks

В каждом PR:
- ✅ Зеленый check - нет изменений
- 🟡 Pending - требуется review в Chromatic
- ❌ Красный - критические изменения или ошибки

## 🚨 Troubleshooting

### "No Chromatic token found"

Проверьте:
1. Секрет добавлен в GitHub
2. Название точно `CHROMATIC_PROJECT_TOKEN`
3. Workflow имеет доступ к secrets

### Медленные билды

```json
{
  "zip": true,           // Сжатие файлов
  "onlyChanged": true,   // Только изменения
  "externals": ["public/**"]  // Игнорить статику
}
```

### Много false positives

Используйте в stories:

```tsx
export const Story: Story = {
  parameters: {
    chromatic: {
      // Задержка для анимаций
      delay: 300,
      
      // Или полностью отключить
      disable: true,
      
      // Или увеличить порог
      diffThreshold: 0.5,
    },
  },
};
```

## 🎓 Дополнительно

### Интеграция с другими инструментами

- **Percy**: Альтернатива Chromatic
- **Applitools**: AI-powered visual testing
- **BackstopJS**: Open source решение
- **Playwright**: E2E + visual testing

### Best Practices

1. ✅ Создавайте stories для всех UI компонентов
2. ✅ Тестируйте все состояния (loading, error, empty)
3. ✅ Покрывайте разные темы и viewports
4. ✅ Review изменения перед merge
5. ✅ Автоматически принимайте на main branch
6. ✅ Используйте semantic commit messages
7. ✅ Документируйте компоненты через stories

## 📚 Ресурсы

- [Chromatic Docs](https://www.chromatic.com/docs/)
- [Storybook Docs](https://storybook.js.org/docs/react/)
- [Visual Testing Guide](https://storybook.js.org/tutorials/visual-testing-handbook/)
- [GitHub Actions Integration](https://www.chromatic.com/docs/github-actions)

## ✅ Checklist

- [ ] Добавлены скрипты в package.json
- [ ] Зарегистрирован аккаунт в Chromatic
- [ ] Добавлен CHROMATIC_PROJECT_TOKEN в GitHub
- [ ] Обновлен chromatic.config.json с projectId
- [ ] Включен branch protection
- [ ] Запущен первый build
- [ ] Созданы stories для критических компонентов
- [ ] Настроен автоматический review workflow

---

**Готово!** Теперь каждый PR будет автоматически проверяться на визуальные изменения 🎉
