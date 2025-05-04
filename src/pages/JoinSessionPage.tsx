import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/contexts/SessionContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCharacter, Character } from "@/contexts/CharacterContext";
import { useToast } from "@/hooks/use-toast";
import CharacterSelection from '@/components/session/CharacterSelection';

const JoinSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { joinSession } = useSession();
  const { characters, getUserCharacters } = useCharacter();
  const [sessionCode, setSessionCode] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showCharacterDialog, setShowCharacterDialog] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadCharacters = async () => {
      await getUserCharacters();
    };
    loadCharacters();
  }, [getUserCharacters]);
  
  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код сессии.",
        variant: "destructive"
      });
      return;
    }
    
    if (!userName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите имя пользователя.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedCharacter) {
      toast({
        title: "Ошибка",
        description: "Выберите персонажа.",
        variant: "destructive"
      });
      return;
    }
    
    const joined = joinSession(sessionCode, userName, selectedCharacter);
    
    if (joined) {
      toast({
        title: "Успех",
        description: "Вы успешно присоединились к сессии.",
      });
      navigate('/player-session');
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось присоединиться к сессии. Проверьте код.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-6">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-center">
            Присоединиться к сессии
          </CardTitle>
          <CardDescription className="text-center">
            Введите код сессии и имя пользователя, чтобы присоединиться к игре.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionCode" className="block text-sm font-medium text-gray-700">
                Код сессии
              </Label>
              <Input
                id="sessionCode"
                type="text"
                placeholder="XXXX-XXXX"
                className="mt-1 block w-full"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                Имя пользователя
              </Label>
              <Input
                id="userName"
                type="text"
                placeholder="Ваше имя в сессии"
                className="mt-1 block w-full"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Button onClick={() => setShowCharacterDialog(true)} className="w-full">
              Выбрать персонажа
            </Button>
          </div>
          <div>
            <Button onClick={handleJoinSession} className="w-full">
              Присоединиться
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={showCharacterDialog} onOpenChange={setShowCharacterDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Выберите персонажа</DialogTitle>
            <DialogDescription>
              Выберите персонажа, которым вы хотите играть в сессии.
            </DialogDescription>
          </DialogHeader>
          <CharacterSelection
            characters={characters}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={(character) => setSelectedCharacter(character)}
            onClose={() => setShowCharacterDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JoinSessionPage;
