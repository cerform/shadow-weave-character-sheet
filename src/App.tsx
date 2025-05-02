
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
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
import DMSessionPage from './pages/DMSessionPage';
import { SessionProvider } from '@/contexts/SessionContext';
import { SocketProvider } from '@/contexts/SocketContext';
import GameRoomPage from './pages/GameRoomPage';
import NotFound from './pages/NotFound';
import PlayerSessionPage from './pages/PlayerSessionPage';

function App() {
  console.log("App rendering");

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
                <Route path="/create" element={<Navigate to="/character-creation" replace />} />
                <Route path="/character-sheet" element={<CharacterSheetPage />} />
                <Route path="/sheet" element={<Navigate to="/character-sheet" replace />} />
                <Route path="/spellbook" element={<SpellbookPage />} />
                <Route path="/battle" element={<PlayBattlePage />} />
                <Route path="/dm" element={<DMDashboardPage />} />
                <Route path="/dm/session" element={<DMSessionPage />} />
                <Route path="/dm/battle" element={<Navigate to="/battle" replace />} />
                <Route path="/scene" element={<Navigate to="/battle" replace />} />
                <Route path="/player/session" element={<PlayerSessionPage />} />
                <Route path="/session/:roomCode" element={<GameRoomPage />} />
                <Route path="/room/:roomCode" element={<GameRoomPage />} />
                <Route path="/join" element={<Home />} />
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
