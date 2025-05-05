import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import useSessionStore from '@/stores/sessionStore';
import { Label } from "@/components/ui/label";
import { Users, PlusCircle, ArrowRight } from "lucide-react";

const DMDashboardPage = () => {
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const sessionStore = useSessionStore();

  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      alert("Введите название сессии!");
      return;
    }

    const newSession = sessionStore.createSession(sessionName, sessionDescription);
    navigate(`/dm-session/${newSession.id}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="bg-white shadow-md rounded-md w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Панель Мастера Подземелий</CardTitle>
          <CardDescription>Создайте новую игровую сессию или управляйте существующими.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4">
            <Label htmlFor="sessionName" className="block text-gray-700 text-sm font-bold mb-2">
              Название сессии:
            </Label>
            <Input
              type="text"
              id="sessionName"
              placeholder="Введите название вашей сессии"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="sessionDescription" className="block text-gray-700 text-sm font-bold mb-2">
              Описание сессии:
            </Label>
            <Textarea
              id="sessionDescription"
              placeholder="Добавьте краткое описание вашей сессии"
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <Button onClick={handleCreateSession} className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Создать сессию
          </Button>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-gray-600 text-xs italic">
            "С великой силой приходит великая ответственность." - Дядя Бен (возможно)
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DMDashboardPage;
