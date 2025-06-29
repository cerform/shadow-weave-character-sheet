import { io } from 'socket.io-client';
import { Character } from '@/types/character';
import { getCharacterById } from '@/services/characterService';

// const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';
const URL = 'http://localhost:4000';

export const socket = io(URL as string, {
  autoConnect: false
});

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export const createSession = async (characterId: string) => {
  const character = await getCharacterById(characterId);
  socket.emit('session:create', { character });
};
