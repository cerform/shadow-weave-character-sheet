
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Index from "@/pages/Index";
import CharacterCreationPage from "@/pages/CharacterCreationPage";
import CharacterSheetPage from "@/pages/CharacterSheetPage";
import CreateSessionPage from "@/pages/CreateSessionPage";
import JoinSessionPage from "@/pages/JoinSessionPage";
import NotFound from "@/pages/NotFound";
import HandbookPage from "@/pages/HandbookPage";
import BattleScenePage from "@/pages/BattleScenePage"; 
import SpellbookPage from "@/pages/SpellbookPage";
import AuthPage from "@/pages/AuthPage";
import DMDashboardPage from "@/pages/DMDashboardPage";
import DMSessionPage from "@/pages/DMSessionPage";
import CharactersListPage from "@/pages/CharactersListPage";

import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster position="top-center" />
      <div className="min-h-screen">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create-character" element={<CharacterCreationPage />} />
            <Route path="/character/:id" element={<CharacterSheetPage />} />
            <Route path="/create-session" element={<CreateSessionPage />} />
            <Route path="/join/:code?" element={<JoinSessionPage />} />
            <Route path="/join" element={<JoinSessionPage />} />
            <Route path="/handbook" element={<HandbookPage />} />
            <Route path="/battle" element={<BattleScenePage />} />
            <Route path="/spellbook" element={<SpellbookPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dm-dashboard" element={<DMDashboardPage />} />
            <Route path="/dm-session/:sessionId" element={<DMSessionPage />} />
            <Route path="/characters" element={<CharactersListPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
