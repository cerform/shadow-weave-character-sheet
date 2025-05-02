
import React from "react";
import { useNavigate } from "react-router-dom";
import CreateSession from "@/components/session/CreateSession";
import JoinSession from "@/components/session/JoinSession";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  const handleRoomCreated = (roomCode: string) => {
    navigate(`/room/${roomCode}`);
  };

  const handleJoined = (roomCode: string) => {
    navigate(`/room/${roomCode}`);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8" 
      style={{ 
        background: `linear-gradient(135deg, rgba(${currentTheme.backgroundStart}, 0.9), rgba(${currentTheme.backgroundEnd}, 0.8))`,
        backgroundSize: "cover"
      }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gradient">Shadow Weave</h1>
          <p className="text-muted-foreground">Виртуальный стол для настольных ролевых игр</p>
        </div>
        
        <div className="grid gap-8">
          <CreateSession onRoomCreated={handleRoomCreated} />
          <JoinSession onJoined={handleJoined} />
        </div>
      </div>
    </div>
  );
};

export default Home;
