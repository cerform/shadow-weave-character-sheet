# 🚀 Быстрая настройка проверки Circular Dependencies

## ✅ Что уже готово

1. ✅ Madge установлен
2. ✅ Скрипт проверки создан (`scripts/check-circular-deps.js`)
3. ✅ GitHub Actions workflow настроен
4. ✅ Конфигурация madge создана (`.madgerc`)
5. ✅ Pre-commit хук подготовлен

## 🔧 Что нужно сделать (5 минут)

### Шаг 1: Добавить скрипты в package.json

Откройте `package.json` и добавьте в секцию `"scripts"`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    
    // ⬇️ ДОБАВЬТЕ ЭТИ СТРОКИ:
    "check:circular": "node scripts/check-circular-deps.js",
    "check:circular:image": "madge --image circular-deps-graph.svg --extensions ts,tsx,js,jsx src/",
    "type-check": "tsc --noEmit",
    "prepare": "husky install"
  }
}
```

### Шаг 2: Установить husky хуки

```bash
npm run prepare
```

### Шаг 3: Создать pre-commit хук

```bash
# Создать файл (если еще не существует)
npx husky add .husky/pre-commit "node scripts/check-circular-deps.js"

# Или скопировать готовый:
cp .husky/pre-commit.example .husky/pre-commit
chmod +x .husky/pre-commit
```

### Шаг 4: Протестировать

```bash
# Проверить циклические зависимости
npm run check:circular

# Сделать тестовый коммит
git add .
git commit -m "test: check circular deps hook"
```

Должны запуститься автоматические проверки!

## 📊 Использование

### Ручная проверка

```bash
# Простая проверка
npm run check:circular

# С визуализацией (требует graphviz)
npm run check:circular:image
```

### Автоматическая проверка

1. **При каждом коммите** - pre-commit хук
2. **При каждом PR** - GitHub Actions
3. **При push на main** - CI/CD

## 🎯 Что проверяется

### В pre-commit хуке:

1. ✅ Стиль кода (ESLint + Prettier)
2. ✅ Циклические зависимости
3. ✅ TypeScript типы

### В CI/CD:

1. ✅ Все то же самое
2. ✅ Генерация отчёта
3. ✅ Комментарий в PR при ошибках
4. ✅ Блокировка merge при наличии циклов

## 🔴 Если нашлись циклические зависимости

Тест покажет:

```
❌ Found 2 circular dependencies!

🔴 Cycle #1 (critical, 4 files):
  src/stores/battleStore.ts
  ↓ 
  src/stores/characterStore.ts
  ↓ 
  src/hooks/useBattle.ts
  ↓ 
  src/stores/battleStore.ts (cycle completes)
```

### Как исправить:

См. подробный гайд в [CIRCULAR_DEPS_GUIDE.md](./CIRCULAR_DEPS_GUIDE.md)

Основные паттерны:
1. Извлечь общий код в отдельный файл
2. Использовать dependency injection
3. Вынести типы отдельно
4. Реструктурировать иерархию

## 🛠️ Опциональная настройка

### Установить graphviz для визуализации

```bash
# macOS
brew install graphviz

# Ubuntu/Debian
sudo apt-get install graphviz

# Windows (через Chocolatey)
choco install graphviz
```

После этого доступна команда:
```bash
npm run check:circular:image
open circular-deps-graph.svg
```

### Настроить lint-staged

Создайте `.lintstagedrc.json`:

```json
{
  "*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
```

## 🚨 Troubleshooting

### Pre-commit хук не работает

```bash
# Переустановить хуки
rm -rf .husky
npm run prepare
npx husky add .husky/pre-commit "node scripts/check-circular-deps.js"
```

### Ошибка "husky command not found"

```bash
# Установить husky
npm install --save-dev husky
npm run prepare
```

### Хочу пропустить проверку (не рекомендуется!)

```bash
# Пропустить pre-commit
git commit --no-verify

# Но лучше исправить проблему!
```

### CI блокирует PR

1. Запустите локально: `npm run check:circular`
2. Исправьте циклы
3. Проверьте снова: `npm run check:circular`
4. Commit & Push

## ✅ Checklist настройки

- [ ] Добавлены скрипты в package.json
- [ ] Запущен `npm run prepare`
- [ ] Создан `.husky/pre-commit`
- [ ] Протестирован `npm run check:circular`
- [ ] Сделан тестовый коммит - хук сработал
- [ ] Опционально: установлен graphviz
- [ ] Прочитан [CIRCULAR_DEPS_GUIDE.md](./CIRCULAR_DEPS_GUIDE.md)

## 📚 Документация

- [Подробный гайд](./CIRCULAR_DEPS_GUIDE.md) - как исправлять циклы
- [Error #185 Quick Start](./ERROR_185_QUICK_START.md) - связь с React ошибками
- [Madge Documentation](https://github.com/pahen/madge) - официальная документация

## 🎓 Для команды

Поделитесь с командой:

1. Прочитать этот файл
2. Настроить локально (5 минут)
3. Ознакомиться с паттернами в [CIRCULAR_DEPS_GUIDE.md](./CIRCULAR_DEPS_GUIDE.md)
4. При Code Review проверять новые циклы

---

**Готово!** Теперь циклические зависимости блокируются автоматически 🛡️

**Следующий шаг**: Запустите `npm run check:circular` прямо сейчас!
