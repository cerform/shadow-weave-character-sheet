import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

interface Token {
  id: number;
  name: string;
  x: number;
  y: number;
  img: string;
}

const BattleMap = () => {
  const [background, setBackground] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
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

  const handleAddToken = () => {
    const name = prompt("Введите имя миниатюры:");
    const imgUrl = prompt("Введите ссылку на картинку токена (jpg/png):");

    if (!name || !imgUrl) return;

    const newToken: Token = {
      id: Date.now(),
      name,
      x: 100,
      y: 100,
      img: imgUrl,
    };

    setTokens((prev) => [...prev, newToken]);
  };

  // 🛠 Исправленный обработчик перетаскивания токенов
  const handleDragEnd = (
    event: any,
    info: { point: { x: number; y: number } },
    id: number
  ) => {
    if (!sceneRef.current) return;

    const rect = sceneRef.current.getBoundingClientRect();
    const x = info.point.x - rect.left;
    const y = info.point.y - rect.top;

    setTokens((prev) =>
      prev.map((token) => (token.id === id ? { ...token, x, y } : token))
    );
  };

  return (
    <div
      ref={sceneRef}
      className="relative bg-black flex justify-center items-center overflow-hidden"
    >
      {background ? (
        <img
          src={background}
          alt="Карта"
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="text-gray-500">Карта не загружена</div>
      )}

      {/* Кнопки */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleBackgroundUpload}
          className="bg-primary p-2 rounded text-white"
        />
        <button
          onClick={handleAddToken}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
        >
          Добавить миниатюру
        </button>
      </div>

      {/* Токены */}
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
          onDragEnd={(event, info) => handleDragEnd(event, info, token.id)}
        >
          <img
            src={token.img}
            alt={token.name}
            className="w-full h-full object-cover rounded-full border-2 border-white"
          />
          <div className="text-center text-xs font-bold mt-1 text-white">
            {token.name}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default BattleMap;
