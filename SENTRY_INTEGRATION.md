# 🔒 Sentry Integration Complete

## ✅ Что готово

1. ✅ **Source Maps** - автоматическая загрузка при production build
2. ✅ **Session Replay** - запись действий пользователя при ошибках
3. ✅ **Breadcrumbs** - трекинг всех действий (клики, навигация, API)
4. ✅ **Error Grouping** - группировка по severity и типу
5. ✅ **GitHub Actions** - автоматический деплой и загрузка source maps
6. ✅ **Performance Tracking** - мониторинг производительности

## 🚀 Быстрый старт

### 1. Настроить Sentry

```bash
# 1. Создайте проект на https://sentry.io
# 2. Получите DSN, Auth Token, Org/Project slugs
# 3. Добавьте в GitHub Secrets:

VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_...
```

### 2. Настроить Slack уведомления

1. Settings → Integrations → Slack → Install
2. Создайте Alert Rules для критических ошибок
3. Выберите канал для уведомлений

### 3. Деплой

```bash
# Production build автоматически загрузит source maps
npm run build

# Или через GitHub Actions (автоматически при push на main)
```

## 📖 Использование

### Автоматический трекинг навигации

```tsx
import { useSentryBreadcrumbs } from '@/hooks/useSentryBreadcrumbs';

function App() {
  useSentryBreadcrumbs(); // Автоматически трекает все переходы
  return <Router>...</Router>;
}
```

### Трекинг действий пользователя

```tsx
import { useSentryUserActions } from '@/hooks/useSentryBreadcrumbs';

function Component() {
  const { trackClick, trackFormSubmit } = useSentryUserActions();
  
  return (
    <button onClick={() => trackClick('Button', { page: 'home' })}>
      Click me
    </button>
  );
}
```

### Трекинг игровых событий

```tsx
import { SentryBreadcrumbsService } from '@/services/SentryBreadcrumbsService';

// Боевые действия
SentryBreadcrumbsService.trackBattleAction('Attack', {
  attacker: 'Player 1',
  target: 'Goblin',
  damage: 15,
});

// Действия с персонажем
SentryBreadcrumbsService.trackCharacterAction('Level Up', characterId, {
  newLevel: 5,
});
```

### Установка контекста пользователя

```tsx
import { SentryService } from '@/services/SentryService';

// После входа
SentryService.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});
```

## 📊 Что будет в Sentry

### При каждой ошибке вы увидите:

- ✅ Полный stack trace с оригинальным кодом (не минифицированный)
- ✅ Видео-запись последних 30 секунд перед ошибкой
- ✅ Все действия пользователя (breadcrumbs)
- ✅ API запросы и ответы
- ✅ Информация о пользователе
- ✅ Информация о браузере и устройстве
- ✅ URL и параметры
- ✅ Версия приложения

## 🔔 Slack уведомления

Рекомендуемая структура каналов:

```
#errors-critical      - Level: error, fatal
#errors-new          - Новые типы ошибок
#errors-high-freq    - > 10 раз за 5 минут
#errors-regression   - Вернувшиеся ошибки
```

## 📚 Подробная документация

См. [SENTRY_SETUP.md](./SENTRY_SETUP.md) для:
- Пошаговой настройки
- Настройки Slack
- Кастомизации Dashboard
- Troubleshooting
- Best Practices

## ✅ Checklist

После настройки проверьте:

- [ ] DSN добавлен в GitHub Secrets
- [ ] Production build генерирует source maps
- [ ] GitHub Actions успешно завершается
- [ ] Тестовая ошибка попадает в Sentry
- [ ] Source maps работают (stack trace читаем)
- [ ] Session Replay записывается
- [ ] Slack уведомления приходят
- [ ] Breadcrumbs показывают действия пользователя

---

**Готово!** Все production ошибки теперь трекаются автоматически 🎉
