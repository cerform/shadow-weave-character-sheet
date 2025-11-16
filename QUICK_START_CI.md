# 🚀 Quick Start: CI/CD за 5 минут

## Чеклист первоначальной настройки

### ✅ Шаг 1: Активация Husky (локально)

```bash
# Установка зависимостей (если еще не установлены)
npm install

# Инициализация Husky
npx husky init

# Установка прав доступа
chmod +x .husky/pre-commit

# Проверка работы
echo "test" >> test.txt
git add test.txt
git commit -m "test: проверка husky"
# Должны запуститься тесты
```

**Ожидаемый результат:**
```
🧪 Запуск тестов защиты от React Error #185...
✅ Все тесты прошли успешно!
```

### ✅ Шаг 2: Push в GitHub

```bash
# Первый push активирует GitHub Actions автоматически
git push origin main
```

Проверьте статус: `https://github.com/[username]/[repo]/actions`

**Ожидаемый результат:**
```
✅ Tests & Coverage completed successfully
✅ React Error #185 Protection passed
```

### ✅ Шаг 3: Настройка Codecov (опционально, 2 минуты)

1. Откройте [codecov.io](https://codecov.io) и войдите через GitHub
2. Найдите ваш репозиторий и кликните "Setup repo"
3. Скопируйте токен
4. В GitHub: `Settings → Secrets and variables → Actions → New secret`
   - Name: `CODECOV_TOKEN`
   - Value: `[вставьте токен]`
5. Сохраните

**Ожидаемый результат:**
При следующем push coverage будет публиковаться на Codecov

### ✅ Шаг 4: GitHub Pages для coverage (опционально, 1 минута)

1. `Settings → Pages`
2. Source: `Deploy from a branch`
3. Branch: `gh-pages` → `/ (root)`
4. Save
5. Дождитесь первого деплоя (появится после первого push в main)

**Ожидаемый результат:**
Coverage доступен на: `https://[username].github.io/[repo]/coverage/`

### ✅ Шаг 5: Обновление README badges (1 минута)

Отредактируйте `README.md`, замените в badges:
- `YOUR_USERNAME` → ваш GitHub username
- `YOUR_REPO` → название репозитория

```markdown
[![Tests](https://github.com/username/repo/actions/workflows/test.yml/badge.svg)](https://github.com/username/repo/actions/workflows/test.yml)
[![Coverage](https://img.shields.io/badge/coverage-check%20codecov-brightgreen)](https://codecov.io/gh/username/repo)
```

Сохраните и запушьте.

### ✅ Шаг 6: Branch Protection (опционально, 2 минуты)

Защитите main ветку от некачественного кода:

1. `Settings → Branches`
2. `Add branch protection rule`
3. Branch name pattern: `main`
4. Включите:
   - ✅ `Require status checks to pass before merging`
   - ✅ `Require branches to be up to date`
5. Выберите статусы:
   - ✅ `test / test`
   - ✅ `test / hooks-protection`
6. Save changes

**Ожидаемый результат:**
PR не смогут быть смержены без прохождения всех тестов

## Проверка работы системы

### Локальная проверка (Pre-commit)

```bash
# Создайте тестовый файл с ошибкой
echo "const x = " > src/test-error.ts

# Попробуйте закоммитить
git add src/test-error.ts
git commit -m "test: проверка защиты"

# Ожидается: коммит заблокирован ESLint
```

### GitHub Actions проверка

```bash
# Создайте ветку и PR
git checkout -b test-ci
echo "// test" >> README.md
git add README.md
git commit -m "test: проверка CI"
git push origin test-ci

# Откройте PR на GitHub
```

**В PR вы должны увидеть:**
1. ✅ Статусы проверок
2. 📊 Комментарий с coverage
3. 🛡️ Проверка защиты от React Error #185

## Что дальше?

### Ежедневное использование

После настройки просто работайте как обычно:

```bash
# Разработка
git checkout -b feature/new-feature
# ... код ...
git add .
git commit -m "feat: добавил новую фичу"
# ← Здесь автоматически запустятся тесты (Husky)

git push origin feature/new-feature
# ← Здесь запустятся тесты в GitHub Actions

# Создайте PR на GitHub
# ← Автоматически добавится комментарий с coverage
```

### Мониторинг

**GitHub Actions:**
```
https://github.com/[username]/[repo]/actions
```

**Codecov (если настроен):**
```
https://codecov.io/gh/[username]/[repo]
```

**Coverage HTML (если настроен):**
```
https://[username].github.io/[repo]/coverage/
```

## Troubleshooting

### ❌ Husky не запускается

```bash
# Проверьте права
ls -la .husky/pre-commit
# Должно быть: -rwxr-xr-x

# Если нет:
chmod +x .husky/pre-commit
```

### ❌ GitHub Actions не запускаются

```bash
# Проверьте в Settings → Actions → General:
# ✅ Allow all actions and reusable workflows должно быть включено
```

### ❌ Codecov upload failed

```bash
# Это не критично - workflow продолжит работу
# Проверьте что CODECOV_TOKEN добавлен корректно
```

### ❌ Тесты падают

```bash
# Запустите локально для отладки
npm run test -- --run --reporter=verbose

# Проверьте конкретный тест
npm run test -- src/stores/__tests__/unifiedBattleStoreExports.test.ts
```

## Полезные команды

```bash
# Обход pre-commit (НЕ рекомендуется!)
git commit --no-verify -m "emergency"

# Запуск тестов вручную
npm run test
npm run test -- --coverage
npm run test -- --watch

# Проверка ESLint
npx eslint "src/**/*.{ts,tsx}"

# Локальная эмуляция GitHub Actions (требует act)
act push
act pull_request
```

## Документация

После настройки изучите подробную документацию:

- 📚 [TESTING.md](./TESTING.md) - полная документация по тестам
- 🐺 [HUSKY_SETUP.md](./HUSKY_SETUP.md) - детали pre-commit hooks
- 🚀 [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - CI/CD конфигурация
- 🛡️ [HOOKS_PROTECTION.md](./HOOKS_PROTECTION.md) - защита от React Error #185
- ⚡ [README-TESTS.md](./README-TESTS.md) - быстрый старт с тестами

## Итоговый чеклист

- [ ] Husky активирован и работает локально
- [ ] GitHub Actions запускается на push
- [ ] Codecov настроен (опционально)
- [ ] GitHub Pages настроен (опционально)
- [ ] README badges обновлены
- [ ] Branch protection настроен (опционально)
- [ ] Тесты проходят локально и в CI
- [ ] PR получает автоматические комментарии

## Поздравляем! 🎉

Ваш проект теперь защищен на всех уровнях:

```
Разработка → Pre-commit → GitHub Actions → Production
    🛡️         🛡️            🛡️              🛡️
  Локально    Husky      CI/CD Tests    Zero Bugs
```

**React Error #185 больше никогда не вернется!** ✅
