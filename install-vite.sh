
#!/bin/bash

# Install Vite
npm install -g vite

# Ensure needed packages are installed
npm install react react-dom typescript
npm install @vitejs/plugin-react-swc vite --save-dev

# Create a minimal tsconfig.json if needed
if [ ! -f tsconfig.json ]; then
  echo '{
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "paths": {
        "@/*": ["./src/*"]
      }
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }' > tsconfig.json
fi

# Create tsconfig.node.json if needed
if [ ! -f tsconfig.node.json ]; then
  echo '{
    "compilerOptions": {
      "composite": true,
      "skipLibCheck": true,
      "module": "ESNext",
      "moduleResolution": "bundler",
      "allowSyntheticDefaultImports": true
    },
    "include": ["vite.config.ts"]
  }' > tsconfig.node.json
fi

echo "Vite and necessary dependencies installed. Run 'npm run dev' to start the dev server."
