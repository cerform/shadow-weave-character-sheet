
#!/bin/bash

# Обеспечиваем доступность команды vite через npx
echo "Запуск Vite через npx..."
npx vite

# Если в предыдущей команде была ошибка, попробуем установить vite локально
if [ $? -ne 0 ]; then
  echo "Установка Vite локально..."
  npm install --save-dev vite
  
  echo "Повторный запуск Vite..."
  npx vite
fi
