import React from "react";
import SessionChat from "../components/session/SessionChat";
import DiceRoller from "../components/session/DiceRoller";

interface GameRoomPageProps {
  roomCode: string;
}

const GameRoomPage: React.FC<GameRoomPageProps> = ({ roomCode }) => {
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
