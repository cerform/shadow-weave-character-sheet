
#!/bin/bash

# Ensure script continues even if a command fails
set -e

echo "Starting D&D Character Sheet Application..."

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "Node modules not found. Installing dependencies first..."
  bash install-dependencies.sh
fi

# Check if vite is installed
if ! command -v vite &> /dev/null && ! [ -f ./node_modules/.bin/vite ]; then
  echo "Vite not found. Installing locally..."
  npm install --save-dev vite @vitejs/plugin-react-swc
fi

# Make sure essential directories exist
mkdir -p src

# Run vite with proper error handling
echo "Starting development server with Vite..."
if command -v vite &> /dev/null; then
  echo "Using global vite installation"
  vite
elif [ -f ./node_modules/.bin/vite ]; then
  echo "Using local vite installation"
  ./node_modules/.bin/vite
else
  echo "Using npx to run vite"
  npx vite
fi

