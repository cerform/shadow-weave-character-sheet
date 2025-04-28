
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CharacterSheet from "./components/character-sheet/CharacterSheet";
import CharacterCreationPage from "./pages/CharacterCreationPage";
import CharacterSheetPage from "./pages/CharacterSheetPage";
import { SessionProvider } from "./contexts/SessionContext";
import DMDashboardPage from "./pages/DMDashboardPage";
import DMSessionPage from "./pages/DMSessionPage";
import JoinSessionPage from "./pages/JoinSessionPage";
import PlayerSessionPage from "./pages/PlayerSessionPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CharacterCreationPage />} />
              <Route path="/sheet" element={<CharacterSheetPage />} />
              <Route path="/dm" element={<DMDashboardPage />} />
              <Route path="/dm/session/:sessionId" element={<DMSessionPage />} />
              <Route path="/join" element={<JoinSessionPage />} />
              <Route path="/play" element={<PlayerSessionPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default App;
