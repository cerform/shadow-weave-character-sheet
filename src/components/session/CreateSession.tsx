
import React, { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useSessionStore } from "@/stores/sessionStore";
import { socketService } from "@/services/socket";

interface CreateSessionProps {
  onRoomCreated: (roomCode: string) => void;
}

const CreateSession: React.FC<CreateSessionProps> = ({ onRoomCreated }) => {
  const [nickname, setNickname] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { theme } = useTheme();
  const { createSession } = useSessionStore();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!nickname.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ваше имя!",
        variant: "destructive"
      });
      return;
    }
    
    if (!sessionName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название сессии!",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsCreating(true);
      // Создаем сессию через SessionStore с правильными параметрами
      const newSession = await createSession(sessionName, "Новая D&D сессия");
      
      if (newSession && newSession.code) {
        // Подключаемся к сокетам, если используются
        socketService.connect(newSession.code, nickname);
        
        // Вызываем колбэк с кодом комнаты
        onRoomCreated(newSession.code);
        
        toast({
          title: "Сессия создана",
          description: `Код комнаты: ${newSession.code}`,
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка при создании сессии",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">Создать сессию</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Ваш никнейм"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="border p-2 w-full bg-background text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Название сессии"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="border p-2 w-full bg-background text-foreground"
          />
        </div>
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
        >
          {isCreating ? "Создание..." : "Создать"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateSession;
