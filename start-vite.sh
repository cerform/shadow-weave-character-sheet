
#!/bin/bash

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js не установлен. Пожалуйста, установите Node.js"
    exit 1
fi

# Проверяем наличие npm
if ! command -v npm &> /dev/null; then
    echo "npm не установлен. Пожалуйста, установите npm"
    exit 1
fi

# Проверяем наличие package.json
if [ ! -f package.json ]; then
    echo "package.json не найден. Инициализируем проект..."
    npm init -y
fi

# Устанавливаем vite, если он отсутствует
if ! npm list --depth=0 | grep -q vite; then
    echo "Vite не установлен. Устанавливаем Vite..."
    npm install --save-dev vite @vitejs/plugin-react-swc
fi

# Убеждаемся, что файл index.html существует
if [ ! -f index.html ]; then
    echo "index.html не найден. Создаем..."
    echo '<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DnD Character Sheet</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>' > index.html
fi

# Запускаем Vite
echo "Запуск сервера разработки Vite..."
npx vite
