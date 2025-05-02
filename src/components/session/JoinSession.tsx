
import React, { useState } from "react";
import { socketService } from "@/services/socket";
import { useSessionStore } from "@/stores/sessionStore";
import { useTheme } from "@/contexts/ThemeContext";

interface JoinSessionProps {
  onJoined: (roomCode: string) => void;
}

const JoinSession: React.FC<JoinSessionProps> = ({ onJoined }) => {
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const { setUserType, setUsername, playerTheme } = useSessionStore();
  const { theme } = useTheme();

  const handleJoin = () => {
    if (!nickname.trim() || !roomCode.trim()) {
      alert("Введите ник и код комнаты!");
      return;
    }
    
    // Set user as player in the store
    setUserType('player');
    setUsername(nickname);
    
    socketService.connect(roomCode.trim().toUpperCase(), nickname);
    socketService.on("joinSuccess", () => {
      onJoined(roomCode.trim().toUpperCase());
    });
    
    socketService.on("joinError", ({ message }: { message: string }) => {
      alert(message || "Не удалось подключиться к комнате");
    });
  };

  return (
    <div className="p-4 border rounded shadow mt-6 bg-card/30 backdrop-blur-sm border-primary/20">
      <h2 className="text-xl font-bold mb-2 text-primary">Присоединиться к сессии</h2>
      <input
        type="text"
        placeholder="Ваш никнейм"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border p-2 mb-2 w-full bg-background text-foreground"
      />
      <input
        type="text"
        placeholder="Код комнаты"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        className="border p-2 mb-2 w-full bg-background text-foreground"
      />
      <button
        onClick={handleJoin}
        className="bg-primary hover:bg-primary/80 text-primary-foreground py-2 px-4 rounded w-full"
      >
        Присоединиться
      </button>
    </div>
  );
};

export default JoinSession;
