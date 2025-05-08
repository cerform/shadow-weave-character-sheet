
#!/bin/bash

# Exit on error
set -e

echo "Starting development server with Vite..."

# Ensure node_modules/.bin is in PATH
PATH="./node_modules/.bin:$PATH"

# Try to run vite directly first
if command -v vite &> /dev/null; then
  vite "$@"
else
  # If vite command not found, use npx
  echo "Vite command not found, using npx..."
  npx vite "$@"
fi
