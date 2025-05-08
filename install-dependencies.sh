
#!/bin/bash

echo "Installing dependencies..."

# Install Vite and necessary packages
npm install --save-dev vite @vitejs/plugin-react-swc typescript

# Install core React dependencies if they're not already installed
npm install react react-dom @types/react @types/react-dom

# Install UI components
npm install @radix-ui/react-tabs @radix-ui/react-separator @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-label @radix-ui/react-radio-group @radix-ui/react-switch @radix-ui/react-scroll-area class-variance-authority clsx tailwind-merge lucide-react

# Make our script executable
chmod +x install-dependencies.sh
chmod +x run-vite.sh

echo "Dependencies installed! Run 'bash run-vite.sh' to start the application."
