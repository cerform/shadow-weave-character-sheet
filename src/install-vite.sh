
#!/bin/bash

# Очистка кеша npm для решения проблем с зависимостями
echo "Очистка кеша npm..."
npm cache clean --force

# Установка глобально vite для решения проблемы "vite: command not found"
echo "Установка Vite глобально..."
npm install -g vite

# Установка dпроектных зависимостей, если package.json существует
if [ -f package.json ]; then
  echo "Установка проектных зависимостей..."
  npm install
fi

# Добавляем запуск vite в package.json, если еще не добавлен
if [ -f package.json ] && ! grep -q "\"dev\": \"vite\"" package.json; then
  echo "Добавление скриптов для запуска в package.json..."
  # Используем временный файл для избежания проблем с перезаписью
  sed 's/"scripts": {/"scripts": {\n    "dev": "vite",/g' package.json > package.json.tmp
  mv package.json.tmp package.json
fi

echo "Установка завершена. Теперь вы можете запустить Vite, выполнив команду:"
echo "npm run dev"

# Делаем скрипт исполняемым
chmod +x src/install-vite.sh
