
export interface VisibleArea {
  x: number;
  y: number;
  radius: number;
  tokenId: number;
}

// Добавляем привязку к SessionStore
export interface TokenOwner {
  userId: string;
  userName: string;
}

