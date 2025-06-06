
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SpellbookPage from './pages/SpellbookPage';
import DndSpellsPage from './pages/DndSpellsPage';
import CharacterManagementPage from '@/pages/CharacterManagementPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spellbook" element={<SpellbookPage />} />
        <Route path="/dnd-spells" element={<DndSpellsPage />} />
        <Route path="/character-management" element={<CharacterManagementPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
