
import React, { useEffect, useState } from "react";
import { socketService, ChatMessage } from "@/services/socket";

interface SessionChatProps {
  roomCode: string;
}

const SessionChat: React.FC<SessionChatProps> = ({ roomCode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    const unsubscribe = socketService.on("chatMessage", (newMessage: ChatMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      socketService.sendChatMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  return (
    <div className="p-4 border-t mt-4">
      <h2 className="text-lg font-semibold mb-2">Чат комнаты</h2>
      <div className="h-48 overflow-y-auto bg-gray-100 p-2 rounded mb-2">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.username || msg.userId}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Введите сообщение"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          onClick={sendMessage}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default SessionChat;
