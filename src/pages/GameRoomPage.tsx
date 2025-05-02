
import React from "react";
import SessionChat from "../components/session/SessionChat";
import DiceRoller from "../components/session/DiceRoller";
import { useParams } from "react-router-dom";

const GameRoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();

  if (!roomCode) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Ошибка: Код комнаты не указан</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Комната: <span className="text-blue-600">{roomCode}</span>
      </h1>

      {/* Блок чата */}
      <SessionChat roomCode={roomCode} />

      {/* Блок бросков кубиков */}
      <DiceRoller roomCode={roomCode} />
    </div>
  );
};

export default GameRoomPage;
