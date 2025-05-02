
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

import { CharacterContext, CharacterProvider } from "@/contexts/CharacterContext";
import { ThemeContext, Theme } from "@/contexts/ThemeContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { SessionProvider } from "@/contexts/SessionContext";

function App() {
  const [theme, setTheme] = React.useState<Theme>("default");
  const [character, setCharacter] = React.useState(null);
  const [characters, setCharacters] = React.useState([]);

  // Создаем заглушки для обязательных методов CharacterContext
  const updateCharacter = (updates: any) => {
    setCharacter((prevCharacter) => ({
      ...prevCharacter,
      ...updates,
    }));
  };
  
  const clearCharacter = () => {
    setCharacter(null);
  };
  
  const saveCharacter = async (char: any) => {
    console.log("Save character called", char);
    return char;
  };
  
  const deleteCharacter = async (id: string) => {
    console.log("Delete character called", id);
  };
  
  const getUserCharacters = () => {
    return characters;
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ThemeContext.Provider value={{ theme, setTheme }}>
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
                  <Route path="/dm-dashboard" element={<DMDashboardPage />} />
                  <Route path="/player-session" element={<PlayerSessionPage />} />
                  <Route path="/handbook" element={<HandbookPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              <Toaster />
            </SessionProvider>
          </SocketProvider>
        </CharacterProvider>
      </ThemeContext.Provider>
    </ThemeProvider>
  );
}

export default App;
