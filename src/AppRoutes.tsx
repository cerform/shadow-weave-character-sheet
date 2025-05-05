
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Импортируем страницы
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import AuthPage from './pages/AuthPage';
import SpellbookPage from './pages/SpellbookPage';
import CharacterCreationPage from './pages/CharacterCreationPage';
import ProfilePage from './pages/ProfilePage';
import HandbookPage from './pages/HandbookPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import DMDashboardPage from './pages/DMDashboardPage';
import BattleScenePage from './pages/BattleScenePage';
import CharactersListPage from './pages/CharactersListPage';

// Ленивая загрузка страницы игровой сессии
const GameRoomPage = React.lazy(() => import('./pages/GameRoomPage'));
const JoinSessionPage = React.lazy(() => import('./pages/JoinSessionPage'));

// Компонент Fallback для ленивой загрузки
const LazyLoading = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/spellbook" element={<SpellbookPage />} />
      <Route path="/character-creation" element={<CharacterCreationPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/handbook" element={<HandbookPage />} />
      <Route path="/character/:id" element={<CharacterSheetPage />} />
      <Route path="/characters" element={<CharactersListPage />} />
      <Route path="/dm" element={<DMDashboardPage />} />
      <Route path="/battle" element={<BattleScenePage />} />
      
      {/* Ленивая загрузка страниц, зависящих от WebSocket */}
      <Route path="/game/:id" element={
        <React.Suspense fallback={<LazyLoading />}>
          <GameRoomPage />
        </React.Suspense>
      } />
      <Route path="/join-session" element={
        <React.Suspense fallback={<LazyLoading />}>
          <JoinSessionPage />
        </React.Suspense>
      } />
      
      {/* Перенаправления */}
      <Route path="/sheet" element={<Navigate to="/characters" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
