
@echo off
echo Starting D&D Character Sheet Application...

if not exist node_modules (
  echo Installing dependencies with legacy-peer-deps...
  npm install --legacy-peer-deps
)

echo Starting the application...
npx vite

echo Press any key to exit...
pause >nul
