# React Error #185 Diagnostic Tests

Эти тесты помогают диагностировать и отлавливать React Error #185 (Invalid element type).

## Запуск тестов

```bash
# Запустить Jest тесты
npm run test:jest

# Запустить в watch mode
npm run test:jest -- --watch

# Запустить только error-185 тест
npm run test:jest react-error-185
```

## Как использовать

1. **Если ошибка уже происходит**: Просто запустите тест, он поймает ошибку и покажет полное сообщение
2. **Для тестирования конкретного компонента**: Отредактируйте `react-error-185.test.tsx` и укажите проблемный компонент

## Что показывает тест

- ✅ Полный текст ошибки (не минифицированный)
- ✅ Component stack trace
- ✅ Анализ типичных причин
- ✅ Конкретные рекомендации по исправлению

## Типичные причины Error #185

1. **Undefined export/import**
   ```tsx
   // ❌ Неправильно
   import { Component } from './file'; // Component undefined
   
   // ✅ Правильно
   import Component from './file';
   ```

2. **Неправильный default export**
   ```tsx
   // ❌ Неправильно
   export { Component as default };
   
   // ✅ Правильно
   export default Component;
   ```

3. **Circular dependencies**
   - Файл A импортирует B
   - Файл B импортирует A
   - Результат: undefined компонент

4. **Не инициализированный store**
   ```tsx
   // ❌ Неправильно
   const store = useStore(); // store undefined
   
   // ✅ Правильно
   const store = useStore() ?? defaultStore;
   ```

## Отладка

Если тест не ловит ошибку:
1. Проверьте, что компонент правильно импортирован
2. Попробуйте импортировать конкретный проблемный компонент
3. Проверьте консоль на другие ошибки загрузки
