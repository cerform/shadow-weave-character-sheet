
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Copy, ShieldQuestion } from "lucide-react";
import { useSessionStore } from '@/stores/sessionStore';

const DMSessionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createSession, currentSession } = useSessionStore();
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');

  useEffect(() => {
    if (currentSession) {
      navigate(`/session/${currentSession.code}`);
    }
  }, [currentSession, navigate]);

  const handleCreateSession = () => {
    if (sessionName.trim() === '') {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите название сессии.",
        variant: "destructive",
      });
      return;
    }

    const newSession = createSession(sessionName, sessionDescription);

    // Исправляем функцию toast
    toast({
      title: "Сессия создана",
      description: "Поделитесь кодом с игроками, чтобы они могли присоединиться"
    });

    if (newSession) {
      navigate(`/session/${newSession.code}`);
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось создать сессию.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Создать новую D&D сессию</CardTitle>
          <CardDescription>
            Заполните детали, чтобы начать ваше приключение.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Название сессии</Label>
            <Input
              id="name"
              placeholder="Название вашей сессии"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Краткое описание вашей сессии"
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateSession}>
            Создать сессию
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DMSessionPage;
