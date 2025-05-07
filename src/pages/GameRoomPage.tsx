
import { ChatMessage } from '@/types/session.types';

// Update any arrays of messages to properly implement the ChatMessage interface
const messages: ChatMessage[] = [
  {
    id: '1',
    sender: 'Player 1',
    message: 'Hello world',
    timestamp: new Date().toISOString(),
    senderName: 'Player 1',
    content: 'Hello world',
    senderId: 'player1',
    type: 'text'
  }
];
