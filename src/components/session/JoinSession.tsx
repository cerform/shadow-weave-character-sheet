
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import useSessionStore from "@/stores/sessionStore";
import { socketService } from "@/services/socket";

interface JoinSessionProps {
  onJoined: (roomCode: string) => void;
}

const JoinSession: React.FC<JoinSessionProps> = ({ onJoined }) => {
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const { joinSession } = useSessionStore();
  const { toast } = useToast();

  const handleJoin = () => {
    if (!nickname.trim() || !roomCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ник и код комнаты!",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Присоединяемся к сессии через SessionStore
      const joined = joinSession(roomCode.trim().toUpperCase(), nickname);
      
      if (!joined) {
        toast({
          title: "Ошибка",
          description: "Не удалось найти сессию с указанным кодом",
          variant: "destructive"
        });
        return;
      }
      
      // Подключаемся к сокетам, если используются
      socketService.connect(roomCode.trim().toUpperCase(), nickname);
      
      // Регистрируем обработчики сокетов
      socketService.on("joinSuccess", () => {
        onJoined(roomCode.trim().toUpperCase());
        
        toast({
          title: "Успех",
          description: "Вы присоединились к сессии",
        });
      });
      
      socketService.on("joinError", ({ message }: { message: string }) => {
        toast({
          title: "Ошибка соединения",
          description: message || "Не удалось подключиться к комнате",
          variant: "destructive"
        });
      });
      
      // Сразу вызываем колбэк присоединения
      onJoined(roomCode.trim().toUpperCase());
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Присоединиться к сессии</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Ваш никнейм"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Код комнаты"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="border p-2 w-full"
          />
        </div>
        <Button
          onClick={handleJoin}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Присоединиться
        </Button>
      </CardContent>
    </Card>
  );
};

export default JoinSession;
