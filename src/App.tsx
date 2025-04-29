
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Наши контексты
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CharacterProvider } from "@/contexts/CharacterContext";

// Старые страницы
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CharacterSheet from "./components/character-sheet/CharacterSheet";
import CharacterCreationPage from "./pages/CharacterCreationPage";
import CharacterSheetPage from "./pages/CharacterSheetPage";
import DMDashboardPage from "./pages/DMDashboardPage";
import DMSessionPage from "./pages/DMSessionPage";
import JoinSessionPage from "./pages/JoinSessionPage";
import PlayerSessionPage from "./pages/PlayerSessionPage";

// Новые страницы
import Home from "./pages/Home";
import GameRoomPage from "./pages/GameRoomPage";

// 🎯 Наша новая страница битвы
import PlayBattlePage from "./pages/PlayBattlePage";

// Контекст сессий
import { SessionProvider } from "./contexts/SessionContext";

const queryClient = new QueryClient();

const RoomWrapper = () => {
  const roomCode = window.location.pathname.split("/room/")[1];
  return <GameRoomPage roomCode={roomCode} />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CharacterProvider>
          <SessionProvider>
            <BrowserRouter>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Главная */}
                  <Route path="/" element={<Index />} />

                  {/* Создание персонажа */}
                  <Route path="/create" element={<CharacterCreationPage />} />
                  <Route path="/sheet" element={<CharacterSheetPage />} />

                  {/* Панель мастера */}
                  <Route path="/dm" element={<DMDashboardPage />} />
                  <Route path="/dm/session/:sessionId" element={<DMSessionPage />} />

                  {/* Присоединение игрока */}
                  <Route path="/join" element={<JoinSessionPage />} />

                  {/* НОВАЯ страница боя */}
                  <Route path="/play" element={<PlayBattlePage />} />

                  {/* Комнаты по WebSocket */}
                  <Route path="/session" element={<Home />} />
                  <Route path="/room/:roomCode" element={<RoomWrapper />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </BrowserRouter>
          </SessionProvider>
        </CharacterProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
