
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeProvider as CustomThemeProvider } from "@/contexts/ThemeContext";
import Index from './pages/Index';
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
      <CustomThemeProvider>
        <CharacterProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/handbook" element={<HandbookPage />} />
            <Route path="/character-creation" element={<CharacterCreationPage />} />
            <Route path="/create" element={<CharacterCreationPage />} />
            <Route path="/character-sheet" element={<CharacterSheetPage />} />
            <Route path="/spellbook" element={<SpellbookPage />} />
          </Routes>
        </CharacterProvider>
      </CustomThemeProvider>
    </ThemeProvider>
  );
}

export default App;
