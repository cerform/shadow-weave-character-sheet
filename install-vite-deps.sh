
#!/bin/bash

echo "Installing Vite and project dependencies..."

# Install Vite and necessary packages
npm install vite @vitejs/plugin-react-swc lovable-tagger

# Install core React dependencies
npm install react react-dom @types/react @types/react-dom

# Install shadcn components
npm install @radix-ui/react-tabs @radix-ui/react-separator @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-label @radix-ui/react-radio-group @radix-ui/react-switch @radix-ui/react-scroll-area class-variance-authority clsx tailwind-merge lucide-react

# Make our scripts executable
chmod +x install-vite-deps.sh
chmod +x run-vite.sh
if [ -f src/scripts/run-vite.sh ]; then
  chmod +x src/scripts/run-vite.sh
fi
if [ -f src/scripts/start-vite.js ]; then
  chmod +x src/scripts/start-vite.js
fi

# Check for vite.config.js or vite.config.ts
if [ ! -f vite.config.js ] && [ ! -f vite.config.ts ]; then
  echo 'import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
  }
});' > vite.config.js
  echo "Created vite.config.js"
fi

# Ensure index.html exists
if [ ! -f index.html ]; then
  echo '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DnD Character Sheet App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>' > index.html
  echo "Created index.html"
fi

# Install local version of Vite in node_modules
npm install --save-dev vite

echo "Installation complete! Run 'bash run-vite.sh' to start the development server."
