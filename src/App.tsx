
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import CharacterCreationPage from "@/pages/CharacterCreationPage";
import CharacterSheetPage from "@/pages/CharacterSheetPage";
import SpellbookPage from "@/pages/SpellbookPage";
import PlayBattlePage from "@/pages/PlayBattlePage";
import JoinSessionPage from "@/pages/JoinSessionPage";
import DMSessionPage from "@/pages/DMSessionPage";
import DMDashboardPage from "@/pages/DMDashboardPage";
import CreateSessionPage from "@/pages/CreateSessionPage";
import JoinGamePage from "@/pages/JoinGamePage";
import PlayerSessionPage from "@/pages/PlayerSessionPage";
import HandbookPage from "@/pages/HandbookPage";
import AuthPage from "@/pages/AuthPage";

import { CharacterProvider } from "@/contexts/CharacterContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <CharacterProvider>
          <SocketProvider>
            <SessionProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/character-creation" element={<CharacterCreationPage />} />
                  <Route path="/sheet" element={<CharacterSheetPage />} />
                  <Route path="/spellbook" element={<SpellbookPage />} />
                  <Route path="/battle" element={<PlayBattlePage />} />
                  <Route path="/join-session" element={<JoinSessionPage />} />
                  <Route path="/create-session" element={<CreateSessionPage />} />
                  <Route path="/join/:sessionCode?" element={<JoinGamePage />} />
                  <Route path="/dm-session/:sessionId" element={<DMSessionPage />} />
                  <Route path="/dm" element={<DMDashboardPage />} />
                  <Route path="/dm/battle" element={<PlayBattlePage />} />
                  <Route path="/player-session" element={<PlayerSessionPage />} />
                  <Route path="/handbook" element={<HandbookPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              <Toaster />
            </SessionProvider>
          </SocketProvider>
        </CharacterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
