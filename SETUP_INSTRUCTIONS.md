# ⚡ Финальная настройка (2 минуты)

## 📝 Добавьте скрипты в package.json

Откройте `package.json` и добавьте в секцию `"scripts"` (после строки `"preview": "vite preview"`):

```json
"check:circular": "node scripts/check-circular-deps.js",
"check:circular:image": "madge --image circular-deps-graph.svg --extensions ts,tsx,js,jsx src/",
"type-check": "tsc --noEmit",
"prepare": "husky install"
```

Полный пример секции scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "check:circular": "node scripts/check-circular-deps.js",
    "check:circular:image": "madge --image circular-deps-graph.svg --extensions ts,tsx,js,jsx src/",
    "type-check": "tsc --noEmit",
    "prepare": "husky install"
  }
}
```

## 🚀 Запустите установку

```bash
# 1. Установить husky хуки
npm run prepare

# 2. Создать pre-commit хук
cp .husky/pre-commit.example .husky/pre-commit
chmod +x .husky/pre-commit

# 3. Протестировать
npm run check:circular
```

## ✅ Готово!

Теперь:
- ✅ При каждом коммите проверяются циклические зависимости
- ✅ GitHub Actions блокирует PR с циклами
- ✅ Автоматические комментарии в PR с инструкциями по исправлению

## 📚 Документация

- [CIRCULAR_DEPS_SETUP.md](./CIRCULAR_DEPS_SETUP.md) - Полная инструкция по настройке
- [CIRCULAR_DEPS_GUIDE.md](./CIRCULAR_DEPS_GUIDE.md) - Как исправлять циклические зависимости
- [ERROR_185_QUICK_START.md](./ERROR_185_QUICK_START.md) - Связь с React Error #185
