
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/contexts/SessionContext';
import { Copy, Plus, Users, Trash2 } from 'lucide-react';

const DMDashboardPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { sessions, createSession, endSession } = useSession();
  
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  
  const handleCreateSession = () => {
    if (!newSessionName.trim()) {
      toast.error('Введите название сессии');
      return;
    }
    
    const session = createSession(newSessionName, newSessionDescription);
    toast.success(`Сессия "${session.name}" создана!`);
    navigate(`/dm/session/${session.id}`);
  };
  
  const handleCopySessionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Код сессии скопирован!');
  };
  
  const handleDeleteSession = (id: string, name: string) => {
    endSession(id);
    toast.success(`Сессия "${name}" удалена`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 ${theme}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Панель Мастера Подземелий</h1>
          <p className="text-muted-foreground">Создавайте и управляйте игровыми сессиями D&D 5e</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Мои сессии</h2>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="size-4" />
                    Создать сессию
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать новую сессию</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о новой игровой сессии.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Название сессии</label>
                      <Input 
                        value={newSessionName} 
                        onChange={(e) => setNewSessionName(e.target.value)}
                        placeholder="Например: Поход в Забытые Горы" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Описание (необязательно)</label>
                      <Textarea 
                        value={newSessionDescription} 
                        onChange={(e) => setNewSessionDescription(e.target.value)}
                        placeholder="Краткое описание приключения..." 
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" onClick={handleCreateSession}>Создать</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {sessions.length === 0 ? (
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="size-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">У вас пока нет активных сессий</p>
                  <p className="text-muted-foreground mb-4">Создайте новую сессию, чтобы начать игру</p>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="size-4" />
                        Создать сессию
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Создать новую сессию</DialogTitle>
                        <DialogDescription>
                          Заполните информацию о новой игровой сессии.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium block mb-1">Название сессии</label>
                          <Input 
                            value={newSessionName} 
                            onChange={(e) => setNewSessionName(e.target.value)}
                            placeholder="Например: Поход в Забытые Горы" 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1">Описание (необязательно)</label>
                          <Textarea 
                            value={newSessionDescription} 
                            onChange={(e) => setNewSessionDescription(e.target.value)}
                            placeholder="Краткое описание приключения..." 
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button type="button" onClick={handleCreateSession}>Создать</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="bg-card/30 backdrop-blur-sm border-primary/20">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>{session.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-1"
                            onClick={() => handleCopySessionCode(session.code)}
                          >
                            <Copy className="size-3.5" />
                            {session.code}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteSession(session.id, session.name)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Создана {formatDate(session.createdAt)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm">{session.description || 'Без описания'}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <Users className="size-4" />
                          <span className="text-sm">{session.players.length} игроков</span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/dm/session/${session.id}`)}
                        >
                          Управлять сессией
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Быстрые действия</h3>
            
            <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
              <CardContent className="p-4 space-y-4">
                <Button onClick={() => navigate('/create')} className="w-full">
                  Создать персонажа
                </Button>
                
                <Button variant="outline" onClick={() => navigate('/join')} className="w-full">
                  Присоединиться как игрок
                </Button>
                
                <Button variant="outline" onClick={() => navigate('/library')} className="w-full">
                  Библиотека D&D 5e
                </Button>
              </CardContent>
            </Card>
            
            <h3 className="text-lg font-semibold">Советы мастеру</h3>
            <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
              <CardContent className="p-4 space-y-2 text-sm">
                <p>• Создайте код доступа к сессии и поделитесь им с игроками</p>
                <p>• Подготовьте персонажей NPC заранее</p>
                <p>• Позвольте игрокам влиять на историю</p>
                <p>• Используйте музыку для создания атмосферы</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMDashboardPage;
