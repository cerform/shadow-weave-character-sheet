
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import Home from './pages/Home';
import HandbookPage from './pages/HandbookPage';
import CharacterCreationPage from './pages/CharacterCreationPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import { CharacterProvider } from '@/contexts/CharacterContext';
import SpellbookPage from './pages/SpellbookPage';

function App() {
  const location = useLocation();
  const [isCharacterPage, setIsCharacterPage] = useState(false);

  useEffect(() => {
    setIsCharacterPage(location.pathname === '/character-sheet');
  }, [location]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CharacterProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/handbook" element={<HandbookPage />} />
          <Route path="/character-creation" element={<CharacterCreationPage />} />
          <Route path="/character-sheet" element={<CharacterSheetPage />} />
          <Route path="/spellbook" element={<SpellbookPage />} />
        </Routes>
      </CharacterProvider>
    </ThemeProvider>
  );
}

export default App;
