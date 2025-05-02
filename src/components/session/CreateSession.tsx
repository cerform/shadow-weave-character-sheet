
import React, { useState } from "react";
import { socketService } from "@/services/socket";
import { useTheme } from "@/contexts/ThemeContext";

interface CreateSessionProps {
  onRoomCreated: (roomCode: string) => void;
}

const CreateSession: React.FC<CreateSessionProps> = ({ onRoomCreated }) => {
  const [nickname, setNickname] = useState("");
  const { theme } = useTheme();

  const handleCreate = () => {
    if (!nickname.trim()) {
      alert("Введите ваше имя!");
      return;
    }
    socketService.connect("", nickname);
    socketService.on("roomCreated", ({ roomCode }: { roomCode: string }) => {
      onRoomCreated(roomCode);
    });
  };

  return (
    <div className={`p-4 border rounded shadow bg-card/30 backdrop-blur-sm border-primary/20`}>
      <h2 className="text-xl font-bold mb-2 text-primary">Создать сессию</h2>
      <input
        type="text"
        placeholder="Ваш никнейм"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border p-2 mb-2 w-full bg-background text-foreground"
      />
      <button
        onClick={handleCreate}
        className="bg-primary hover:bg-primary/80 text-primary-foreground py-2 px-4 rounded w-full"
      >
        Создать
      </button>
    </div>
  );
};

export default CreateSession;
