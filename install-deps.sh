
#!/bin/bash

echo "Installing project dependencies..."

# Install project dependencies
npm install

# Make sure vite script is in package.json
if ! grep -q '"dev": "vite"' package.json; then
  sed -i 's/"scripts": {/"scripts": {\n    "dev": "vite",/g' package.json || \
  sed -i '' 's/"scripts": {/"scripts": {\n    "dev": "vite",/g' package.json
fi

echo "Installation complete. Run 'npm run dev' to start the development server."
