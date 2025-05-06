
export interface Participant {
  userId: string;
  characterId: string;
  characterName: string;
  joinedAt: Date;
}

export interface Session {
  id: string;
  sessionKey: string;
  name: string;
  hostId: string;
  createdAt: Date;
  participants: Participant[];
}
