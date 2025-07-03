import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CharacterProvider } from '@/contexts/CharacterContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from '@/components/ui/toaster';
import NavigationButtons from '@/components/ui/NavigationButtons';
import HomePage from '@/pages/HomePage';
import CharacterCreationPage from '@/pages/CharacterCreationPage';
import CharactersListPage from '@/pages/CharactersListPage';
import CharacterSheetPage from '@/pages/CharacterSheetPage';
import AuthPage from '@/pages/AuthPage';
import UserProfilePage from '@/pages/UserProfilePage';
import DMPanel from '@/components/session/DMPanel';
import PlayerSessionPage from '@/pages/PlayerSessionPage';
import BattlePage from '@/pages/BattlePage';
import DMSessionPage from '@/pages/DMSessionPage';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CharacterProvider>
          <SessionProvider>
            <SocketProvider>
              <Router>
                <BackgroundWrapper>
                  <NavigationButtons />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                    <Route path="/character-creation" element={<CharacterCreationPage />} />
                    <Route path="/character" element={<CharacterCreationPage />} />
                    <Route path="/characters" element={<CharactersListPage />} />
                    <Route path="/character/:id" element={<CharacterSheetPage />} />
                    <Route path="/character-sheet/:id" element={<CharacterSheetPage />} />
                    <Route path="/dm" element={<DMPanel />} />
                    <Route path="/dm/session/:sessionId" element={<DMSessionPage />} />
                    <Route path="/session" element={<PlayerSessionPage />} />
                    <Route path="/battle/:sessionId" element={<BattlePage />} />
                  </Routes>
                  <Toaster />
                </BackgroundWrapper>
              </Router>
            </SocketProvider>
          </SessionProvider>
        </CharacterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;