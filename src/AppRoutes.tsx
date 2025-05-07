
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/use-auth';
import ProfilePage from './pages/ProfilePage';
import SpellbookPage from './pages/SpellbookPage';
import CharacterCreationPage from './pages/CharacterCreationPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import CharactersListPage from './pages/CharactersListPage';
import AuthPage from './pages/AuthPage';
import Index from './pages/Index';

// Импорт созданных нами компонентов
import MobileAppLayout from './components/mobile-app/MobileAppLayout';
import MobileCharacterSheet from './components/character-sheet/MobileCharacterSheet';
import MobileCharacterCreationPage from './pages/MobileCharacterCreationPage';

// Временные компоненты-заглушки для недостающих страниц
const Handbook = () => <div>Справочник</div>;
const HandbookCategory = () => <div>Категория справочника</div>;
const NotFoundPage = () => <div>Страница не найдена</div>;
const DMPage = () => <div>Страница мастера</div>;
const BattleMap = () => <div>Карта боя</div>;

// Простой компонент для защиты маршрутов
const RequireAuth = ({ children, requireDM }: { children: React.ReactNode, requireDM: boolean }) => {
  // Используем авторизацию без явного приведения типов
  const auth = useAuth();
  const { isAuthenticated, currentUser } = auth;
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  // Check for role or isDM property
  if (requireDM && !(currentUser?.role === 'dm' || currentUser?.isDM)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  // Используем авторизацию без явного приведения типов
  const auth = useAuth();
  const { isAuthenticated } = auth;
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
    
    // Логируем информацию о маршрутизации
    console.log('AppRoutes: инициализация маршрутизации');
    console.log('AppRoutes: isAuthenticated =', isAuthenticated);
    console.log('AppRoutes: isMobile =', isMobile);
    
    setLoading(false);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isAuthenticated]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={<Index />} />
      
      {/* Руководства */}
      <Route path="/handbook" element={<Handbook />} />
      <Route path="/handbook/:category" element={<HandbookCategory />} />
      <Route path="/spellbook" element={<SpellbookPage />} />
      
      {/* Персонажи и управление ими */}
      <Route path="/characters" element={<CharactersListPage />} />
      <Route path="/character-creation" element={isMobile ? <MobileCharacterCreationPage /> : <CharacterCreationPage />} />
      <Route path="/character-sheet/:id" element={<CharacterSheetPage />} />
      <Route path="/character/:id" element={<Navigate to={`/character-sheet/:id`} replace />} />
      
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

export default AppRoutes;
