
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
import PlayBattlePage from './pages/PlayBattlePage';
import DMDashboardPage from './pages/DMDashboardPage';
import { SessionProvider } from '@/contexts/SessionContext';
import { SocketProvider } from '@/contexts/SocketContext';
import GameRoomPage from './pages/GameRoomPage';
import NotFound from './pages/NotFound';

function App() {
  const location = useLocation();
  const [isCharacterPage, setIsCharacterPage] = useState(false);

  useEffect(() => {
    setIsCharacterPage(location.pathname === '/character-sheet' || location.pathname === '/sheet');
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
          <SessionProvider>
            <SocketProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/handbook" element={<HandbookPage />} />
                <Route path="/character-creation" element={<CharacterCreationPage />} />
                <Route path="/create" element={<CharacterCreationPage />} />
                <Route path="/character-sheet" element={<CharacterSheetPage />} />
                <Route path="/sheet" element={<CharacterSheetPage />} />
                <Route path="/spellbook" element={<SpellbookPage />} />
                <Route path="/battle" element={<PlayBattlePage />} />
                <Route path="/dm" element={<DMDashboardPage />} />
                <Route path="/dm/battle" element={<PlayBattlePage />} />
                <Route path="/scene" element={<PlayBattlePage />} />
                <Route path="/room/:roomCode" element={<GameRoomPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SocketProvider>
          </SessionProvider>
        </CharacterProvider>
      </CustomThemeProvider>
    </ThemeProvider>
  );
}

export default App;
