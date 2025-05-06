
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProfilePage from './pages/ProfilePage';
import SpellbookPage from './pages/SpellbookPage';
import CharacterCreationPage from './pages/CharacterCreationPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import AuthPage from './pages/AuthPage';

// Импорт созданных нами компонентов
import MobileAppLayout from './components/mobile-app/MobileAppLayout';
import MobileCharacterSheet from './components/character-sheet/MobileCharacterSheet';
import MobileCharacterCreationPage from './pages/MobileCharacterCreationPage';

// Временные компоненты-заглушки для недостающих страниц
const HomePage = () => <div>Главная страница</div>;
const Handbook = () => <div>Справочник</div>;
const HandbookCategory = () => <div>Категория справочника</div>;
const CharactersPage = () => <div>Список персонажей</div>;
const NotFoundPage = () => <div>Страница не найдена</div>;
const DMPage = () => <div>Страница мастера</div>;
const BattleMap = () => <div>Карта боя</div>;

// Простой компонент для защиты маршрутов
const RequireAuth = ({ children, requireDM }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (requireDM && user?.role !== 'dm') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

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
      
      {/* Используем компонент-обертку для передачи пропсов */}
      <Route 
        path="/character-sheet/:id" 
        element={
          <CharacterSheetWrapper isMobile={isMobile} />
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
          <RequireAuth requireDM={false}>
            <ProfilePage />
          </RequireAuth>
        }
      />
      
      {/* DM Only Routes */}
      <Route
        path="/dm"
        element={
          <RequireAuth requireDM={true}>
            <DMPage />
          </RequireAuth>
        }
      />
      <Route
        path="/battle"
        element={
          <RequireAuth requireDM={true}>
            <BattleMap />
          </RequireAuth>
        }
      />
      
      {/* Fallback маршрут */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Компонент-обертка для передачи пропсов в CharacterSheetPage
const CharacterSheetWrapper = ({ isMobile }) => {
  return (
    <CharacterSheetPage 
      renderMobileVersion={(character, onUpdate) => 
        isMobile ? <MobileCharacterSheet character={character} onUpdate={onUpdate} /> : null
      }
    />
  );
};

export default AppRoutes;
