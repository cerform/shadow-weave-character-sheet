
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Character } from '@/utils/characterImports';
import { saveSession, getSession } from '@/services/sessionService';

interface SessionPlayer {
  id: string;
  name: string;
  character?: Character;
  isConnected: boolean;
  lastSeen?: Date;
}

interface DiceRoll {
  id: string;
  playerId: string;
  playerName: string;
  type: string;
  rolls: number[];
  total: number;
  timestamp: Date;
  isPrivate?: boolean;
  modifier?: number;
  label?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'system' | 'player' | 'dm' | 'whisper';
  recipientId?: string;
}

interface Initiative {
  id: string;
  name: string;
  initiative: number;
  playerId?: string;
}

interface SessionState {
  isLoaded: boolean;
  id: string;
  name: string;
  code: string;
  dmId: string | null;
  players: SessionPlayer[];
  diceRolls: DiceRoll[];
  chatMessages: ChatMessage[];
  initiativeOrder: Initiative[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Player functions
  addPlayer: (name: string, characterId?: string) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<SessionPlayer>) => void;
  
  // Dice roll functions
  addDiceRoll: (playerId: string, playerName: string, type: string, rolls: number[], total: number, options?: { modifier?: number, label?: string, isPrivate?: boolean }) => void;
  clearDiceRolls: () => void;
  
  // Chat functions
  addChatMessage: (senderId: string, senderName: string, content: string, type: 'system' | 'player' | 'dm' | 'whisper', recipientId?: string) => void;
  clearChat: () => void;
  
  // Initiative functions
  addInitiative: (name: string, initiative: number, playerId?: string) => void;
  removeInitiative: (id: string) => void;
  clearInitiative: () => void;
  sortInitiative: () => void;
  
  // Session management
  createSession: (name: string, dmId: string) => void;
  saveSessionToStorage: () => void;
  loadSessionFromStorage: (sessionId: string) => boolean;
  setSessionStatus: (isActive: boolean) => void;
}

const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      isLoaded: false,
      id: '',
      name: '',
      code: '',
      dmId: null,
      players: [],
      diceRolls: [],
      chatMessages: [],
      initiativeOrder: [],
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Player functions
      addPlayer: (name, characterId) => {
        const newPlayer: SessionPlayer = {
          id: uuidv4(),
          name,
          isConnected: true,
          lastSeen: new Date()
        };
        
        // If characterId is provided, find the character and add it
        if (characterId) {
          const storedChars = localStorage.getItem('dnd-characters');
          if (storedChars) {
            const characters: Character[] = JSON.parse(storedChars);
            const selectedChar = characters.find(char => char.id === characterId);
            if (selectedChar) {
              newPlayer.character = selectedChar;
            }
          }
        }
        
        set(state => ({
          players: [...state.players, newPlayer],
          updatedAt: new Date()
        }));
      },
      
      removePlayer: (playerId) => {
        set(state => ({
          players: state.players.filter(p => p.id !== playerId),
          updatedAt: new Date()
        }));
      },
      
      updatePlayer: (playerId, updates) => {
        set(state => ({
          players: state.players.map(player =>
            player.id === playerId ? { ...player, ...updates } : player
          ),
          updatedAt: new Date()
        }));
      },
      
      // Dice roll functions
      addDiceRoll: (playerId, playerName, type, rolls, total, options) => {
        const newRoll: DiceRoll = {
          id: uuidv4(),
          playerId,
          playerName,
          type,
          rolls,
          total,
          timestamp: new Date(),
          ...options
        };
        
        set(state => ({
          diceRolls: [newRoll, ...state.diceRolls.slice(0, 99)], // Keep only the last 100 rolls
          updatedAt: new Date()
        }));
      },
      
      clearDiceRolls: () => {
        set(state => ({
          diceRolls: [],
          updatedAt: new Date()
        }));
      },
      
      // Chat functions
      addChatMessage: (senderId, senderName, content, type, recipientId) => {
        const newMessage: ChatMessage = {
          id: uuidv4(),
          senderId,
          senderName,
          content,
          type,
          recipientId,
          timestamp: new Date()
        };
        
        set(state => ({
          chatMessages: [...state.chatMessages, newMessage],
          updatedAt: new Date()
        }));
      },
      
      clearChat: () => {
        set(state => ({
          chatMessages: [],
          updatedAt: new Date()
        }));
      },
      
      // Initiative functions
      addInitiative: (name, initiative, playerId) => {
        const newInitiative: Initiative = {
          id: uuidv4(),
          name,
          initiative,
          playerId
        };
        
        set(state => {
          const newState = {
            initiativeOrder: [...state.initiativeOrder, newInitiative],
            updatedAt: new Date()
          };
          
          // Sort initiative
          newState.initiativeOrder.sort((a, b) => b.initiative - a.initiative);
          
          return newState;
        });
      },
      
      removeInitiative: (id) => {
        set(state => ({
          initiativeOrder: state.initiativeOrder.filter(i => i.id !== id),
          updatedAt: new Date()
        }));
      },
      
      clearInitiative: () => {
        set(state => ({
          initiativeOrder: [],
          updatedAt: new Date()
        }));
      },
      
      sortInitiative: () => {
        set(state => ({
          initiativeOrder: [...state.initiativeOrder].sort((a, b) => b.initiative - a.initiative),
          updatedAt: new Date()
        }));
      },
      
      // Session management
      createSession: (name, dmId) => {
        const sessionCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
        
        set({
          id: uuidv4(),
          name,
          code: sessionCode,
          dmId,
          players: [],
          diceRolls: [],
          chatMessages: [],
          initiativeOrder: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          isLoaded: true
        });
        
        // Save the session after creation
        setTimeout(() => {
          get().saveSessionToStorage();
        }, 0);
      },
      
      saveSessionToStorage: () => {
        const state = get();
        saveSession({
          id: state.id,
          name: state.name,
          code: state.code,
          dmId: state.dmId,
          players: state.players,
          diceRolls: state.diceRolls,
          chatMessages: state.chatMessages,
          initiativeOrder: state.initiativeOrder,
          isActive: state.isActive,
          createdAt: state.createdAt,
          updatedAt: new Date()
        });
      },
      
      loadSessionFromStorage: (sessionId) => {
        try {
          const session = getSession(sessionId);
          
          if (session) {
            set({
              ...session,
              isLoaded: true
            });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Error loading session:', error);
          return false;
        }
      },
      
      setSessionStatus: (isActive) => {
        set({
          isActive,
          updatedAt: new Date()
        });
        
        // Save the session status to storage
        const state = get();
        state.saveSessionToStorage();
      }
    }),
    {
      name: 'session-storage',
    }
  )
);

export default useSessionStore;
