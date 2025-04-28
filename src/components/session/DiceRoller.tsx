import React, { useEffect, useState } from "react";
import { socket, DiceResult } from "@/services/socket";

interface DiceRollerProps {
  roomCode: string;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ roomCode }) => {
  const [results, setResults] = useState<DiceResult[]>([]);

  const rollDice = (diceType: string) => {
    socket.emit("rollDice", { roomCode, nickname: socket.id, diceType });
  };

  useEffect(() => {
    socket.on("diceResult", (result: DiceResult) => {
      setResults((prev) => [...prev, result]);
    });

    return () => {
      socket.off("diceResult");
    };
  }, []);

  return (
    <div className="p-4 border-t mt-4">
      <h2 className="text-lg font-semibold mb-2">Бросить кубик</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {["d4", "d6", "d8", "d10", "d12", "d20"].map((dice) => (
          <button
            key={dice}
            onClick={() => rollDice(dice)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
          >
            {dice}
          </button>
        ))}
      </div>
      <div className="h-32 overflow-y-auto bg-gray-100 p-2 rounded">
        {results.map((res, idx) => (
          <div key={idx}>
            <strong>{res.nickname}</strong> бросил <strong>{res.diceType}</strong>: {res.result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiceRoller;
