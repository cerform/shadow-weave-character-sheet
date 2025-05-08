
#!/bin/bash

# Очистка кеша npm для решения проблем с зависимостями
echo "Очистка кеша npm..."
npm cache clean --force

# Установка глобально vite для решения проблемы "vite: command not found"
echo "Установка Vite глобально..."
npm install -g vite

# Установка основных зависимостей
echo "Установка основных зависимостей React и TypeScript..."
npm install react react-dom typescript
npm install @types/react @types/react-dom @types/node --save-dev

# Установка Vite и плагинов
echo "Установка Vite и плагинов..."
npm install vite @vitejs/plugin-react-swc --save-dev

# Установка UI зависимостей
echo "Установка UI зависимостей..."
npm install tailwindcss postcss autoprefixer --save-dev
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Установка дополнительных компонентов Radix UI
echo "Установка компонентов Radix UI..."
npm install @radix-ui/react-slot @radix-ui/react-tabs
npm install @radix-ui/react-scroll-area
npm install @radix-ui/react-separator
npm install @radix-ui/react-label
npm install @radix-ui/react-switch
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-popover
npm install @radix-ui/react-radio-group

# Создание package.json если его нет
if [ ! -f package.json ]; then
  echo "Создание package.json..."
  echo '{
    "name": "dnd-character-sheet",
    "private": true,
    "version": "0.1.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
      "preview": "vite preview"
    }
  }' > package.json
fi

# Установка прав на выполнение скрипта
chmod +x install-vite-deps.sh

echo "Зависимости установлены успешно! Теперь запустите проект командой:"
echo "npm run dev"
