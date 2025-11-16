# 🔄 Circular Dependencies Prevention Guide

## ⚡ Quick Start

Проект теперь автоматически проверяет циклические зависимости:

- ✅ **Pre-commit hook** - блокирует коммиты с circular deps
- ✅ **CI/CD** - блокирует PR с circular deps
- ✅ **Автоматические отчёты** - детальная информация о проблемах

## 🚀 Использование

### Ручная проверка

```bash
# Проверить циклические зависимости
npm run check:circular

# С визуализацией графа (требует graphviz)
npm run check:circular -- --image

# Проверить конкретную директорию
npx madge --circular src/components
```

### Автоматическая проверка

1. **При коммите** - автоматически запускается pre-commit хук
2. **При PR** - GitHub Actions проверит и добавит комментарий если найдены проблемы
3. **При push** - CI/CD проверка на всех ветках

## 📊 Уровни серьёзности

### 🔴 CRITICAL (4+ файлов в цикле)

```
A → B → C → D → A
```

**Риск**: Очень высокий шанс Error #185

**Действие**: Исправить НЕМЕДЛЕННО перед merge

### 🟡 MODERATE (3 файла в цикле)

```
A → B → C → A
```

**Риск**: Средний, может вызвать проблемы

**Действие**: Исправить в рамках PR

### 🟢 LOW (2 файла в цикле)

```
A → B → A
```

**Риск**: Низкий, но лучше исправить

**Действие**: Можно отложить, но отметить в backlog

## 🔧 Как исправить

### Паттерн 1: Извлечение общего кода

**Проблема:**
```tsx
// A.tsx
import { helperB } from './B';
export const helperA = () => {};

// B.tsx  
import { helperA } from './A'; // ❌ Циклическая зависимость
export const helperB = () => {};
```

**Решение:**
```tsx
// shared.tsx - новый файл
export const helperA = () => {};
export const helperB = () => {};

// A.tsx
import { helperB } from './shared';

// B.tsx
import { helperA } from './shared';
```

### Паттерн 2: Dependency Injection

**Проблема:**
```tsx
// ComponentA.tsx
import ComponentB from './ComponentB';

export const ComponentA = () => <ComponentB />;

// ComponentB.tsx
import ComponentA from './ComponentA'; // ❌ Цикл
```

**Решение:**
```tsx
// ComponentA.tsx
export const ComponentA = ({ ChildComponent }: { ChildComponent: React.FC }) => (
  <ChildComponent />
);

// ComponentB.tsx
export const ComponentB = () => <div>B</div>;

// index.tsx
<ComponentA ChildComponent={ComponentB} />
```

### Паттерн 3: Вынос типов

**Проблема:**
```tsx
// types/userTypes.ts
import { Post } from './postTypes';

export interface User {
  posts: Post[];
}

// types/postTypes.ts
import { User } from './userTypes'; // ❌ Цикл

export interface Post {
  author: User;
}
```

**Решение:**
```tsx
// types/shared.ts
export interface UserBase {
  id: string;
  name: string;
}

export interface PostBase {
  id: string;
  title: string;
}

// types/userTypes.ts
import { UserBase } from './shared';
import { Post } from './postTypes';

export interface User extends UserBase {
  posts: Post[];
}

// types/postTypes.ts
import { PostBase } from './shared';
import { User } from './userTypes';

export interface Post extends PostBase {
  author: User;
}
```

### Паттерн 4: Реструктуризация иерархии

**Проблема:**
```tsx
// stores/battleStore.ts
import { useCharacterStore } from './characterStore';

// stores/characterStore.ts
import { useBattleStore } from './battleStore'; // ❌ Цикл
```

**Решение:**
```tsx
// stores/sharedStore.ts - общие данные
export const useSharedStore = create(() => ({
  commonData: {},
}));

// stores/battleStore.ts
import { useSharedStore } from './sharedStore';

// stores/characterStore.ts
import { useSharedStore } from './sharedStore';
```

## 🎯 Best Practices

### 1. Структура папок

```
src/
├── types/          # Только типы, никаких импортов компонентов
├── utils/          # Утилиты, не импортируют бизнес-логику
├── hooks/          # Хуки, используют types и utils
├── components/     # Компоненты, используют hooks
└── pages/          # Страницы, используют components
```

### 2. Правила импорта

```
Страницы → Компоненты → Хуки → Утилиты → Типы
   ↓          ↓         ↓        ↓        ↓
  НЕТ        НЕТ       НЕТ      НЕТ     СТОП
```

**Никогда не импортируйте "вверх" по иерархии!**

