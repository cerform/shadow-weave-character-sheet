import React, { useState } from "react";
import { socket } from "@/services/socket";

interface CreateSessionProps {
  onRoomCreated: (roomCode: string) => void;
}

const CreateSession: React.FC<CreateSessionProps> = ({ onRoomCreated }) => {
  const [nickname, setNickname] = useState("");

  const handleCreate = () => {
    if (!nickname.trim()) {
      alert("Введите ваше имя!");
      return;
    }
    socket.connect();
    socket.emit("createRoom", nickname, ({ roomCode }: { roomCode: string }) => {
      onRoomCreated(roomCode);
    });
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-2">Создать сессию</h2>
      <input
        type="text"
        placeholder="Ваш никнейм"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <button
        onClick={handleCreate}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
      >
        Создать
      </button>
    </div>
  );
};

export default CreateSession;
