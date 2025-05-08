
#!/bin/bash

# Убеждаемся, что vite доступен
if ! command -v vite &> /dev/null && ! [ -f ./node_modules/.bin/vite ]; then
  echo "Vite не найден. Устанавливаем локально..."
  npm install --save-dev vite
fi

# Запускаем vite
echo "Запуск сервера разработки Vite..."
if command -v vite &> /dev/null; then
  vite
elif [ -f ./node_modules/.bin/vite ]; then
  ./node_modules/.bin/vite
else
  npx vite
fi
