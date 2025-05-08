
#!/bin/bash

# Устанавливаем основные зависимости
npm install react react-dom typescript
npm install @types/react @types/react-dom @types/react-router-dom
npm install vite @vitejs/plugin-react-swc
npm install react-router-dom
npm install @types/node --save-dev

# UI и стили
npm install tailwindcss postcss autoprefixer --save-dev
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# shadcn зависимости
npm install @radix-ui/react-slot @radix-ui/react-tabs
npm install @radix-ui/react-scroll-area
npm install @radix-ui/react-separator
npm install @radix-ui/react-label
npm install @radix-ui/react-switch
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-popover
npm install @radix-ui/react-radio-group

# Обновляем package.json скриптами для запуска
echo '
{
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
}' > package.json.tmp

# Делаем скрипт выполняемым
chmod +x install-dependencies.sh

echo "Зависимости установлены, теперь запустите:"
echo "npm run dev"
