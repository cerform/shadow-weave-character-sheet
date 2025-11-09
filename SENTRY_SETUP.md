# Настройка Sentry для мониторинга ошибок

## 1. Создание проекта в Sentry

1. Зарегистрируйтесь на [sentry.io](https://sentry.io/)
2. Создайте новый проект, выберите **React**
3. Скопируйте **DSN** (Data Source Name) - выглядит как: `https://xxxxx@o000000.ingest.sentry.io/0000000`

## 2. Добавление DSN в переменные окружения

### Для Lovable Cloud (рекомендуется):

Поскольку проект использует Supabase, добавьте секрет через Lovable:

1. В чате Lovable напишите: "Добавь секрет VITE_SENTRY_DSN"
2. Введите ваш Sentry DSN в появившуюся форму

### Альтернативно (локальная разработка):

Создайте файл `.env.local` в корне проекта:

```env
VITE_SENTRY_DSN=https://xxxxx@o000000.ingest.sentry.io/0000000
```

⚠️ **Не добавляйте `.env.local` в git!**

## 3. Проверка интеграции

После настройки DSN:

1. Перезапустите приложение
2. В консоли должно появиться: `✅ Sentry инициализирован`
3. Вызовите тестовую ошибку для проверки:

```javascript
throw new Error('Test Sentry Error');
```

4. Проверьте дашборд Sentry - ошибка должна появиться в течение минуты

## 4. Возможности интеграции

### Автоматическая отправка:

- ✅ Все необработанные ошибки
- ✅ Unhandled Promise Rejections
- ✅ Ошибки в ErrorBoundary
- ✅ Контекст пользователя (email, ID)

### Session Replay:

Sentry автоматически записывает сессии с ошибками для воспроизведения проблемы.

### Performance Monitoring:

Отслеживание производительности включено (10% сессий в production, 100% в dev).

## 5. Ручная отправка ошибок

```typescript
import { SentryService } from '@/services/SentryService';

// Отправка ошибки
try {
  // код
} catch (error) {
  SentryService.captureError(error as Error, {
    level: 'error',
    tags: { feature: 'character-creation' },
    extra: { userId: user.id },
  });
}

// Отправка сообщения
SentryService.captureMessage('Важное событие', 'info', {
  tags: { action: 'export' },
});

// Добавление breadcrumb (хлебных крошек)
SentryService.addBreadcrumb({
  message: 'Пользователь открыл модальное окно',
  level: 'info',
  category: 'ui',
});
```

## 6. Фильтрация ошибок

В `SentryService.ts` уже настроено игнорирование:

- `ResizeObserver loop limit exceeded` - безвредная ошибка браузера
- `Non-Error promise rejection captured` - не критичная ошибка

Добавьте свои паттерны в `ignoreErrors` по мере необходимости.

## 7. Среды (Environments)

Sentry автоматически определяет окружение:

- `development` - локальная разработка
- `production` - продакшн

## 8. Отключение Sentry

Если не хотите использовать Sentry:

1. Удалите или не устанавливайте `VITE_SENTRY_DSN`
2. В консоли появится: `⚠️ VITE_SENTRY_DSN не настроен. Sentry не будет активирован.`
3. Ошибки продолжат логироваться в Supabase (`error_logs` таблица)

## 9. Дополнительная настройка

См. [официальную документацию Sentry](https://docs.sentry.io/platforms/javascript/guides/react/) для:

- Source maps (для деминификации production кода)
- Alerts и уведомления
- Интеграции с Slack/Discord
- Custom dashboards
