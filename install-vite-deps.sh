
#!/bin/bash

echo "Installing Vite and project dependencies..."

# Install vite and other required packages
npm install vite @vitejs/plugin-react-swc lovable-tagger

# Make sure vite script is in package.json
if ! grep -q '"dev": "vite"' package.json; then
  sed -i 's/"scripts": {/"scripts": {\n    "dev": "vite",/g' package.json || \
  sed -i '' 's/"scripts": {/"scripts": {\n    "dev": "vite",/g' package.json
fi

echo "Installation complete. Run 'npm run dev' to start the development server."
