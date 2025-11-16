# 🚨 React Error #185 - Быстрая Диагностика

## Что это?

React Error #185 = "Invalid element type" - один из самых частых ошибок React.

В production вы видите:
```
Minified React error #185; visit https://reactjs.org/docs/error-decoder.html...
```

Этот тест покажет **ПОЛНОЕ** сообщение об ошибке!

## ⚡ Быстрый старт (30 секунд)

```bash
# 1. Запустить тест
npm run test react-error-185

# 2. Смотреть вывод в консоли
# 3. Следовать рекомендациям
# 4. Исправить проблему
```

## 📖 Что покажет тест

```
🛑 FULL REACT ERROR MESSAGE:
Element type is invalid: expected a string (for built-in components) 
or a class/function (for composite components) but got: undefined. 
You likely forgot to export your component from the file it's defined in, 
or you might have mixed up default and named imports.

Check the render method of `UnifiedBattleStoreExports`.
```

## 🎯 Top 5 причин (95% случаев)

### 1. Wrong import type (50% случаев)

```tsx
// ❌ Файл exports named, вы импортируете default
export const Component = () => <div/>;
import Component from './file'; // undefined!

// ✅ Правильно
import { Component } from './file';
```

### 2. Missing default export (20%)

```tsx
// ❌ Нет default export
export { Component };

// File B
import Component from './A'; // undefined!

// ✅ Правильно - добавить default
export default Component;
```

### 3. Circular dependency (15%)

```tsx
// ❌ A imports B, B imports A
// A.tsx
import { B } from './B';

// B.tsx
import { A } from './A'; // Boom!

// ✅ Вынести в C.tsx
```

### 4. Component не возвращает JSX (5%)

```tsx
// ❌ Забыли return
const Component = () => {
  const value = 42;
  // нет return!
};

// ✅ Правильно
const Component = () => {
  return <div>42</div>;
};
```

### 5. Store/Context undefined (5%)

```tsx
// ❌ Store не инициализирован
const tokens = useTokens(); // может быть undefined
return tokens.map(...); // Crash!

// ✅ Добавить fallback
const tokens = useTokens() ?? [];
```

## 🔥 Экстренная помощь

### Если тест показывает ошибку в конкретном файле:

1. **Откройте этот файл**
2. **Проверьте export:**
   ```tsx
   // Есть ли export default?
   export default Component;
   
   // Или это named export?
   export { Component };
   export const Component = ...;
   ```

3. **Проверьте импорты в других файлах:**
   ```tsx
   // Если export default:
   import Component from './file'; ✅
   
   // Если export named:
   import { Component } from './file'; ✅
   ```

4. **Проверьте нет ли undefined:**
   ```tsx
   // Добавьте console.log
   console.log('Component:', Component); // undefined = проблема!
   ```

## 🛠️ Инструменты диагностики

### Проверка circular dependencies

```bash
# Установить madge
npm install -g madge

# Найти циклические зависимости
madge --circular src/

# С визуализацией
madge --circular --image graph.png src/
```

### Проверка exports/imports

```bash
# Найти все default exports
grep -r "export default" src/

# Найти все named exports
grep -r "export const\|export function" src/
```

## 📚 Полная документация

См. `src/tests/README.md` для:
- Детального объяснения тестов
- Всех возможных причин
- Best practices
- Troubleshooting

## ✅ Checklist исправления

- [ ] Запустил тест `npm run test react-error-185`
- [ ] Прочитал полное сообщение об ошибке
- [ ] Нашёл проблемный файл в component stack
- [ ] Проверил export/import в этом файле
- [ ] Исправил проблему
- [ ] Запустил тест снова - ошибка исчезла
- [ ] Закоммитил исправление

## 💡 Pro Tips

1. **Всегда запускайте этот тест при Error #185**
   - Сэкономит часы debugging

2. **Добавьте в pre-commit hook**
   ```json
   {
     "husky": {
       "hooks": {
         "pre-commit": "npm run test"
       }
     }
   }
   ```

3. **Используйте TypeScript строго**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true
     }
   }
   ```

4. **Avoid dynamic imports в render**
   ```tsx
   // ❌ Bad
   const Comp = useMemo(() => 
     condition ? require('./A') : require('./B')
   , [condition]);
   
   // ✅ Good
   {condition ? <CompA /> : <CompB />}
   ```

---

**Помните**: 90% Error #185 = неправильный import/export. Проверьте это ПЕРВЫМ!
