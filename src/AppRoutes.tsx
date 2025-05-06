
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import CharacterEditPage from './pages/CharacterEditPage';
import BattlePage from './pages/BattlePage';
import Home from './pages/Home';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/character/:id" element={<CharacterEditPage />} />
      <Route path="/battle/:sessionId" element={<BattlePage />} />
      <Route path="/new-home" element={<Home />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
