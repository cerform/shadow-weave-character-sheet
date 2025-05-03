
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CharacterProvider } from './contexts/CharacterContext';
import { SessionProvider } from './contexts/SessionContext';
import { Toaster } from './components/ui/toaster';
import { SocketProvider } from './contexts/SocketContext';

import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import CharacterCreationPage from './pages/CharacterCreationPage';
import JoinSessionPage from './pages/JoinSessionPage';
import DMSessionPage from './pages/DMSessionPage';
import PlayerSessionPage from './pages/PlayerSessionPage';
import SpellBookPage from './pages/SpellBookPage';
import HandbookPage from './pages/HandbookPage';
import CharactersListPage from './pages/CharactersListPage';
import BattlePage from './pages/BattlePage';
import NotFoundPage from './pages/NotFoundPage';
import AppDiceButton from './AppDiceButton';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CharacterProvider>
          <SessionProvider>
            <SocketProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/sheet" element={<CharacterSheetPage />} />
                  <Route path="/character-creation" element={<CharacterCreationPage />} />
                  <Route path="/join" element={<JoinSessionPage />} />
                  <Route path="/dm" element={<DMSessionPage />} />
                  <Route path="/play" element={<PlayerSessionPage />} />
                  <Route path="/spellbook" element={<SpellBookPage />} />
                  <Route path="/handbook" element={<HandbookPage />} />
                  <Route path="/characters" element={<CharactersListPage />} />
                  <Route path="/battle" element={<BattlePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                <AppDiceButton />
                <Toaster />
              </Router>
            </SocketProvider>
          </SessionProvider>
        </CharacterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
