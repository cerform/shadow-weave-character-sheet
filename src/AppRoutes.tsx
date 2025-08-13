import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Импортируем страницы через @/ alias
import HomePage from '@/pages/HomePage';
import NotFound from '@/pages/NotFound';
import AuthPage from '@/pages/AuthPage';
import DndSpellsPage from '@/pages/DndSpellsPage';
import SpellbookPage from '@/pages/SpellbookPage';
import CharacterCreationPage from '@/pages/CharacterCreationPage';
import ProfilePage from '@/pages/ProfilePage';
import HandbookPage from '@/pages/HandbookPage';
import CharacterViewPage from '@/pages/CharacterViewPage';
import CharacterSheetPage from '@/pages/CharacterSheetPage';

import UnauthorizedPage from '@/pages/UnauthorizedPage';
import DebugPage from '@/pages/DebugPage';
import AdminPage from '@/pages/AdminPage';
import CharactersListPage from '@/pages/CharactersListPage';
import CharacterManagementPage from '@/pages/CharacterManagementPage';
import DMDashboardPageNew from '@/pages/DMDashboardPageNew';
import DMSessionPage from '@/pages/DMSessionPage';

import DMMapGenerator3D from '@/pages/DMMapGenerator3D';
import BattleMap3DPage from '@/pages/BattleMap3DPage';
import AdminAssetsPage from '@/pages/AdminAssetsPage';
import DMMapEditorPage from '@/pages/DMMapEditorPage';
import PlayerMapPage from '@/pages/PlayerMapPage';


// Ленивая загрузка страниц, зависящих от WebSocket
const GameRoomPage = React.lazy(() => import('@/pages/GameRoomPage'));
const JoinSessionPage = React.lazy(() => import('@/pages/JoinSessionPage'));
const TestPage = React.lazy(() => import('@/pages/TestPage'));

// Импорт хука для защиты маршрутов
import { useProtectedRoute } from '@/hooks/use-auth';

// Компонент Fallback для ленивой загрузки
const LazyLoading = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

// Компонент для защиты маршрутов DM
const ProtectedDMRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, canAccessDMDashboard, isAuthenticated, isAdmin } = useProtectedRoute();
  
  console.log('ProtectedDMRoute check:', { loading, canAccessDMDashboard, isAuthenticated, isAdmin });
  
  if (loading) {
    return <LazyLoading />;
  }
  
  // Админы имеют доступ ко всем DM функциям
  if (!canAccessDMDashboard && !isAdmin) {
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
    return <Navigate to="/characters" replace />;
  }
  
  return <Navigate to="/auth" replace />;
};

const AppRoutes: React.FC = () => {
  console.log('AppRoutes: Инициализация маршрутов');
  console.log('DndSpellsPage импортирована:', DndSpellsPage);
  console.log('AdminPage импортирована:', AdminPage);
  console.log('DMDashboardPageNew импортирована:', DMDashboardPageNew);
  console.log('BattleMap3DPage импортирована:', BattleMap3DPage);
  console.log('HomePage импортирована:', HomePage);
  console.log('window.location.pathname:', window.location.pathname);
  
  return (
    <Routes>
      {/* Главная страница */}
      <Route path="/" element={<HomePage />} />
      
      {/* Аутентификация */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/dashboard" element={<RoleBasedRedirect />} />
      
      {/* Общедоступные страницы */}
      <Route path="/spellbook" element={<SpellbookPage />} />
      <Route path="/handbook" element={<HandbookPage />} />
      <Route path="/dnd-spells" element={<DndSpellsPage />} />
      
      {/* Персонажи */}
      <Route path="/character-creation" element={<CharacterCreationPage />} />
      <Route path="/characters" element={<CharactersListPage />} />
      <Route path="/character/:id" element={<CharacterViewPage />} />
      <Route path="/character-sheet/:id" element={<CharacterSheetPage />} />
      <Route path="/character-management" element={<CharacterManagementPage />} />
      
      {/* Профиль */}
      <Route path="/profile" element={<ProfilePage />} />
      
      {/* DM маршруты с защитой */}
      <Route path="/dm" element={
        <ProtectedDMRoute>
          <DMDashboardPageNew />
        </ProtectedDMRoute>
      } />
      <Route path="/dm-map-3d" element={
        <ProtectedDMRoute>
          <DMMapGenerator3D />
        </ProtectedDMRoute>
      } />
      <Route path="/battle-map-3d" element={
        <ProtectedDMRoute>
          <BattleMap3DPage />
        </ProtectedDMRoute>
      } />
      <Route path="/dm-session/:sessionId" element={
        <ProtectedDMRoute>
          <DMSessionPage />
        </ProtectedDMRoute>
      } />
      <Route path="/dm/map-editor/:mapId" element={
        <ProtectedDMRoute>
          <DMMapEditorPage />
        </ProtectedDMRoute>
      } />
      <Route path="/player/map/:mapId" element={
        <ProtectedPlayerRoute>
          <PlayerMapPage />
        </ProtectedPlayerRoute>
      } />

      
      {/* Админские маршруты */}
      <Route path="/admin" element={
        <ProtectedAdminRoute>
          <AdminPage />
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/assets" element={
        <ProtectedAdminRoute>
          <AdminAssetsPage />
        </ProtectedAdminRoute>
      } />
      
      {/* Игровые сессии */}
      <Route path="/join-session" element={
        <ProtectedPlayerRoute>
          <React.Suspense fallback={<LazyLoading />}>
            <JoinSessionPage />
          </React.Suspense>
        </ProtectedPlayerRoute>
      } />
      <Route path="/session" element={
        <React.Suspense fallback={<LazyLoading />}>
          <JoinSessionPage />
        </React.Suspense>
      } />
      
      {/* Устаревшие редиректы */}
      <Route path="/join-game" element={<Navigate to="/join-session" replace />} />
      <Route path="/dm-dashboard" element={<Navigate to="/dm" replace />} />
      <Route path="/dm-dashboard-new" element={<Navigate to="/dm" replace />} />
      <Route path="/dm-dashboard/:sessionId" element={<Navigate to="/dm" replace />} />
      
      {/* Отладочные страницы */}
      <Route path="/debug" element={<DebugPage />} />
      <Route path="/test" element={
        <React.Suspense fallback={<LazyLoading />}>
          <TestPage />
        </React.Suspense>
      } />

      {/* Fallback - страница не найдена */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;