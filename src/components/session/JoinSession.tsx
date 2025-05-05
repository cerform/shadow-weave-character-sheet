
import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import useSessionStore from '@/stores/sessionStore';

interface JoinSessionProps {
  onJoined?: (code: string) => void;
}

const JoinSession: React.FC<JoinSessionProps> = ({ onJoined }) => {
  const [sessionCode, setSessionCode] = useState('');
  const { toast } = useToast();
  const sessionStore = useSessionStore();

  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код сессии!",
        variant: "destructive"
      });
      return;
    }

    // Проверяем наличие метода присоединения к сессии
    if (typeof sessionStore.joinSession !== 'function') {
      toast({
        title: "Ошибка",
        description: "Функция присоединения к сессии недоступна",
        variant: "destructive"
      });
      return;
    }

    // Если onJoined передан, передаем код сессии ему
    if (onJoined) {
      onJoined(sessionCode);
    } else {
      // Иначе пытаемся присоединиться самостоятельно
      const character = { 
        name: "Игрок",
        character: {} // Добавляем пустой объект character, чтобы соответствовать требуемому типу
      };
      
      const joined = sessionStore.joinSession(sessionCode, character);
      
      if (joined) {
        toast({
          title: "Успех",
          description: "Вы присоединились к сессии!",
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось присоединиться к сессии. Проверьте код.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="session-code">Код сессии:</Label>
        <Input
          id="session-code"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
          placeholder="Введите код сессии"
        />
      </div>
      <Button onClick={handleJoinSession} className="w-full">
        Присоединиться к игре
      </Button>
    </div>
  );
};

export default JoinSession;
