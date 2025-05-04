/**
 * Тип для данных пользователя в Firestore
 */
export interface FirestoreUserData {
  displayName?: string;
  email?: string;
  isDM?: boolean;
  characters?: string[];
  createdAt: string | Date;
  updatedAt?: string | Date;
  photoURL?: string;
  username?: string;
  settings?: {
    theme?: string;
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      inApp?: boolean;
    }
  };
}

/**
 * Тип для данных персонажа в Firestore
 */
export interface FirestoreCharacterData {
  id: string;
  name: string;
  race?: string;
  class?: string;
  level?: number;
  background?: string;
  alignment?: string;
  userId: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  // Другие поля персонажа...
}
