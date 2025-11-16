# Visual Regression Testing с Chromatic

Этот проект использует Storybook + Chromatic для автоматического обнаружения непреднамеренных изменений UI.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск Storybook локально

```bash
npm run storybook
```

Откроется на http://localhost:6006

### 3. Настройка Chromatic

1. Зарегистрируйтесь на https://www.chromatic.com/
2. Создайте новый проект и привяжите к вашему GitHub репозиторию
3. Получите Project Token
4. Добавьте секрет в GitHub:
   - Перейдите в Settings → Secrets and variables → Actions
   - Создайте новый secret `CHROMATIC_PROJECT_TOKEN`
   - Вставьте токен из Chromatic

### 4. Первый запуск

```bash
# Установите Chromatic CLI
npm install -g chromatic

# Запустите первый снимок
npx chromatic --project-token=<your-token>
```

## 📸 Как работает

1. **Автоматические снимки**: При каждом push или PR GitHub Actions:
   - Собирает Storybook
   - Отправляет на Chromatic
   - Делает снимки всех stories
   - Сравнивает с базовой версией

2. **Обнаружение изменений**:
   - ✅ Если изменений нет → тест проходит
   - 🟡 Если есть изменения → требуется review
   - ❌ Блокирует PR пока не одобрите или исправите

3. **Review изменений**:
   - Откройте ссылку из комментария к PR
   - Посмотрите side-by-side сравнение
   - Одобрите (Accept) или отклоните (Deny)

## 📝 Создание Stories

### Пример простого компонента

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Hello',
  },
};

export const WithIcon: Story = {
  args: {
    text: 'Hello',
    icon: '🎲',
  },
};
```

### Пример с взаимодействиями

```tsx
import { within, userEvent } from '@storybook/test';

export const WithInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
  },
};
```

## 🎯 Best Practices

### 1. Тестируйте критические компоненты

Создайте stories для:
- ✅ UI компонентов (Button, Input, Card)
- ✅ Error boundaries
- ✅ Layout компонентов
- ✅ Форм и валидации
- ✅ Модальных окон
- ✅ Навигации

### 2. Покрывайте разные состояния

```tsx
export const Loading: Story = {
  args: { isLoading: true },
};

export const Error: Story = {
  args: { error: 'Something went wrong' },
};

export const Empty: Story = {
  args: { data: [] },
};

export const WithData: Story = {
  args: { data: mockData },
};
```

### 3. Тестируйте темы

```tsx
export const LightTheme: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
};

export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
```

### 4. Responsive тесты

```tsx
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};
```

## 🔧 Конфигурация

### Chromatic настройки (chromatic.config.json)

- `exitZeroOnChanges: false` - Блокировать PR при изменениях
- `autoAcceptChanges: "main"` - Автоматически принимать на main
- `onlyChanged: true` - Тестировать только измененные stories
- `zip: true` - Сжимать для быстрой загрузки

### Игнорирование изменений

Если нужно игнорировать определенные элементы:

```tsx
export const WithDynamicContent: Story = {
  parameters: {
    chromatic: {
      // Игнорировать весь snapshot
      disable: true,
      
      // Или задержка перед снимком
      delay: 300,
      
      // Или увеличить порог различий
      diffThreshold: 0.3,
    },
  },
};
```

## 📊 Мониторинг

### В GitHub Actions

Каждый PR получит комментарий с:
- Ссылкой на Chromatic build
- Количеством обнаруженных изменений
- Статусом проверки

### В Chromatic UI

- Dashboard со всеми builds
- История изменений
- Статистика покрытия компонентов
- Performance metrics

## 🚨 Troubleshooting

### Много false positives?

1. Используйте `chromatic.delay` для анимаций
2. Увеличьте `diffThreshold` для динамического контента
3. Отключите `chromatic.disable` для проблемных stories

### Медленные тесты?

1. Используйте `onlyChanged: true`
2. Уменьшите количество viewport вариантов
3. Группируйте похожие stories

### Не блокируются PR?

Проверьте:
1. `exitZeroOnChanges: false` в конфиге
2. Branch protection rules в GitHub
3. Required checks включают "Visual Regression Tests"

## 🔗 Полезные ссылки

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Documentation](https://storybook.js.org/docs/react/)
- [Visual Testing Best Practices](https://www.chromatic.com/docs/test)
- [GitHub Integration Guide](https://www.chromatic.com/docs/github-actions)
