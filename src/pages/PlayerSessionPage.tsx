
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useTheme } from '@/contexts/ThemeContext'; 
// Используем наш созданный хук вместо отсутствующего
import { SessionContext } from '@/contexts/SessionContext';
import CharacterSheet from '@/components/character-sheet/CharacterSheet';
import { ThemeSelector } from '@/components/character-sheet/ThemeSelector';
import { ArrowLeft, Dices, Users, MessageSquare, Swords } from 'lucide-react';
import { DicePanel } from '@/components/character-sheet/DicePanel';

const PlayerSessionPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  // Получаем контекст напрямую вместо использования хука
  const sessionContext = React.useContext(SessionContext);
  const currentSession = sessionContext?.session;
  
  const player = currentSession?.players.find(p => p.connected) || null;
  const character = player?.character || null;
  
  if (!currentSession || !player) {
    return (
      <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
        <div className="max-w-md mx-auto mt-24">
          <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Вы не присоединены к сессии</h2>
              <p className="mb-6 text-muted-foreground">
                Для участия в игре необходимо присоединиться к сессии по коду, который вам предоставит Мастер Подземелий.
              </p>
              <Button onClick={() => navigate('/join')}>Присоединиться к сессии</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/')} className="mr-2">
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{currentSession.name}</h1>
              <p className="text-sm text-muted-foreground">
                Мастер: {currentSession.name || 'Неизвестно'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <ThemeSelector />
          </div>
        </header>

        <Tabs defaultValue="character">
          <TabsList className="mb-6">
            <TabsTrigger value="character">Персонаж</TabsTrigger>
            <TabsTrigger value="combat" className="gap-2">
              <Swords className="size-4" />
              Бой
            </TabsTrigger>
            <TabsTrigger value="dice" className="gap-2">
              <Dices className="size-4" />
              Кубики
            </TabsTrigger>
            <TabsTrigger value="group" className="gap-2">
              <Users className="size-4" />
              Группа
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="size-4" />
              Чат
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="character">
            <CharacterSheet character={character} />
          </TabsContent>
          
          <TabsContent value="combat">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-6">
              <div>
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Текущий бой</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-md bg-primary/10">
                        <h3 className="text-lg font-semibold mb-2">Ваш ход</h3>
                        <p className="text-muted-foreground mb-4">Что вы хотите сделать?</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <Button>Атака</Button>
                          <Button variant="outline">Заклинание</Button>
                          <Button variant="outline">Бонусное действие</Button>
                          <Button variant="outline">Движение</Button>
                          <Button variant="outline">Предмет</Button>
                          <Button variant="outline">Помощь</Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold">Порядок инициативы</h3>
                        
                        <div className="flex justify-between items-center py-2 px-3 bg-primary/20 rounded-md">
                          <span className="font-medium">Вы (Эльф, Маг)</span>
                          <span>Инициатива: 18</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 px-3">
                          <span>Хальфинг, Плут</span>
                          <span>Инициатива: 16</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 px-3">
                          <span>Орк-берсерк</span>
                          <span>Инициатива: 12</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 px-3">
                          <span>Гоблин лучник</span>
                          <span>Инициатива: 8</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Ваши характеристики</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-primary/5 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">HP</div>
                        <div className="text-xl font-bold">28/32</div>
                      </div>
                      
                      <div className="p-3 bg-primary/5 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">КЗ</div>
                        <div className="text-xl font-bold">15</div>
                      </div>
                      
                      <div className="p-3 bg-primary/5 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Инициатива</div>
                        <div className="text-xl font-bold">+3</div>
                      </div>
                      
                      <div className="p-3 bg-primary/5 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Скорость</div>
                        <div className="text-xl font-bold">30</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Ваше оружие</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">Длинный меч</span>
                        <span>+5</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Урон: 1d8+3 рубящий
                      </div>
                    </div>
                    
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">Кинжал</span>
                        <span>+5</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Урон: 1d4+3 колющий
                      </div>
                    </div>
                    
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">Короткий лук</span>
                        <span>+5</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Урон: 1d6+3 колющий, Дист: 80/320
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dice">
            <div className="max-w-lg mx-auto">
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Бросок кубиков</CardTitle>
                </CardHeader>
                <CardContent>
                  <DicePanel />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="group">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Участники группы</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentSession.players.map((player) => (
                  <Card key={player.id} className="bg-card/30 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{player.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${player.connected ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                          {player.connected ? "Онлайн" : "Оффлайн"}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {player.character ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Персонаж:</span>
                              <span>{player.character.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Класс:</span>
                              <span>{player.character.class}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Раса:</span>
                              <span>{player.character.race}</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground text-center py-2">
                            Персонаж не выбран
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chat">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle>Чат группы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 overflow-y-auto mb-4 p-3 border rounded-md">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="font-medium text-primary shrink-0">МП:</div>
                        <div>Добро пожаловать в сессию! Перед вами темная пещера, вход в которую кажется зловещим.</div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="font-medium text-primary shrink-0">Алекс:</div>
                        <div>Я хочу проверить наличие ловушек у входа.</div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="font-medium text-primary shrink-0">МП:</div>
                        <div>Сделайте проверку Восприятия.</div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="font-medium text-primary shrink-0">Система:</div>
                        <div className="italic">Алекс бросает 1d20+3: <span className="font-semibold">18</span> (15+3)</div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="font-medium text-primary shrink-0">МП:</div>
                        <div>Вы замечаете тонкую проволоку, натянутую у входа в пещеру на уровне лодыжки.</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input placeholder="Введите сообщение..." />
                    <Button>Отправить</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerSessionPage;
