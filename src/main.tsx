
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Импорт всех тем CSS
import '../public/css/themes/warrior.css';
import '../public/css/themes/tavern-theme.css';
import '../public/css/themes/fire-wizard.css';
import '../public/css/themes/water-cleric.css';
import '../public/css/themes/nature-druid.css';
import '../public/css/themes/shadow-sorcerer.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
