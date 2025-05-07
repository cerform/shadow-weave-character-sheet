import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SessionChat from '@/components/SessionChat';
import { ChatMessage } from '@/types/session.types';

const GameRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { currentUser } = useAuth();
  const { isConnected, connect, disconnect, sendMessage } = useSocket();

  useEffect(() => {
    if (roomId && currentUser) {
      // Connect to the socket when component mounts
      connect(roomId, currentUser.displayName || 'Guest');
    }
    
    return () => {
      disconnect();
    };
  }, [roomId, currentUser]);

  // Convert to the correct ChatMessage format
  const normalizeMessages = (rawMessages: { id: string; sender: string; text: string; timestamp: string }[]): ChatMessage[] => {
    return rawMessages.map(msg => ({
      id: msg.id,
      senderId: msg.sender,
      senderName: msg.sender,
      content: msg.text,
      timestamp: msg.timestamp,
      type: 'text'
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Игровая комната: {roomId}</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionChat
            messages={normalizeMessages([])}
            onSendMessage={(text) => sendMessage(text)}
            sessionCode={roomId || ''}
            playerName={currentUser?.displayName || 'Guest'}
            roomCode={roomId || ''}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GameRoomPage;
