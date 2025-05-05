
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { CharacterProvider } from './contexts/CharacterContext';
import { SessionProvider } from './contexts/SessionContext';
import { Toaster } from './components/ui/toaster';
import { SocketProvider } from './contexts/SocketContext';
import { UserThemeProvider } from './contexts/UserThemeContext';
import './App.css';

// Импорт тем
import { themes } from '@/lib/themes';
// Делаем темы доступными глобально
if (typeof window !== 'undefined') {
  (window as any).themes = themes;
}

import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import CharacterCreationPage from './pages/CharacterCreationPage';
import JoinSessionPage from './pages/JoinSessionPage';
import DMSessionPage from './pages/DMSessionPage';
import PlayerSessionPage from './pages/PlayerSessionPage';
import SpellbookPage from './pages/SpellbookPage'; 
import HandbookPage from './pages/HandbookPage';
import CharactersListPage from './pages/CharactersListPage';
import PlayBattlePage from './pages/PlayBattlePage';
import DMDashboardPage from './pages/DMDashboardPage';
import CharacterViewPage from './pages/CharacterViewPage';
import ProfilePage from './pages/ProfilePage'; 
import NotFound from './pages/NotFound';

import AppDiceButton from './AppDiceButton';

const App = () => {
  // При монтировании компонента устанавливаем дефолтную тему
  useEffect(() => {
    // Инициализация основных процессов
    console.log('Инициализация приложения...');
    
    // Задаем дефолтную тему
    const savedTheme = localStorage.getItem('theme') || 'default';
    document.body.className = '';
    document.body.classList.add(`theme-${savedTheme}`);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Проверяем наличие тем перед их использованием
    const themesObj = themes;
    
    // Применяем стили для текущей темы
    const themeStyles = themesObj[savedTheme as keyof typeof themesObj] || themes.default;
    
    document.documentElement.style.setProperty('--theme-accent', themeStyles.accent);
    document.documentElement.style.setProperty('--theme-glow', themeStyles.glow);
    document.documentElement.style.setProperty('--theme-text-color', themeStyles.textColor);
    document.documentElement.style.setProperty('--theme-muted-text-color', themeStyles.mutedTextColor);
    document.documentElement.style.setProperty('--theme-card-background', themeStyles.cardBackground);
    document.documentElement.style.setProperty('--theme-button-text', themeStyles.buttonText || '#FFFFFF');
    document.documentElement.style.setProperty('--theme-button-background', themeStyles.buttonBackground || 'rgba(139, 90, 43, 0.8)');
    
    console.log('Монтирование React приложения в DOM...');
    
    // Когда все загрузилось успешно
    console.log('React приложение смонтировано успешно');
    
    console.log('Тема инициализирована:', savedTheme, themeStyles);
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <Router>
        <AuthProvider>
          <CharacterProvider>
            <SessionProvider>
              <UserThemeProvider>
                <SocketProvider>
                  <div className="app-container min-h-screen w-full">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/sheet" element={<CharacterSheetPage />} />
                      <Route path="/character-creation" element={<CharacterCreationPage />} />
                      <Route path="/character/:id" element={<CharacterViewPage />} />
                      <Route path="/join" element={<JoinSessionPage />} />
                      <Route path="/dm" element={<Navigate to="/dm-dashboard" replace />} />
                      <Route path="/dm-dashboard" element={<DMDashboardPage />} />
                      <Route path="/dm-session/:id" element={<DMSessionPage />} />
                      <Route path="/play" element={<PlayerSessionPage />} />
                      <Route path="/spellbook" element={<SpellbookPage />} />
                      <Route path="/handbook" element={<HandbookPage />} />
                      <Route path="/characters" element={<CharactersListPage />} />
                      <Route path="/battle" element={<PlayBattlePage />} />
                      <Route path="/dm/battle" element={<PlayBattlePage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <AppDiceButton />
                    <Toaster />
                  </div>
                </SocketProvider>
              </UserThemeProvider>
            </SessionProvider>
          </CharacterProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
