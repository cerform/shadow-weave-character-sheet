
#!/bin/bash

# Core dependencies
npm install react react-dom typescript
npm install @types/react @types/react-dom @types/react-router-dom
npm install vite @vitejs/plugin-react-swc
npm install react-router-dom
npm install @types/node --save-dev

# UI and styling
npm install tailwindcss postcss autoprefixer --save-dev
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# shadcn dependencies
npm install @radix-ui/react-slot @radix-ui/react-tabs
npm install @radix-ui/react-scroll-area
npm install @radix-ui/react-separator

# Add vite dev command
npx vite
