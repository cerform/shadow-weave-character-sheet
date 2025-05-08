
#!/bin/bash

echo "Установка зависимостей проекта..."

# Установка основных зависимостей
npm install --save react react-dom @types/react @types/react-dom

# Установка необходимых dev-зависимостей
npm install --save-dev vite @vitejs/plugin-react-swc typescript

# Установка UI компонентов
npm install --save @radix-ui/react-tabs @radix-ui/react-separator @radix-ui/react-dropdown-menu 
npm install --save @radix-ui/react-popover @radix-ui/react-label @radix-ui/react-radio-group 
npm install --save @radix-ui/react-switch @radix-ui/react-scroll-area
npm install --save class-variance-authority clsx tailwind-merge lucide-react

# Делаем скрипты исполняемыми
chmod +x install-dependencies.sh
chmod +x run-vite.sh

echo "Зависимости установлены! Для запуска приложения выполните 'bash run-vite.sh'"
