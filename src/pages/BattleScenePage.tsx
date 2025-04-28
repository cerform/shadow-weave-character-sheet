import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import OBSLayout from "@/components/OBSLayout";

// Типы токенов: игрок, моб или босс
interface Token {
  id: number;
  name: string;
  type: "player" | "mob" | "boss";
  img: string;
  x: number;
  y: number;
  hp: number;
  ac: number;
}

const BattleScenePage = () => {
  const [background, setBackground] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [draggingTokenId, setDraggingTokenId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const sceneRef = useRef<HTMLDivElement>(null);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBackground(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddToken = (type: Token["type"]) => {
    const name = prompt("Введите имя миниатюры:");
    const imgUrl = prompt("Введите ссылку на картинку миниатюры (jpg/png):");
    if (!name || !imgUrl) return;

    const newToken: Token = {
      id: Date.now(),
      name,
      type,
      img: imgUrl,
      x: 100,
      y: 100,
      hp: 30,
      ac: 15,
    };
    setTokens((prev) => [...prev, newToken]);
  };

  const handleDrag = (e: React.MouseEvent, id: number) => {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, x, y } : t))
    );
  };

  const handleRollDice = (sides: number) => {
    const result = Math.floor(Math.random() * sides) + 1;
    alert(`Вы бросили кубик d${sides}: ${result}`);
  };

  const handleZoom = (e: React.WheelEvent) => {
    if (e.deltaY < 0) setZoom((z) => Math.min(z + 0.1, 2));
    else setZoom((z) => Math.max(z - 0.1, 0.5));
  };

  return (
    <OBSLayout>
      {/* Левая панель */}
      <div className="obs-left p-4 bg-background text-foreground overflow-y-auto">
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className="p-2 border rounded bg-primary/10"
          />
          <button
            onClick={() => handleAddToken("player")}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            Добавить Игрока
          </button>
          <button
            onClick={() => handleAddToken("mob")}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Добавить Моба
          </button>
          <button
            onClick={() => handleAddToken("boss")}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
          >
            Добавить Босса
          </button>
          <button
            onClick={() => handleRollDice(20)}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
          >
            Бросить кубик d20
          </button>
          {/* Здесь можно добавить список токенов, инициативу, логику хода */}
        </div>
      </div>

      {/* Центральная пустая зона (сцена боя) */}
      <div className="obs-center">
        <div
          ref={sceneRef}
          className="relative w-full h-full border border-border rounded-lg overflow-hidden bg-primary/5"
          style={{
            backgroundImage: background ? `url(${background})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `scale(${zoom})`,
            transformOrigin: "center",
          }}
          onWheel={handleZoom}
        >
          {tokens.map((token) => (
            <motion.div
              key={token.id}
              className="absolute cursor-pointer select-none"
              style={{ left: token.x, top: token.y, width: 64, height: 64 }}
              drag
              dragMomentum={false}
              onDragStart={() => setDraggingTokenId(token.id)}
              onDragEnd={(e) => {
                if (draggingTokenId !== null) {
                  handleDrag(e, draggingTokenId);
                  setDraggingTokenId(null);
                }
              }}
            >
              <img
                src={token.img}
                alt={token.name}
                className={`w-full h-full object-cover rounded-full border-2 ${
                  token.type === "boss"
                    ? "border-red-500"
                    : token.type === "mob"
                    ? "border-yellow-500"
                    : "border-green-500"
                }`}
              />
              <div className="text-center text-xs font-bold mt-1">
                {token.name}
              </div>
              <div className="text-center text-xs mt-1">
                HP: {token.hp} AC: {token.ac}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Правая панель */}
      <div className="obs-right p-4 bg-background text-foreground overflow-y-auto">
        {/* TODO: чат, трекер инициативы, кнопки управления ходом */}
      </div>
    </OBSLayout>
  );
};

export default BattleScenePage;
