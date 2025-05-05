import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { CharacterProvider } from '@/contexts/CharacterContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { SpellbookProvider } from '@/contexts/SpellbookContext';
import Home from '@/pages/Home';
import CharacterCreationPage from '@/pages/CharacterCreationPage';
import CharacterSheetPage from '@/pages/CharacterSheetPage';
import CharacterViewPage from '@/pages/CharacterViewPage';
import CharactersListPage from '@/pages/CharactersListPage';
import HandbookPage from '@/pages/HandbookPage';
import SpellbookPage from '@/pages/SpellbookPage';
import AuthPage from '@/pages/AuthPage';
import BattleScenePage from '@/pages/BattleScenePage';
import DMDashboardPage from '@/pages/DMDashboardPage';
import JoinGamePage from '@/pages/JoinGamePage';
import CreateSessionPage from '@/pages/CreateSessionPage';
import DMSessionPage from '@/pages/DMSessionPage';
import PlayerSessionPage from '@/pages/PlayerSessionPage';
import NotFound from '@/pages/NotFound';
import UserProfilePage from '@/pages/UserProfilePage';
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CharacterProvider>
          <SessionProvider>
            <SpellbookProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/character-creation" element={<CharacterCreationPage />} />
                  <Route path="/character-sheet/:id" element={<CharacterSheetPage />} />
                  <Route path="/character/:id" element={<CharacterViewPage />} />
                  <Route path="/characters" element={<CharactersListPage />} />
                  <Route path="/handbook" element={<HandbookPage />} />
                  <Route path="/spellbook" element={<SpellbookPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/profile" element={<UserProfilePage />} />
                  <Route path="/battle" element={<BattleScenePage />} />
                  <Route path="/dm" element={<DMDashboardPage />} />
                  <Route path="/join-game" element={<JoinGamePage />} />
                  <Route path="/create-session" element={<CreateSessionPage />} />
                  <Route path="/dm-session/:id" element={<DMSessionPage />} />
                  <Route path="/player-session/:id" element={<PlayerSessionPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              <Toaster />
            </SpellbookProvider>
          </SessionProvider>
        </CharacterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
