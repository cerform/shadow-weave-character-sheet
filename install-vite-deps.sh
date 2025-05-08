
#!/bin/bash

echo "Installing Vite and project dependencies..."

# Установка Vite и необходимых пакетов
npm install -g vite
npm install vite @vitejs/plugin-react-swc lovable-tagger

# Установка основных зависимостей React
npm install react react-dom @types/react @types/react-dom

# Установка компонентов shadcn
npm install @radix-ui/react-tabs @radix-ui/react-separator @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-label @radix-ui/react-radio-group @radix-ui/react-switch @radix-ui/react-scroll-area class-variance-authority clsx tailwind-merge lucide-react

# Проверка и добавление скрипта в package.json
if ! grep -q '"dev": "vite"' package.json; then
  sed -i 's/"scripts": {/"scripts": {\n    "dev": "vite",/g' package.json || \
  sed -i '' 's/"scripts": {/"scripts": {\n    "dev": "vite",/g' package.json
fi

# Делаем скрипт исполняемым
chmod +x install-vite-deps.sh

echo "Installation complete. Run 'npm run dev' to start the development server."
