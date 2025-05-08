
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import CharacterCreationPage from './pages/CharacterCreationPage';
import CharacterViewPage from './pages/CharacterViewPage'; // Используем существующую страницу вместо CharacterDetailsPage
import CharactersListPage from './pages/CharactersListPage';
import SpellbookPage from './pages/SpellbookPage';
import HandbookPage from './pages/HandbookPage';
import DMDashboardPage from './pages/DMDashboardPage'; // Используем существующую страницу вместо DMPage
import AuthPage from './pages/AuthPage'; // Используем существующую страницу вместо Auth
import RecentCharactersPage from './pages/RecentCharactersPage';
import JoinSessionPage from './pages/JoinSessionPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/character-creation" element={<CharacterCreationPage />} />
        <Route path="/character/:id" element={<CharacterViewPage />} /> {/* Исправлено */}
        <Route path="/character/:id/edit" element={<CharacterCreationPage />} />
        <Route path="/characters" element={<CharactersListPage />} />
        <Route path="/recent-characters" element={<RecentCharactersPage />} />
        <Route path="/spellbook" element={<SpellbookPage />} />
        <Route path="/handbook" element={<HandbookPage />} />
        <Route path="/dm" element={<DMDashboardPage />} /> {/* Исправлено */}
        <Route path="/auth" element={<AuthPage />} /> {/* Исправлено */}
        <Route path="/join-session" element={<JoinSessionPage />} />
      </Routes>
    </Router>
  );
};

export default App;
