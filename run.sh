
#!/bin/bash

# Make this script executable
chmod +x run.sh

# Ensure script continues even if a command fails
set -e

echo "Starting D&D Character Sheet Application..."

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "Node modules not found. Installing dependencies first..."
  npm install --legacy-peer-deps
fi

# Check if vite is in node_modules/.bin
if [ -f ./node_modules/.bin/vite ]; then
  echo "Using local vite installation"
  ./node_modules/.bin/vite
else
  # Try using npx vite
  echo "Using npx vite"
  npx vite
fi

echo "Application stopped."
