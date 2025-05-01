
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronRight, Plus, Users, Activity, Map, Swords } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Session {
  id: string;
  name: string;
  date: string;
  players: number;
}

const DMDashboardPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([
    { id: "1", name: "Подземелье дракона", date: "01.05.2025", players: 4 },
    { id: "2", name: "Затерянный лес", date: "08.05.2025", players: 5 },
  ]);
  const [newSessionName, setNewSessionName] = useState("");

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName) return;

    const newSession: Session = {
      id: `${Date.now()}`,
      name: newSessionName,
      date: new Date().toLocaleDateString(),
      players: 0,
    };

    setSessions([...sessions, newSession]);
    setNewSessionName("");
  };

  const goToSession = (sessionId: string) => {
    navigate(`/dm/session/${sessionId}`);
  };

  const goToBattleScene = () => {
    navigate("/dm/battle");
  };

  return (
    <div className={`min-h-screen bg-background text-foreground py-8 theme-${theme}`}>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Панель Мастера Подземелий</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Ваши сессии
              </CardTitle>
              <CardDescription>
                Управляйте игровыми сессиями и приключениями
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-accent"
                    onClick={() => goToSession(session.id)}
                  >
                    <div>
                      <h3 className="font-medium">{session.name}</h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {session.date}
                        <Users className="h-3 w-3 ml-2" />
                        {session.players} игроков
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}

                {sessions.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    У вас пока нет активных сессий
                  </p>
                )}

                <form onSubmit={handleCreateSession} className="flex gap-2">
                  <Input
                    placeholder="Название новой сессии"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newSessionName}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5" />
                  Боевые сцены
                </CardTitle>
                <CardDescription>
                  Управляйте боем и отслеживайте инициативу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={goToBattleScene} className="w-full">
                  Открыть боевую сцену
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Карты и локации
                </CardTitle>
                <CardDescription>
                  Управляйте картами и создавайте новые локации
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Библиотека карт
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Статистика
                </CardTitle>
                <CardDescription>
                  Просмотр статистики и активности ваших игр
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Статистика будет доступна после проведения первой игры
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-card p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Советы для Мастера</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Подготовьте несколько встреч заранее, чтобы игра шла плавно</li>
            <li>Используйте боевую сцену для отслеживания инициативы и здоровья</li>
            <li>Добавьте миниатюры для персонажей и монстров</li>
            <li>Не бойтесь импровизировать, если игроки делают что-то неожиданное</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DMDashboardPage;
