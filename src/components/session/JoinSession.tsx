
import React, { useState } from "react";
import { socket } from "@/services/socket";

interface JoinSessionProps {
  onJoined: (roomCode: string) => void;
}

const JoinSession: React.FC<JoinSessionProps> = ({ onJoined }) => {
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");

  const handleJoin = () => {
    if (!nickname.trim() || !roomCode.trim()) {
      alert("Введите ник и код комнаты!");
      return;
    }
    socket.connect();
    socket.emit(
      "joinRoom",
      { roomCode: roomCode.trim().toUpperCase(), nickname },
      ({ success, message }: { success: boolean; message?: string }) => {
        if (success) {
          onJoined(roomCode.trim().toUpperCase());
        } else {
          alert(message || "Не удалось подключиться к комнате");
        }
      }
    );
  };

  return (
    <div className="p-4 border rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-2">Присоединиться к сессии</h2>
      <input
        type="text"
        placeholder="Ваш никнейм"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Код комнаты"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        className="border p-2 mb-2 w-full"
      />
      <button
        onClick={handleJoin}
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full"
      >
        Присоединиться
      </button>
    </div>
  );
};

export default JoinSession;
