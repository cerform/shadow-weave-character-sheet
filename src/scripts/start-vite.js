
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Получаем путь к бинарнику vite из node_modules
const viteBinPath = path.resolve(__dirname, '../../node_modules/.bin/vite');

// Запускаем vite
const viteProcess = spawn(viteBinPath, [], { 
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('Ошибка при запуске Vite:', error);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  console.log(`Vite завершился с кодом ${code}`);
  process.exit(code);
});
