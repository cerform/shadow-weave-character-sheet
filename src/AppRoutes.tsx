
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
import CharactersListPage from './pages/CharactersListPage'; // Добавляем импорт страницы списка персонажей

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
      <Route path="/characters" element={<CharactersListPage />} /> {/* Добавляем маршрут для страницы персонажей */}
      <Route path="/dm" element={<DMDashboardPage />} />
      <Route path="/battle" element={<BattleScenePage />} />
      {/* Добавляем перенаправление с /sheet на страницу персонажа */}
      <Route path="/sheet" element={<Navigate to="/character/:id" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
