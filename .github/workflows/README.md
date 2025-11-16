# GitHub Actions Workflows

## Обзор workflows

### 1. `test.yml` - Tests & Coverage
**Триггеры:** push, pull_request (все ветки)

**Jobs:**
- **test** - Основные тесты и coverage
  - ESLint проверка
  - Все unit тесты
  - Генерация coverage
  - Публикация в Codecov
  - Комментарий в PR
  - Upload artifacts

- **hooks-protection** - Защита от React Error #185
  - Тесты стабильности селекторов
  - Тесты EnhancedBattleToken3D
  - Тесты ModelLoader
  - Проверка Rules of Hooks

### 2. `coverage-report.yml` - Coverage Report
**Триггеры:** push (main/master/develop), manual

**Jobs:**
- **coverage** - Полный coverage отчет
  - Генерация HTML отчета
  - Публикация на GitHub Pages
  - Upload в Codecov с полным флагом
  - Создание coverage badge
  - Комментарий с ссылкой на отчет

## Быстрая настройка

### Шаг 1: Проверка работы (автоматически)

Workflows активируются автоматически при первом push после добавления `.github/workflows/`:

```bash
git add .github/workflows/
git commit -m "ci: add GitHub Actions workflows"
git push
```

Проверьте статус на: `https://github.com/[username]/[repo]/actions`

### Шаг 2: Codecov (опционально)

1. Зарегистрируйтесь на [codecov.io](https://codecov.io)
2. Подключите репозиторий
3. Получите Upload Token
4. Добавьте секрет в GitHub:
   ```
   Settings → Secrets and variables → Actions
   → New repository secret
   
   Name: CODECOV_TOKEN
   Value: [ваш-токен]
   ```

Без Codecov токена workflows будут работать, но без публикации в Codecov.

### Шаг 3: GitHub Pages (опционально)

1. Перейдите в `Settings → Pages`
2. Source: `Deploy from a branch`
3. Branch: `gh-pages` → `/ (root)`
4. Save

После первого успешного деплоя coverage будет доступен на:
```
https://[username].github.io/[repo]/coverage/
```

### Шаг 4: Branch Protection (рекомендуется)

Защитите main ветку от некачественного кода:

```
Settings → Branches → Add rule

Branch name pattern: main
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging

Status checks:
  ✅ test / test
  ✅ test / hooks-protection

✅ Do not allow bypassing the above settings
```

## Мониторинг

### Статусы в Pull Request

При создании PR вы увидите:

```
✅ test / test — All checks passed
   ├─ ESLint check
   ├─ Run all tests
   ├─ Generate coverage report
   └─ Upload coverage
   
✅ test / hooks-protection — React Error #185 Protected
   ├─ Selector stability tests
   ├─ EnhancedBattleToken3D tests
   └─ ModelLoader tests
```

### Coverage комментарий в PR

Автоматически добавляется комментарий:

```markdown
## 📊 Coverage Report

| File | Coverage | Δ |
|------|----------|---|
| unifiedBattleStoreExports.ts | 100% | — |
| EnhancedBattleToken3D.tsx | 92.5% | +1.2% |

**Total:** 94.8% (+0.5%)

[View full report](https://codecov.io/gh/user/repo/pull/123)
```

## Troubleshooting

### Проблема: Workflow не запускается

**Решение:**
1. Проверьте `Settings → Actions → General`
2. `Allow all actions and reusable workflows` должно быть включено
3. Проверьте что файлы в `.github/workflows/` имеют расширение `.yml`

### Проблема: Codecov upload failed

**Решение:**
1. Проверьте что секрет `CODECOV_TOKEN` добавлен
2. Проверьте что токен валиден на codecov.io
3. Workflow будет продолжен даже при ошибке Codecov (`fail_ci_if_error: false`)

### Проблема: GitHub Pages не деплоится

**Решение:**
1. Убедитесь что workflow имеет права на создание `gh-pages` ветки
2. Проверьте `Settings → Actions → General → Workflow permissions`
3. Должно быть: `Read and write permissions`

### Проблема: PR комментарий не появляется

**Решение:**
1. Проверьте права workflow: `Read and write permissions`
2. Убедитесь что `GITHUB_TOKEN` имеет доступ к PR
3. Проверьте логи workflow для деталей

## Кастомизация

### Изменение расписания

Для запуска по расписанию добавьте в `test.yml`:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Каждый день в полночь
```

### Матричное тестирование

Для тестирования на разных версиях Node.js:

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
```

### Ускорение тестов

Для запуска только измененных тестов:

```yaml
- name: Run tests
  run: npm run test -- --changed --run
```

## Секреты

### Обязательные
- Нет (workflow работает без секретов)

### Опциональные
- `CODECOV_TOKEN` - для публикации в Codecov
- Другие секреты добавляются по необходимости

## Permissions

Workflow использует стандартный `GITHUB_TOKEN` с правами:

- `contents: write` - для создания gh-pages ветки
- `pull-requests: write` - для комментариев в PR
- `actions: read` - для чтения статусов actions

## Artifacts

Каждый workflow run сохраняет artifacts:

- **coverage-report** (30 дней)
  - HTML отчет
  - LCOV файлы
  - JSON summary

Скачать: `Actions → Workflow run → Artifacts`

## Связанные файлы

- `.lintstagedrc.json` - конфигурация lint-staged
- `.husky/pre-commit` - pre-commit hook
- `vitest.config.ts` - конфигурация тестов
- `.eslintrc.json` - конфигурация ESLint
- `.gitattributes` - настройки Git

## Дополнительная информация

Полная документация:
- [GITHUB_ACTIONS_SETUP.md](../../GITHUB_ACTIONS_SETUP.md)
- [TESTING.md](../../TESTING.md)
- [HUSKY_SETUP.md](../../HUSKY_SETUP.md)

GitHub Actions документация:
- https://docs.github.com/en/actions
- https://docs.github.com/en/actions/using-workflows
