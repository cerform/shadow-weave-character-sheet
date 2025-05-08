
#!/bin/bash

# Make sure we have the latest dependencies
echo "Ensuring dependencies are installed..."
npm install

# Add node_modules/.bin to PATH
export PATH="$PWD/node_modules/.bin:$PATH"

echo "Starting Vite development server..."
if command -v vite &> /dev/null; then
  vite
elif [ -f "./node_modules/.bin/vite" ]; then
  ./node_modules/.bin/vite
else
  echo "Vite not found in node_modules, trying to install it..."
  npm install --save-dev vite
  
  if [ -f "./node_modules/.bin/vite" ]; then
    ./node_modules/.bin/vite
  else
    echo "Error: Could not find or install Vite. Please run 'bash install-vite-deps.sh' first."
    exit 1
  fi
fi
