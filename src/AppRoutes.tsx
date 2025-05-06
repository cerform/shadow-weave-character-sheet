import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CharactersListPage from './pages/CharactersListPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import CharacterCreationPage from './pages/CharacterCreationPage';
import CharacterEditPage from './pages/CharacterEditPage';
import BattlePage from './pages/BattlePage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PlayerSessionPage from './pages/PlayerSessionPage';
import GameRoomPage from './pages/GameRoomPage';
import NotFoundPage from './pages/NotFoundPage';
/* Добавляем импорты для новых страниц сессий */
import CreateSessionPage from "./pages/CreateSessionPage";
import JoinSessionPage from "./pages/JoinSessionPage";
import SessionPage from "./pages/SessionPage";
import DMSessionPage from "./pages/DMSessionPage";
import DMDashboardPage from "./pages/DMDashboardPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Основные маршруты */}
      <Route path="/" element={<HomePage />} />
      <Route path="/characters" element={<CharactersListPage />} />
      <Route path="/character-sheet" element={<CharacterSheetPage />} />
      <Route path="/character-creation" element={<CharacterCreationPage />} />
      <Route path="/character-edit/:id" element={<CharacterEditPage />} />
      <Route path="/character/:id" element={<CharacterSheetPage />} />
      <Route path="/battle/:sessionId" element={<BattlePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/session" element={<PlayerSessionPage />} />
      <Route path="/game-room/:roomCode" element={<GameRoomPage />} />
      
      {/* Маршруты сессий */}
      <Route path="/create-session" element={<CreateSessionPage />} />
      <Route path="/join/:sessionId" element={<JoinSessionPage />} />
      <Route path="/join" element={<JoinSessionPage />} />
      <Route path="/session/:sessionId" element={<SessionPage />} />
      <Route path="/dm-session/:sessionId" element={<DMSessionPage />} />
      <Route path="/dm-dashboard" element={<DMDashboardPage />} />
      
      {/* Другие маршруты и 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
