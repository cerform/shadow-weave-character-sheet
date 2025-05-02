
import React from "react";
import CreateSession from "../components/session/CreateSession";
import JoinSession from "../components/session/JoinSession";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home as HomeIcon } from "lucide-react";
import { NavigationButtons } from "@/components/ui/NavigationButtons";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isJoinPage = location.pathname === '/join';

  console.log("Home page rendering, path:", location.pathname);

  const handleRoomCreated = (roomCode: string) => {
    navigate(`/room/${roomCode}`);
  };

  const handleJoined = (roomCode: string) => {
    navigate(`/room/${roomCode}`);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="container px-4 py-8 mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/')} size="icon">
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-3xl font-bold">
              {isJoinPage ? "Присоединиться к игре" : "D&D 5e - Сессии"}
            </h1>
          </div>
        </header>

        <main className="max-w-md mx-auto space-y-8">
          {isJoinPage ? (
            <JoinSession onJoined={handleJoined} />
          ) : (
            <>
              <CreateSession onRoomCreated={handleRoomCreated} />
              <JoinSession onJoined={handleJoined} />
            </>
          )}
        </main>

        <div className="mt-8">
          <NavigationButtons />
        </div>
      </div>
    </div>
  );
};

export default Home;
