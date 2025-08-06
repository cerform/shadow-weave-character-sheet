
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Импортируем страницы
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import AuthPage from './pages/AuthPage';
import DndSpellsPage from './pages/DndSpellsPage';
import SpellbookPage from './pages/SpellbookPage';
import CharacterCreationPage from './pages/CharacterCreationPage';
import ProfilePage from './pages/ProfilePage';
import HandbookPage from './pages/HandbookPage';
import CharacterViewPage from './pages/CharacterViewPage';

import BattleScenePage from './pages/BattleScenePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DebugPage from './pages/DebugPage';
import AdminPage from './pages/AdminPage';
import CharactersListPage from './pages/CharactersListPage';
import CharacterManagementPage from './pages/CharacterManagementPage';

// Ленивая загрузка страниц, зависящих от WebSocket
const GameRoomPage = React.lazy(() => import('./pages/GameRoomPage'));
const JoinSessionPage = React.lazy(() => import('./pages/JoinSessionPage'));
const TestPage = React.lazy(() => import('./pages/TestPage'));

// Импортируем страницы напрямую
import DMDashboardPageNew from './pages/DMDashboardPageNew';
import BattleMapPageFixed from './pages/BattleMapPageFixed';

// Импорт хука для защиты маршрутов
import { useProtectedRoute } from './hooks/use-auth';

// Компонент Fallback для ленивой загрузки
const LazyLoading = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

// Компонент для защиты маршрутов DM
const ProtectedDMRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, canAccessDMDashboard, isAuthenticated } = useProtectedRoute();
  
  console.log('ProtectedDMRoute check:', { loading, canAccessDMDashboard, isAuthenticated });
  
  if (loading) {
    return <LazyLoading />;
  }
  
  if (!canAccessDMDashboard) {
    console.log('Redirecting to /unauthorized - no DM access');
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Компонент для защиты админских маршрутов
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, isAdmin, isAuthenticated } = useProtectedRoute();
  
  console.log('ProtectedAdminRoute check:', { loading, isAdmin, isAuthenticated });
  
  if (loading) {
    return <LazyLoading />;
  }
  
  if (!isAdmin) {
    console.log('Redirecting to /unauthorized - no admin access');
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Компонент для защиты маршрутов игрока
const ProtectedPlayerRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, canAccessPlayerDashboard } = useProtectedRoute();
  
  if (loading) {
    return <LazyLoading />;
  }
  
  if (!canAccessPlayerDashboard) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Компонент для маршрутизации на основе роли
const RoleBasedRedirect = () => {
  const { loading, isDM, isPlayer } = useProtectedRoute();
  
  if (loading) {
    return <LazyLoading />;
  }
  
  if (isDM) {
    return <Navigate to="/dm" replace />;
  }
  
  if (isPlayer) {
    return <Navigate to="/player" replace />;
  }
  
  return <Navigate to="/auth" replace />;
};

const AppRoutes: React.FC = () => {
  console.log('AppRoutes: Инициализация маршрутов');
  console.log('DndSpellsPage импортирована:', DndSpellsPage);
  console.log('AdminPage импортирована:', AdminPage);
  console.log('DMDashboardPageNew импортирована:', DMDashboardPageNew);
  console.log('BattleMapPageFixed импортирована:', BattleMapPageFixed);
  console.log('HomePage импортирована:', HomePage);
  console.log('window.location.pathname:', window.location.pathname);
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/dashboard" element={<RoleBasedRedirect />} />
      
      {/* Добавляем страницу заклинаний D&D в начало списка */}
      <Route 
        path="/dnd-spells" 
        element={<DndSpellsPage />} 
      />
      
      {/* DM Dashboard New маршрут - перемещаем выше */}
      <Route path="/dm-dashboard-new" element={<DMDashboardPageNew />} />
      
      {/* Battle Map маршрут без защиты для доступа с главной */}
      <Route path="/battle-map-fixed" element={
        <ProtectedDMRoute>
          <BattleMapPageFixed />
        </ProtectedDMRoute>
      } />
      
      {/* Маршруты DM с защитой - новая панель */}
      <Route path="/dm" element={
        <ProtectedDMRoute>
          <DMDashboardPageNew />
        </ProtectedDMRoute>
      } />
      <Route path="/dm-session/:id" element={
        <ProtectedDMRoute>
          <React.Suspense fallback={<LazyLoading />}>
            <GameRoomPage />
          </React.Suspense>
        </ProtectedDMRoute>
      } />
      <Route path="/battle" element={
        <ProtectedDMRoute>
          <BattleScenePage />
        </ProtectedDMRoute>
      } />
      <Route path="/battle/:sessionId" element={
        <ProtectedDMRoute>
          <BattleMapPageFixed />
        </ProtectedDMRoute>
      } />
      
      {/* Удаляем неиспользуемые маршруты игрока */}
      <Route path="/join-session" element={
        <ProtectedPlayerRoute>
          <React.Suspense fallback={<LazyLoading />}>
            <JoinSessionPage />
          </React.Suspense>
        </ProtectedPlayerRoute>
      } />
      
      {/* Перенаправление для исправленных URL */}
      <Route path="/join-game" element={<Navigate to="/join-session" replace />} />
      
      {/* Добавляем маршрут для отладки */}
      <Route path="/debug" element={<DebugPage />} />
      
      {/* Удаляем старые перенаправления */}
      
      {/* Общедоступные маршруты */}
      <Route path="/spellbook" element={<SpellbookPage />} />
      <Route path="/character-creation" element={<CharacterCreationPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/handbook" element={<HandbookPage />} />
      <Route path="/character/:id" element={<CharacterViewPage />} />
      <Route path="/characters" element={<CharactersListPage />} />
      <Route path="/character-management" element={<CharacterManagementPage />} />
      
      {/* Маршрут для сессий */}
      <Route path="/session" element={
        <React.Suspense fallback={<LazyLoading />}>
          <JoinSessionPage />
        </React.Suspense>
      } />
      
      {/* DM Dashboard маршруты */}
      <Route path="/dm-dashboard" element={<DMDashboardPageNew />} />
      <Route path="/dm-dashboard/:sessionId" element={<DMDashboardPageNew />} />
      
      
      
      {/* Тестовая страница для отладки */}
      <Route path="/test" element={
        <React.Suspense fallback={<LazyLoading />}>
          <TestPage />
        </React.Suspense>
      } />
      
      {/* Админская панель */}
      <Route path="/admin" element={
        <ProtectedAdminRoute>
          <AdminPage />
        </ProtectedAdminRoute>
      } />
      
      {/* Маршрут для неизвестных путей */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
