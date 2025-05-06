import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import Handbook from './pages/Handbook';
import HandbookCategory from './pages/HandbookCategory';
import SpellbookPage from './pages/SpellbookPage';
import CharacterCreationPage from './pages/CharacterCreationPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import CharactersPage from './pages/CharactersPage';
import NotFoundPage from './pages/NotFoundPage';
import RequireAuth from './components/auth/RequireAuth';
import DMPage from './pages/DMPage';
import BattleMap from './pages/BattleMap';

// Импорт созданных нами компонентов
import MobileAppLayout from './components/mobile-app/MobileAppLayout';
import MobileCharacterSheet from './components/character-sheet/MobileCharacterSheet';
import MobileCharacterCreationPage from './pages/MobileCharacterCreationPage';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Определяем, является ли устройство мобильным
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={isMobile ? <MobileAppLayout>Добро пожаловать</MobileAppLayout> : <HomePage />} />
      
      {/* Руководства */}
      <Route path="/handbook" element={<Handbook />} />
      <Route path="/handbook/:category" element={<HandbookCategory />} />
      <Route path="/spellbook" element={<SpellbookPage />} />
      
      {/* Создание персонажа и управление ими */}
      <Route 
        path="/character-creation" 
        element={isMobile ? <MobileCharacterCreationPage /> : <CharacterCreationPage />} 
      />
      <Route 
        path="/character-sheet/:id" 
        element={
          <CharacterSheetPage 
            renderMobileVersion={(character, onUpdate) => (
              isMobile ? <MobileCharacterSheet character={character} onUpdate={onUpdate} /> : null
            )} 
          />
        } 
      />
      <Route path="/characters" element={<CharactersPage />} />
      
      {/* Аутентификация */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/register" element={<Navigate to="/auth" replace />} />
      
      {/* Защищенные маршруты */}
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      
      {/* DM Only Routes */}
      <Route
        path="/dm"
        element={
          <RequireAuth requireDM>
            <DMPage />
          </RequireAuth>
        }
      />
      <Route
        path="/battle"
        element={
          <RequireAuth requireDM>
            <BattleMap />
          </RequireAuth>
        }
      />
      
      {/* Fallback маршрут */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
