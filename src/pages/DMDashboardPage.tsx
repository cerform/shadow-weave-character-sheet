// src/pages/DMDashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import useSessionStore from '@/stores/sessionStore';
import { Label } from "@/components/ui/label";
import { Users, PlusCircle, ArrowRight, Clock, Calendar, Shield, Trash2, Edit } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';

const DMDashboardPage = () => {
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const sessionStore = useSessionStore();
  const { currentUser } = useAuth();
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.isDM) {
      toast.error("Доступ только для Мастеров Подземелий");
      navigate('/');
      return;
    }

    if (!sessionsLoaded && currentUser?.uid) {
      const loadSessions = async () => {
        try {
          const sessions = await sessionStore.fetchSessions();
          const filteredSessions = sessions.filter(s => s.dmId === currentUser?.uid);
          setUserSessions(filteredSessions);
          setSessionsLoaded(true);
        } catch (error) {
          console.error("Ошибка загрузки сессий:", error);
          setError("Не удалось загрузить сессии. Пожалуйста, попробуйте позже.");
          setSessionsLoaded(true);
        }
      };

      loadSessions();
    }
  }, [currentUser, navigate, sessionStore, sessionsLoaded]);

  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      toast.error("Введите название сессии!");
      return;
    }

    const newSession = sessionStore.createSession(sessionName, sessionDescription);
    setShowCreateDialog(false);
    setSessionName('');
    setSessionDescription('');
    setUserSessions(prev => [...prev, newSession]);
    toast.success("Сессия успешно создана!");
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm("Вы уверены, что хотите удалить эту сессию?")) {
      sessionStore.endSession(sessionId);
      setUserSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("Сессия удалена");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <BackgroundWrapper>
        <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
          <Card className="max-w-md w-full bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Ошибка загрузки</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/')} className="w-full">Вернуться на главную</Button>
            </CardFooter>
          </Card>
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="min-h-screen p-4 sm:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" /> Панель Мастера Подземелий
            </h1>
            <IconOnlyNavigation />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="bg-black/50 backdrop-blur-sm border-accent/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Статистика Мастера</CardTitle>
                  <CardDescription>Обзор ваших игровых данных</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span>Всего игроков: {userSessions.reduce((total, session) => total + session.players.length, 0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span>Активных сессий: {userSessions.filter(s => s.isActive).length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>Всего сессий: {userSessions.length}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setShowCreateDialog(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Создать новую сессию
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="bg-black/50 backdrop-blur-sm border-accent/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Ваши игровые сессии</CardTitle>
                  <CardDescription>Управление созданными вами сессиями</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Вы можете встроить сюда EncounterBuilder, InitiativeTracker, MapControl и т.д. */}
                  {/* Либо добавить вкладки для каждого типа управления сессией */}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default DMDashboardPage;
