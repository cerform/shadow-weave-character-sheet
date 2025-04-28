import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface Token {
  id: number;
  name: string;
  type: "player" | "mob" | "boss";
  img: string;
  x: number;
  y: number;
}

const BattleScenePage = () => {
  const [background, setBackground] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [draggingTokenId, setDraggingTokenId] = useState<number | null>(null);

  const sceneRef = useRef<HTMLDivElement>(null);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackground(reader.result as string);
      };
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
    };

    setTokens((prev) => [...prev, newToken]);
  };

  const handleDrag = (e: React.MouseEvent, id: number) => {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTokens((prev) =>
      prev.map((token) =>
        token.id === id ? { ...token, x, y } : token
      )
    );
  };

  return (
    <div className="min-h-screen p-4 flex flex-col gap-4 bg-background text-foreground">

      {/* Панель управления */}
      <div className="flex gap-4 mb-4">
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
      </div>

      {/* Сцена */}
      <div
        ref={sceneRef}
        className="relative w-full h-[80vh] border border-border rounded-lg overflow-hidden bg-primary/5"
        style={{
          backgroundImage: background ? `url(${background})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {tokens.map((token) => (
          <motion.div
            key={token.id}
            className="absolute cursor-pointer select-none"
            style={{
              left: token.x,
              top: token.y,
              width: 64,
              height: 64,
            }}
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
                token.type === "boss" ? "border-red-500" : token.type === "mob" ? "border-yellow-500" : "border-green-500"
              }`}
            />
            <div className="text-center text-xs font-bold mt-1">
              {token.name}
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default BattleScenePage;
