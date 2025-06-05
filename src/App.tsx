import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SpellbookPage from './pages/SpellbookPage';
import DndSpellsPage from './pages/DndSpellsPage';
import CharacterManagementPage from '@/pages/CharacterManagementPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/spellbook" element={<SpellbookPage />} />
        <Route path="/dnd-spells" element={<DndSpellsPage />} />
        <Route path="/character-management" element={<CharacterManagementPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
