
// Re-export for consistent imports across the app
import useSessionStore from "@/stores/sessionStore";
import { SessionProvider } from "@/contexts/SessionContext";
import type { GameSession, SessionPlayer } from "@/types/session.types";

// Используем расширенный тип для DMSession с дополнительными свойствами
export interface DMSession extends GameSession {
  chat?: any;
  updatedAt?: string;
}

export interface Player extends SessionPlayer {}

export { useSessionStore, SessionProvider };
