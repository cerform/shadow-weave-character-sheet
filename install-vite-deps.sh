
#!/bin/bash

echo "Installing Vite and project dependencies..."

# Install vite globally to ensure it's available
npm install -g vite

# Install the Lovable tagger for component tagging feature
npm install lovable-tagger --save-dev

# Install project dependencies
npm install

# Make sure vite script is in package.json
if ! grep -q '"dev": "vite"' package.json; then
  sed -i 's/"scripts": {/"scripts": {\n    "dev": "vite",/g' package.json || \
  sed -i '' 's/"scripts": {/"scripts": {\n    "dev": "vite",/g' package.json
fi

echo "Installation complete. Run 'npm run dev' to start the development server."