### 3. Типы отдельно

```tsx
// ❌ Плохо: компонент и типы в одном файле
// Component.tsx
export interface ComponentProps {}
export const Component = (props: ComponentProps) => {};

// ✅ Хорошо: типы отдельно
// types/component.ts
export interface ComponentProps {}

// Component.tsx
import { ComponentProps } from './types/component';
export const Component = (props: ComponentProps) => {};
```

### 4. Barrel exports с осторожностью

```tsx
// ❌ Опасно: barrel export может создать циклы
// index.ts
export * from './ComponentA';
export * from './ComponentB';

// ✅ Безопаснее: явные экспорты
// index.ts
export { ComponentA } from './ComponentA';
export { ComponentB } from './ComponentB';
```

## 🔍 Отладка

### Найти цикл вручную

```bash
# Показать все импорты файла
npx madge --depends src/components/MyComponent.tsx

# Показать кто импортирует файл
npx madge --depends-on src/components/MyComponent.tsx

# Полный граф зависимостей
npx madge --image graph.svg src/
```

### Анализ конкретного цикла

```bash
# Если тест показал цикл A → B → C → A
npx madge --circular --depends src/A.tsx
npx madge --circular --depends src/B.tsx
npx madge --circular --depends src/C.tsx
```

### Визуализация

```bash
# Установить graphviz (один раз)
# macOS
brew install graphviz

# Ubuntu/Debian
sudo apt-get install graphviz

# Создать граф
npm run check:circular -- --image
open circular-deps-graph.svg
```

## 🚨 Что делать если CI блокирует PR

### Шаг 1: Посмотреть отчёт

1. Откройте PR на GitHub
2. Найдите комментарий от GitHub Actions
3. Раскройте "Full Report"

### Шаг 2: Локальная проверка

```bash
# Запустить проверку локально
npm run check:circular

# Посмотреть детали
npx madge --circular src/
```

### Шаг 3: Исправить

Следуйте рекомендациям выше

### Шаг 4: Проверить снова

```bash
# Убедиться что исправили
npm run check:circular

# Должно быть:
# ✅ No circular dependencies found!
```

### Шаг 5: Commit & Push

```bash
git add .
git commit -m "fix: resolve circular dependencies"
git push
```

## ⚙️ Конфигурация

### Исключить файлы из проверки

Отредактируйте `.madgerc`:

```json
{
  "excludeRegExp": [
    "node_modules",
    "__tests__",
    "legacy-code"  // добавьте сюда
  ]
}
```

### Настроить уровни серьёзности

Отредактируйте `scripts/check-circular-deps.js`:

```js
// Изменить пороги
const severity = 
  cycleLength >= 5 ? 'critical' :  // было 4
  cycleLength >= 3 ? 'moderate' : 
  'low';
```

### Отключить проверку (не рекомендуется!)

```bash
# Пропустить pre-commit хук
git commit --no-verify

# Или удалить хук
rm .husky/pre-commit
```

## 📈 Метрики и мониторинг

### Посмотреть статистику

```bash
# Количество файлов
npx madge src/ | wc -l

# Средняя сложность
npx madge --json src/ | jq '.[] | length' | awk '{sum+=$1} END {print sum/NR}'
```

### Tracking в CI

GitHub Actions сохраняет отчёты:
- Actions → Workflow → Artifacts → circular-deps-report

## 🎓 Обучение команды

### Code Review Checklist

- [ ] Нет новых циклических зависимостей
- [ ] Импорты следуют иерархии (pages → components → hooks → utils)
- [ ] Типы вынесены отдельно
- [ ] Нет barrel exports с циклами

### Onboarding для новых разработчиков

1. Прочитать этот гайд
2. Посмотреть [Error #185 Quick Start](./ERROR_185_QUICK_START.md)
3. Запустить `npm run check:circular` локально
4. Сделать тестовый коммит - увидеть pre-commit hook

## 🆘 Помощь

### Не могу исправить цикл

1. Создайте issue с описанием цикла
2. Опишите, что уже пробовали
3. Приложите вывод `npm run check:circular`

### CI ложно блокирует

1. Проверьте локально: `npm run check:circular`
2. Если локально OK, но CI fail - создайте issue
3. Временно можно отключить через workflow settings

## 📚 Ссылки

- [Madge Documentation](https://github.com/pahen/madge)
- [React Error #185](./ERROR_185_QUICK_START.md)
- [Module Systems Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

---

**Помните**: Предотвратить циклические зависимости проще, чем исправлять Error #185 в production! 🛡️
