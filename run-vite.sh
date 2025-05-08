
#!/bin/bash

# Ensure script continues even if a command fails
set -e

echo "Starting D&D Character Sheet Application..."

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "Node modules not found. Installing dependencies first..."
  ./install-dependencies.sh
fi

# Check if vite is globally installed
if command -v vite &> /dev/null; then
  echo "Using global vite installation"
  vite
  exit 0
fi

# Check if vite is locally installed
if [ -f ./node_modules/.bin/vite ]; then
  echo "Using local vite installation"
  ./node_modules/.bin/vite
  exit 0
fi

# If vite is not found, try installing it locally and then run
echo "Vite not found. Installing locally..."
npm install --save-dev vite @vitejs/plugin-react-swc
echo "Running vite with npx..."
npx vite
