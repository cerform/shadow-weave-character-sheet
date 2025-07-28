import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Token {
  id: number;
  name: string;
  x: number;
  y: number;
  img: string;
  type: "player" | "mob" | "boss";
  hp: number; // 0-100
}

const BattleMap = () => {
  const [background, setBackground] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const sceneRef = useRef<HTMLDivElement>(null);

  const [isDM, setIsDM] = useState<boolean>(false);

  // Определяем, является ли пользователь DM
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDM(params.get("dm") === "true");
  }, []);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isDM) return; // Только DM может загружать карту
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
    if (!isDM) return; // Только DM может добавлять токены
    const name = prompt("Введите имя миниатюры:");
    const imgUrl = prompt("Введите ссылку на картинку токена (jpg/png):");
    const type = prompt('Введите тип токена: "player" / "mob" / "boss"') as
      | "player"
      | "mob"
      | "boss";

    if (!name || !imgUrl || !type) return;

    const newToken: Token = {
      id: Date.now(),
      name,
      x: 100,
      y: 100,
      img: imgUrl,
      type: type,
      hp: 100, // стартовое HP
    };

    setTokens((prev) => [...prev, newToken]);
  };

  const handleDragEnd = (
    event: any,
    info: { point: { x: number; y: number } },
    id: number
  ) => {
    if (!sceneRef.current || !isDM) return;

    const rect = sceneRef.current.getBoundingClientRect();
    const x = info.point.x - rect.left;
    const y = info.point.y - rect.top;

    setTokens((prev) =>
      prev.map((token) => (token.id === id ? { ...token, x, y } : token))
    );
  };

  const getHpColor = (hp: number) => {
    if (hp >= 90) return "bg-green-500";
    if (hp >= 75) return "bg-orange-400";
    if (hp >= 45) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <div
      ref={sceneRef}
      className="relative bg-black flex justify-center items-center overflow-hidden w-full h-full"
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

      {/* Кнопки управления для DM */}
      {isDM && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className="bg-primary p-2 rounded text-white text-sm"
          />
          <button
            onClick={handleAddToken}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
          >
            Добавить миниатюру
          </button>
        </div>
      )}

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
          drag={isDM} // Только DM может таскать
          dragMomentum={false}
          onDragEnd={(event, info) => handleDragEnd(event, info, token.id)}
          whileDrag={{ scale: 1.1, zIndex: 1000 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Иконка токена */}
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
            onError={(e) => {
              // Fallback изображение при ошибке загрузки
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23374151'/%3E%3Ctext x='32' y='36' text-anchor='middle' fill='white' font-size='12'%3E?%3C/text%3E%3C/svg%3E";
            }}
          />

          {/* HP Bar для мобов и боссов */}
          {(token.type === "mob" || token.type === "boss") && (
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
              <motion.div
                className={`h-full transition-all duration-300 ${getHpColor(
                  token.hp
                )}`}
                initial={{ width: 0 }}
                animate={{ width: `${token.hp}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}

          {/* Имя под токеном */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center text-xs font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded whitespace-nowrap">
            {token.name}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default BattleMap;