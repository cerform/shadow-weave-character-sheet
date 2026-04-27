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
import HooksDebugPage from '@/pages/HooksDebugPage';
import AdminPage from '@/pages/AdminPage';
import AdminTestingPage from '@/pages/admin/AdminTestingPage';
import TestReportsPage from '@/pages/admin/TestReportsPage';
import ErrorLogsPage from '@/pages/admin/ErrorLogsPage';
import CharactersListPage from '@/pages/CharactersListPage';
import CharacterManagementPage from '@/pages/CharacterManagementPage';
import DMDashboardPageNew from '@/pages/DMDashboardPageNew';
import DMSessionPage from '@/pages/DMSessionPage';
import PlayerBattleMapPage from '@/pages/PlayerBattleMapPage';
import PlayerSessionsPage from '@/pages/PlayerSessionsPage';

// import DMMapGenerator3D from '@/pages/DMMapGenerator3D';
// import BattleMap3DPage from '@/pages/BattleMap3DPage';
// import EnhancedBattleScene from '@/pages/EnhancedBattleScene';
// import BattleMap2DPage from '@/pages/BattleMap2DPage';
import AdminAssetsPage from '@/pages/AdminAssetsPage';
import DMMapEditorPage from '@/pages/DMMapEditorPage';
import PlayerMapPage from '@/pages/PlayerMapPage';
import UnifiedBattlePage from '@/pages/UnifiedBattlePage';
import VTTBattlePage from '@/pages/VTTBattlePage';
import { BestiaryPage } from '@/components/bestiary/BestiaryPage';
import BattleMapPage from '@/pages/BattleMapPage';
import DnD5ePage from '@/pages/DnD5ePage';


// Ленивая загрузка страниц, зависящих от WebSocket
const GameRoomPage = React.lazy(() => import('@/pages/GameRoomPage'));
const JoinSessionPage = React.lazy(() => import('@/pages/JoinSessionPage'));
const CreateSessionPage = React.lazy(() => import('@/pages/CreateSessionPage'));
const TestPage = React.lazy(() => import('@/pages/TestPage'));

// Импорт хука для защиты маршрутов
import { useProtectedRoute } from '@/hooks/use-auth';

// Компонент Fallback для ленивой загрузки
const LazyLoading = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

// Route guard: DM or Admin only
const ProtectedDMRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, canAccessDMDashboard, isAuthenticated, isDM, isAdmin } = useProtectedRoute();

  if (loading) return <LazyLoading />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isDM && !isAdmin && !canAccessDMDashboard) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};

// Route guard: Admin only
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, isAdmin, isAuthenticated } = useProtectedRoute();

  if (loading) return <LazyLoading />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;

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

// Компонент для защиты маршрутов, требующих только аутентификацию
const ProtectedAuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, isAuthenticated } = useProtectedRoute();
  
  if (loading) {
    return <LazyLoading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
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
      <Route path="/dnd5e-combat" element={<DnD5ePage />} />
      
      {/* Бестиарий - только для ДМ */}
      <Route path="/bestiary" element={
        <ProtectedDMRoute>
          <BestiaryPage isDM={true} />
        </ProtectedDMRoute>
      } />
      
      {/* Объединенная боевая система */}
      <Route path="/unified-battle" element={<UnifiedBattlePage />} />
      
      {/* WebGL VTT Engine (BG3 Tactical Style) */}
      <Route path="/vtt/:sessionId" element={
        <ProtectedAuthRoute>
          <VTTBattlePage />
        </ProtectedAuthRoute>
      } />
      
      {/* Устаревшие боевые системы (редиректы) */}
      <Route path="/battle-map-3d" element={<Navigate to="/unified-battle" replace />} />
      <Route path="/integrated-battle" element={<Navigate to="/unified-battle" replace />} />
      
      
      {/* Characters — require auth */}
      <Route path="/character-creation" element={
        <ProtectedAuthRoute>
          <CharacterCreationPage />
        </ProtectedAuthRoute>
      } />
      <Route path="/characters" element={
        <ProtectedAuthRoute>
          <CharactersListPage />
        </ProtectedAuthRoute>
      } />
      <Route path="/character/:id" element={
        <ProtectedAuthRoute>
          <CharacterViewPage />
        </ProtectedAuthRoute>
      } />
      <Route path="/character-sheet/:id" element={
        <ProtectedAuthRoute>
          <CharacterSheetPage />
        </ProtectedAuthRoute>
      } />
      <Route path="/character-management" element={
        <ProtectedAuthRoute>
          <CharacterManagementPage />
        </ProtectedAuthRoute>
      } />
      
      {/* Профиль */}
      <Route path="/profile" element={<ProfilePage />} />
      
      {/* DM маршруты с защитой */}
      <Route path="/dm" element={
        <ProtectedDMRoute>
          <DMDashboardPageNew />
        </ProtectedDMRoute>
      } />
      
      <Route path="/dm/session/:sessionId" element={
        <ProtectedDMRoute>
          <DMSessionPage />
        </ProtectedDMRoute>
      } />
      
      {/* Обратная совместимость со старым путем */}
      <Route path="/dm-session/:sessionId" element={
        <ProtectedDMRoute>
          <DMSessionPage />
        </ProtectedDMRoute>
      } />
      
      <Route path="/dm/battle-map/:sessionId" element={
        <ProtectedDMRoute>
          <BattleMapPage />
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
      
      {/* Маршруты игрока */}
      <Route path="/player-sessions" element={
        <ProtectedPlayerRoute>
          <PlayerSessionsPage />
        </ProtectedPlayerRoute>
      } />
      
      <Route path="/player-session/:sessionId" element={
        <ProtectedAuthRoute>
          <PlayerBattleMapPage />
        </ProtectedAuthRoute>
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
      <Route path="/admin/error-logs" element={
        <ProtectedAdminRoute>
          <ErrorLogsPage />
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/testing" element={
        <ProtectedAdminRoute>
          <AdminTestingPage />
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/test-reports" element={
        <ProtectedAdminRoute>
          <TestReportsPage />
        </ProtectedAdminRoute>
      } />
      
      {/* Игровые сессии */}
      {/* /join и /join-session — публичные, не требуют авторизации */}
      <Route path="/join" element={
        <React.Suspense fallback={<LazyLoading />}>
          <JoinSessionPage />
        </React.Suspense>
      } />
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

      {/* Создание сессии — новый пошаговый мастер */}
      <Route path="/create-session" element={
        <ProtectedDMRoute>
          <React.Suspense fallback={<LazyLoading />}>
            <CreateSessionPage />
          </React.Suspense>
        </ProtectedDMRoute>
      } />
      
      {/* Устаревшие редиректы */}
      <Route path="/join-game" element={<Navigate to="/join" replace />} />
      <Route path="/dm-dashboard" element={<Navigate to="/dm" replace />} />
      <Route path="/dm-dashboard-new" element={<Navigate to="/dm" replace />} />
      <Route path="/dm-dashboard/:sessionId" element={<Navigate to="/dm" replace />} />
      
      {/* Отладочные страницы */}
      <Route path="/debug" element={<DebugPage />} />
      <Route path="/debug/hooks" element={<HooksDebugPage />} />
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