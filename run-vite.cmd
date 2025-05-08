
@echo off
echo Starting D&D Character Sheet Application...

:: Проверяем наличие node_modules, если нет - устанавливаем зависимости
if not exist node_modules (
  echo Node modules not found. Installing dependencies first...
  call npm install --legacy-peer-deps
)

:: Проверяем наличие локального vite
if exist .\node_modules\.bin\vite.cmd (
  echo Using local vite installation
  call .\node_modules\.bin\vite
) else (
  :: Используем npx vite
  echo Using npx vite
  call npx vite
)

echo Application stopped.
pause
