
import { Token } from "@/stores/battleStore";

/**
 * Создает новый токен с указанными параметрами
 */
export function createToken(params: {
  name: string;
  type: Token["type"];
  img: string;
  hp?: number;
  ac?: number;
  size?: number;
  x?: number;
  y?: number;
}) {
  const defaultX = 100 + Math.random() * 300;
  const defaultY = 100 + Math.random() * 300;
  
  // Определяем HP и AC в зависимости от типа токена
  const getDefaultHP = () => {
    switch(params.type) {
      case "boss": return 100;
      case "monster": return 20;
      default: return 30;
    }
  };
  
  const getDefaultAC = () => {
    switch(params.type) {
      case "boss": return 17;
      case "monster": return 13;
      default: return 15;
    }
  };
  
  // Определяем размер в зависимости от типа
  const getDefaultSize = () => {
    return params.type === "boss" ? 1.5 : 1;
  };
  
  const hp = params.hp ?? getDefaultHP();
  
  return {
    id: Date.now(),
    name: params.name,
    type: params.type,
    img: params.img,
    x: params.x ?? defaultX,
    y: params.y ?? defaultY,
    hp,
    maxHp: hp,
    ac: params.ac ?? getDefaultAC(),
    initiative: Math.floor(Math.random() * 5),
    conditions: [],
    resources: {},
    visible: true,
    size: params.size ?? getDefaultSize()
  };
}
