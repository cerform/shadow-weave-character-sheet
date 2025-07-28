
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
import GMDashboardPage from './pages/GMDashboardPage';
import DMDashboardPage from './pages/DMDashboardPage';
import PlayerDashboardPage from './pages/PlayerDashboardPage';
import BattleScenePage from './pages/BattleScenePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DebugPage from './pages/DebugPage';
import CharactersListPage from './pages/CharactersListPage';
import CharacterManagementPage from './pages/CharacterManagementPage';

// Ленивая загрузка страниц, зависящих от WebSocket
const GameRoomPage = React.lazy(() => import('./pages/GameRoomPage'));
const JoinSessionPage = React.lazy(() => import('./pages/JoinSessionPage'));
const BattleMapPageFixed = React.lazy(() => import('./pages/BattleMapPageFixed'));
const DMDashboardPageNew = React.lazy(() => import('./pages/DMDashboardPageNew'));

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
  const { loading, canAccessDMDashboard } = useProtectedRoute();
  
  if (loading) {
    return <LazyLoading />;
  }
  
  if (!canAccessDMDashboard) {
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
      
      {/* Маршруты DM с защитой */}
      <Route path="/dm" element={
        <ProtectedDMRoute>
          <DMDashboardPage />
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
          <React.Suspense fallback={<LazyLoading />}>
            <BattleMapPageFixed />
          </React.Suspense>
        </ProtectedDMRoute>
      } />
      
      {/* Маршруты игрока с защитой */}
      <Route path="/player" element={
        <ProtectedPlayerRoute>
          <PlayerDashboardPage />
        </ProtectedPlayerRoute>
      } />
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
      
      {/* GM Dashboard маршрут */}
      <Route path="/gm-dashboard" element={<GMDashboardPage />} />
      
      {/* Общедоступные маршруты */}
      <Route path="/spellbook" element={<SpellbookPage />} />
      <Route path="/character-creation" element={<CharacterCreationPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/handbook" element={<HandbookPage />} />
      <Route path="/character/:id" element={<CharacterViewPage />} />
      <Route path="/characters" element={<CharactersListPage />} />
      
      <Route path="/character-management" element={<CharacterManagementPage />} />
      
      {/* DM Dashboard - новая панель мастера */}
      <Route path="/dm-dashboard-new" element={
        <React.Suspense fallback={<LazyLoading />}>
          <DMDashboardPageNew />
        </React.Suspense>
      } />
      <Route path="/dm-dashboard-new/:sessionId" element={
        <React.Suspense fallback={<LazyLoading />}>
          <DMDashboardPageNew />
        </React.Suspense>
      } />
      
      {/* Маршрут для неизвестных путей */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
