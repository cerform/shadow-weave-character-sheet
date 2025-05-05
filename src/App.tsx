
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { Toaster } from './components/ui/toaster';
import { useTheme } from './hooks/use-theme';
import { themes } from './lib/themes';
import { useUserTheme } from './hooks/use-user-theme';
import './App.css';

function App() {
  const { theme } = useTheme();
  const { activeTheme } = useUserTheme();
  
  // Применяем тему при загрузке приложения
  useEffect(() => {
    const applyTheme = () => {
      const themeToApply = activeTheme || theme || 'default';
      const currentTheme = themes[themeToApply as keyof typeof themes] || themes.default;
      
      // Устанавливаем атрибуты и классы
      document.documentElement.setAttribute('data-theme', themeToApply);
      document.body.className = '';
      document.body.classList.add(`theme-${themeToApply}`);
      
      // Устанавливаем CSS-переменные
      document.documentElement.style.setProperty('--background', currentTheme.background);
      document.documentElement.style.setProperty('--foreground', currentTheme.foreground);
      document.documentElement.style.setProperty('--primary', currentTheme.primary);
      document.documentElement.style.setProperty('--accent', currentTheme.accent);
      document.documentElement.style.setProperty('--text-color', currentTheme.textColor);
      document.documentElement.style.setProperty('--card-bg', currentTheme.cardBackground);
      
      console.log('Тема применена при инициализации:', themeToApply);
    };
    
    applyTheme();
  }, [theme, activeTheme]);

  return (
    <BrowserRouter>
      <div className="app-container">
        <AppRoutes />
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
