
#!/bin/bash

echo "Installing Vite and project dependencies..."

# Установка Vite и необходимых пакетов
npm install -g vite
npm install vite @vitejs/plugin-react-swc lovable-tagger

# Установка основных зависимостей React
npm install react react-dom @types/react @types/react-dom

# Установка компонентов shadcn
npm install @radix-ui/react-tabs @radix-ui/react-separator @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-label @radix-ui/react-radio-group @radix-ui/react-switch @radix-ui/react-scroll-area class-variance-authority clsx tailwind-merge lucide-react

# Создание vite.config.js, если его нет
if [ ! -f vite.config.js ] && [ ! -f vite.config.ts ]; then
  echo 'import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});' > vite.config.js
  echo "Created vite.config.js"
fi

# Проверка и добавление скрипта в package.json
if ! grep -q '"dev": "vite"' package.json; then
  sed -i 's/"scripts": {/"scripts": {\n    "dev": "vite",/g' package.json || \
  sed -i '' 's/"scripts": {/"scripts": {\n    "dev": "vite",/g' package.json
fi

# Проверка наличия индексного HTML-файла
if [ ! -f index.html ]; then
  echo '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DnD Character Sheet App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>' > index.html
  echo "Created index.html"
fi

# Делаем скрипт исполняемым
chmod +x install-vite-deps.sh

echo "Installation complete. Run 'npm run dev' to start the development server."
