# 🚀 GitHub Actions CI/CD Setup

## Автоматическое тестирование и coverage отчеты

Настроена полная CI/CD интеграция с автоматическим запуском тестов и публикацией coverage отчетов.

## Workflows

### 1. 🧪 Tests & Coverage (`.github/workflows/test.yml`)

Запускается при:
- **Push** в любую ветку
- **Pull Request** в любую ветку

#### Что проверяется:

**Job: test**
1. ✅ ESLint проверка всех `.ts` и `.tsx` файлов
2. ✅ Запуск всех unit тестов с подробным выводом
3. ✅ Генерация coverage отчета
4. ✅ **Проверка coverage thresholds (блокирует PR при несоответствии)**
5. ✅ Публикация coverage в Codecov
6. ✅ Комментарий в PR с coverage информацией
7. ✅ Загрузка coverage artifacts (доступны 30 дней)

**Job: hooks-protection**
1. ✅ Тесты стабильности селекторов
2. ✅ Тесты EnhancedBattleToken3D
3. ✅ Тесты ModelLoader с фиксированными путями
4. ✅ Проверка защиты от React Error #185

### 2. 📊 Coverage Report (`.github/workflows/coverage-report.yml`)

Запускается при:
- **Push** в `main`/`master`/`develop` ветки
- **Manual trigger** через GitHub UI

#### Что делается:

1. ✅ Генерация полного coverage отчета
2. ✅ Публикация в Codecov с полным флагом
3. ✅ Деплой HTML отчета на GitHub Pages
4. ✅ Создание coverage badge
5. ✅ Комментарий к коммиту со ссылкой на отчет

## Настройка

### Шаг 1: Активация GitHub Actions

GitHub Actions активируется автоматически при наличии `.github/workflows/` директории.

Проверьте на GitHub: `Settings → Actions → General`
- ✅ Allow all actions and reusable workflows

### Шаг 2: Настройка Codecov (опционально)

