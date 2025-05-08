
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Get path to vite binary from node_modules
const viteBinPath = path.resolve(__dirname, '../../node_modules/.bin/vite');

// Launch vite
const viteProcess = spawn(viteBinPath, [], { 
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('Error starting Vite:', error);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
  process.exit(code);
});
