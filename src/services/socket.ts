import { io } from "socket.io-client";

export const socket = io("http://localhost:3001", {
  autoConnect: false,
});

export interface Player {
  id: string;
  nickname: string;
}

export interface ChatMessage {
  nickname: string;
  message: string;
}

export interface DiceResult {
  nickname: string;
  diceType: string;
  result: number;
}