1. Зарегистрируйтесь на [codecov.io](https://codecov.io)
2. Подключите ваш GitHub репозиторий
3. Получите токен: `Settings → Repository Upload Token`
4. Добавьте секрет в GitHub:
   - `Settings → Secrets and variables → Actions`
   - New repository secret: `CODECOV_TOKEN`

### Шаг 3: Настройка GitHub Pages для coverage

1. `Settings → Pages`
2. Source: `Deploy from a branch`
3. Branch: `gh-pages` → `/ (root)`
4. Save

Coverage отчет будет доступен по адресу:
```
https://[your-username].github.io/[repo-name]/coverage/
```

### Шаг 4: Обновление CODEOWNERS

Отредактируйте `.github/CODEOWNERS`:
```bash
# Замените @your-username на ваш GitHub username
/src/stores/unifiedBattleStore*.ts @actual-username
/src/components/battle/enhanced/ @actual-username
```

## Статусы и badges

### Добавить badges в README.md

```markdown
[![Tests](https://github.com/[username]/[repo]/actions/workflows/test.yml/badge.svg)](https://github.com/[username]/[repo]/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/[username]/[repo]/branch/main/graph/badge.svg)](https://codecov.io/gh/[username]/[repo])
[![Hooks Protection](https://img.shields.io/badge/React%20Error%20%23185-Protected-brightgreen)](./HOOKS_PROTECTION.md)
```

## Мониторинг тестов

### На GitHub Actions

Все запуски доступны здесь:
```
https://github.com/[username]/[repo]/actions
```

### Пример успешного прогона:

```
✅ test / test
   ├─ ESLint check: 0 errors, 0 warnings
   ├─ Run all tests: 35 passed
   ├─ Coverage: 95.2% lines, 89.7% branches
   └─ Artifacts uploaded: coverage-report

✅ test / hooks-protection  
   ├─ Selector stability: ✅ 15/15 passed
   ├─ EnhancedBattleToken3D: ✅ 12/12 passed
   └─ ModelLoader: ✅ 8/8 passed
```

### Пример неудачного прогона:

```
❌ test / hooks-protection
   └─ EnhancedBattleToken3D: ❌ 1/12 failed
      Error: Rendered fewer hooks than expected
      
⚠️ React Error #185 regression detected!
```

## Pull Request проверки

При создании PR автоматически:

1. ✅ Запускаются все тесты
2. ✅ Проверяется ESLint
3. ✅ Генерируется coverage diff
4. ✅ Добавляется комментарий с результатами
5. ✅ Обновляется статус PR (✅ / ❌)

### Пример комментария в PR:

```markdown
## 📊 Coverage Report

| File | Coverage | Δ |
|------|----------|---|
| unifiedBattleStoreExports.ts | 100% | +2% |
| EnhancedBattleToken3D.tsx | 92.5% | -1.2% |

**Total:** 94.8% (+0.5%)

[View full report](https://codecov.io/gh/user/repo/pull/123)
```

## Требования для merge

Рекомендуется настроить branch protection rules:

1. `Settings → Branches → Branch protection rules`
2. Add rule для `main` ветки:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - Выберите статусы:
     - `test / test`
     - `test / hooks-protection`
   - ✅ Require linear history
   - ✅ Include administrators

Это предотвратит merge PR с падающими тестами.

## Производительность

### Типичное время выполнения:

- **ESLint check:** ~30 секунд
- **All tests:** ~2-3 минуты
- **Coverage generation:** ~1-2 минуты
- **Hooks protection:** ~1 минута

**Общее время:** ~5-7 минут

### Оптимизация:

Если тесты работают слишком долго:

1. Используйте cache для `node_modules`
2. Запускайте только измененные тесты:
   ```yaml
   - run: npm run test -- --changed --run
   ```
3. Распараллельте jobs через matrix strategy

## Debugging

### Просмотр логов

1. Откройте workflow run на GitHub Actions
2. Кликните на упавший job
3. Разверните нужный step
4. Скачайте artifacts для детального анализа

### Локальная эмуляция CI

Используйте [act](https://github.com/nektos/act):

```bash
# Установка act
brew install act  # macOS
# или
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Запуск workflow локально
act push
act pull_request
```

## Мониторинг coverage

### Codecov Dashboard

- Просмотр трендов coverage
- Сравнение между коммитами
- Файлы с низким покрытием
- Coverage sunburst диаграммы

### GitHub Pages Report

- Детальный HTML отчет
- Покрытие по файлам и функциям
- Некрытые строки кода

## Уведомления

Настройте уведомления о падающих тестах:

1. `Settings → Notifications`
2. ✅ Actions
3. Выберите способ уведомления:
   - Email
   - GitHub Mobile
   - Slack (через GitHub integration)

## Troubleshooting

### Проблема: "Codecov token invalid"

**Решение:** Проверьте что `CODECOV_TOKEN` секрет добавлен корректно.

### Проблема: "GitHub Pages not deploying"

**Решение:**
1. Проверьте что `gh-pages` ветка создана
2. Проверьте настройки Pages
3. Убедитесь что workflow имеет права на push

### Проблема: "Tests timeout"

**Решение:** Увеличьте `timeout-minutes` в workflow файле.

### Проблема: "PR comment not posted"

**Решение:** Убедитесь что GitHub App имеет права на:
- Read pull requests
- Write pull request comments

## Лучшие практики

1. ✅ **Всегда ждите зеленого статуса** перед merge
2. ✅ **Проверяйте coverage diff** в PR комментариях
3. ✅ **Не используйте `--no-verify`** для обхода pre-commit
4. ✅ **Исправляйте failing тесты немедленно**
5. ✅ **Поддерживайте coverage >90%** для критичных файлов

## Связанная документация

- `TESTING.md` - детали о тестах
- `HUSKY_SETUP.md` - pre-commit hooks
- `HOOKS_PROTECTION.md` - защита от React Error #185
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com/)

---

**Ваш репозиторий теперь защищен на всех уровнях! 🛡️**

Локально → Pre-commit → GitHub Actions → Production ✅
