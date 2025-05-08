
#!/bin/bash

echo "Installing D&D Character Sheet Application dependencies..."

# Install core dependencies
npm install --save react react-dom @types/react @types/react-dom react-router-dom

# Install development dependencies
npm install --save-dev typescript @vitejs/plugin-react-swc vite

# Install UI component libraries
npm install --save @radix-ui/react-tabs @radix-ui/react-separator @radix-ui/react-dropdown-menu 
npm install --save @radix-ui/react-popover @radix-ui/react-label @radix-ui/react-radio-group 
npm install --save @radix-ui/react-switch @radix-ui/react-scroll-area
npm install --save class-variance-authority clsx tailwind-merge lucide-react

# Дополнительные пакеты для создания D&D приложения
npm install --save @tanstack/react-query uuid date-fns @fontsource/cormorant @fontsource/philosopher

# Добавляем нужные шрифты
npm install --save @fontsource/cormorant @fontsource/philosopher

# Make scripts executable
chmod +x run-vite.sh
chmod +x install-dependencies.sh
chmod +x make-executable.sh
chmod +x start-vite.sh
if [ -f install-vite.sh ]; then
  chmod +x install-vite.sh
fi
if [ -f src/install-vite.sh ]; then
  chmod +x src/install-vite.sh
fi
if [ -f src/scripts/run-vite.sh ]; then
  chmod +x src/scripts/run-vite.sh
fi
if [ -f src/scripts/start-vite.js ]; then
  chmod +x src/scripts/start-vite.js
fi

echo "Dependencies installed successfully! Run './run-vite.sh' to start the application."
