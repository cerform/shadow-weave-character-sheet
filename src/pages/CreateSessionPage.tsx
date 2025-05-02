
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, Link, ArrowRight } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';

const CreateSessionPage = () => {
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [createdSession, setCreatedSession] = useState<{id: string, name: string, code: string} | null>(null);
  const [copying, setCopying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createSession } = useSessionStore();
  
  // Создание новой сессии
  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите название сессии",
        variant: "destructive"
      });
      return;
    }
    
    // Создаем новую сессию через sessionStore
    const newSession = createSession(sessionName, sessionDescription);
    
    setCreatedSession({
      id: newSession.id,
      name: newSession.name,
      code: newSession.code
    });
    
    toast({
      title: "Сессия создана",
      description: `Сессия "${sessionName}" успешно создана`
    });
  };
  
  // Копирование ссылки или кода
  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopying(true);
      toast({
        title: "Скопировано",
        description: type === 'link' ? "Ссылка скопирована в буфер обмена" : "Код сессии скопирован в буфер обмена"
      });
      setTimeout(() => setCopying(false), 2000);
    });
  };
  
  // Переход к сессии DM
  const goToSession = () => {
    if (createdSession) {
      navigate(`/dm-session/${createdSession.id}`);
    }
  };

  return (
    <div className="container p-4 mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Создание новой сессии</h1>
      
      {!createdSession ? (
        <Card>
          <CardHeader>
            <CardTitle>Новая игровая сессия</CardTitle>
            <CardDescription>
              Создайте новую игровую сессию и пригласите игроков присоединиться
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionName">Название сессии</Label>
              <Input 
                id="sessionName" 
                placeholder="Например: Затерянные шахты Фанделвера"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionDescription">Описание (необязательно)</Label>
              <Input 
                id="sessionDescription" 
                placeholder="Краткое описание вашего приключения"
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)} 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateSession} className="w-full">Создать сессию</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Сессия создана!</CardTitle>
            <CardDescription>
              Пригласите игроков присоединиться, используя ссылку или код сессии
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-lg">
                <h2 className="text-4xl font-bold mb-4 text-center">{createdSession.code}</h2>
                <p className="text-sm text-center text-muted-foreground">Код вашей сессии</p>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(createdSession.code, 'code')}
                  className="flex-1"
                  disabled={copying}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Копировать код
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(`${window.location.origin}/join/${createdSession.code}`, 'link')}
                  className="flex-1"
                  disabled={copying}
                >
                  <Link className="mr-2 h-4 w-4" />
                  Копировать ссылку
                </Button>
              </div>
            </div>
            
            <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900/30 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Для игроков
              </h3>
              <p className="text-sm">
                Игроки могут присоединиться к сессии, перейдя по ссылке или введя код сессии на странице присоединения.
                Убедитесь, что вы предоставили им доступ.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={goToSession} className="w-full">
              Перейти к сессии
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CreateSessionPage;
