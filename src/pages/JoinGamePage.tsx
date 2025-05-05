
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import JoinSession from "@/components/session/JoinSession";
import useSessionStore from '@/stores/sessionStore';
import { ArrowLeft } from 'lucide-react';

const JoinGamePage = () => {
  const navigate = useNavigate();
  const [characterName, setCharacterName] = useState('');
  const sessionStore = useSessionStore();
  const { toast } = useToast();

  const handleCharacterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacterName(e.target.value);
  };

  const handleJoinSession = (roomCode: string) => {
    if (!characterName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите имя персонажа!",
        variant: "destructive"
      });
      return;
    }

    // Создаем или выбираем персонажа
    const character = {
      name: characterName,
      character: {} // Добавляем пустой объект character, чтобы соответствовать требуемому типу
    };

    // Проверяем наличие метода присоединения к сессии
    if (typeof sessionStore.joinSession !== 'function') {
      toast({
        title: "Ошибка",
        description: "Функция присоединения к сессии недоступна",
        variant: "destructive"
      });
      return;
    }

    // Присоединяемся к сессии
    const joined = sessionStore.joinSession(roomCode, character);

    if (joined) {
      toast({
        title: "Успех",
        description: "Вы присоединились к сессии",
      });
      navigate('/game'); // Перенаправляем в игру
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось присоединиться к сессии",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="bg-white shadow-md rounded-md w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Присоединиться к игре</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4">
            <Label htmlFor="characterName" className="block text-gray-700 text-sm font-bold mb-2">
              Имя персонажа:
            </Label>
            <Input
              type="text"
              id="characterName"
              placeholder="Введите имя вашего персонажа"
              value={characterName}
              onChange={handleCharacterNameChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <JoinSession onJoined={handleJoinSession} />
        </CardContent>
        <CardFooter>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinGamePage;
