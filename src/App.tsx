
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { CharacterProvider } from './contexts/CharacterContext';
import { SessionProvider } from './contexts/SessionContext';
import { Toaster } from './components/ui/toaster';
import { SocketProvider } from './contexts/SocketContext';
import { UserThemeProvider } from './contexts/UserThemeContext';

import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import CharacterCreationPage from './pages/CharacterCreationPage';
import JoinSessionPage from './pages/JoinSessionPage';
import DMSessionPage from './pages/DMSessionPage';
import PlayerSessionPage from './pages/PlayerSessionPage';
import SpellbookPage from './pages/SpellbookPage'; 
import HandbookPage from './pages/HandbookPage';
import CharactersListPage from './pages/CharactersListPage';
import PlayBattlePage from './pages/PlayBattlePage';
import DMDashboardPage from './pages/DMDashboardPage';
import NotFound from './pages/NotFound';

import AppDiceButton from './AppDiceButton';

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <UserThemeProvider>
        <Router>
          <AuthProvider>
            <CharacterProvider>
              <SessionProvider>
                <SocketProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/sheet" element={<CharacterSheetPage />} />
                    <Route path="/character-creation" element={<CharacterCreationPage />} />
                    <Route path="/join" element={<JoinSessionPage />} />
                    <Route path="/dm" element={<DMDashboardPage />} />
                    <Route path="/dm-dashboard" element={<DMDashboardPage />} />
                    <Route path="/dm-session/:id" element={<DMSessionPage />} />
                    <Route path="/play" element={<PlayerSessionPage />} />
                    <Route path="/spellbook" element={<SpellbookPage />} />
                    <Route path="/handbook" element={<HandbookPage />} />
                    <Route path="/characters" element={<CharactersListPage />} />
                    <Route path="/battle" element={<PlayBattlePage />} />
                    <Route path="/dm/battle" element={<PlayBattlePage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <AppDiceButton />
                  <Toaster />
                </SocketProvider>
              </SessionProvider>
            </CharacterProvider>
          </AuthProvider>
        </Router>
      </UserThemeProvider>
    </ThemeProvider>
  );
};

export default App;
