
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Play, SkipForward, SkipBack, Trash2, Edit, Move } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { socketService } from '@/services/socket';
import { DiceResult } from '@/types/character';
import { Initiative, TokenData } from '@/types/session.types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface InitiativeTrackerPanelProps {
  initiative: Initiative[];
  tokens: TokenData[];
  battleActive: boolean;
  sessionId: string;
  onUpdateInitiative: (newInitiative: Initiative[]) => void;
  onToggleBattle: () => void;
  onNextTurn: () => void;
}

const InitiativeTrackerPanel: React.FC<InitiativeTrackerPanelProps> = ({ 
  initiative, 
  tokens, 
  battleActive,
  sessionId,
  onUpdateInitiative,
  onToggleBattle,
  onNextTurn
}) => {
  const [editMode, setEditMode] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');
  const [newEntryRoll, setNewEntryRoll] = useState<number | ''>('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const draggedOverIndex = useRef<number | null>(null);
  const { toast } = useToast();

  // Обработчик для броска инициативы
  const handleRollInitiative = () => {
    if (tokens.length === 0) {
      toast({
        title: "Ошибка",
        description: "На карте нет токенов для броска инициативы",
        variant: "destructive"
      });
      return;
    }
    
    // Очищаем текущую инициативу
    onUpdateInitiative([]);
    
    // Для каждого токена бросаем d20 + модификатор инициативы
    tokens.forEach(token => {
      // В реальном приложении здесь будет использоваться модификатор от персонажа
      const modifier = 0; // В простом случае используем 0
      
      socketService.sendRoll({
        formula: `1d20+${modifier}`,
        reason: `Инициатива для ${token.name}`
      });
    });
    
    // Подписка на результаты бросков
    const handleDiceResult = (result: DiceResult) => {
      // Находим токен по имени
      const token = tokens.find(t => t.name === result.nickname || 
        result.label?.includes(t.name));
      
      if (token) {
        // Добавляем запись в трекер инициативы
        const newEntry: Initiative = {
          id: Date.now().toString() + Math.random().toString(),
          tokenId: token.id,
          name: token.name,
          roll: result.result || result.total || 0,
          isActive: false
        };
        
        onUpdateInitiative(prev => {
          const newInitiative = [...prev, newEntry].sort((a, b) => b.roll - a.roll);
          if (newInitiative.length > 0) {
            // Активируем первого участника в списке
            return newInitiative.map((item, idx) => ({
              ...item,
              isActive: idx === 0
            }));
          }
          return newInitiative;
        });
      }
    };
    
    // Слушаем результаты бросков и отписываемся через 3 секунды
    socketService.on("diceResult", handleDiceResult);
    setTimeout(() => {
      socketService.off("diceResult", handleDiceResult);
      
      // Если после таймаута нет инициативы, создаем её вручную
      onUpdateInitiative(prev => {
        if (prev.length === 0) {
          return tokens.map((token, idx) => ({
            id: Date.now().toString() + idx,
            tokenId: token.id,
            name: token.name,
            roll: Math.floor(Math.random() * 20) + 1, // d20
            isActive: idx === 0
          })).sort((a, b) => b.roll - a.roll);
        }
        return prev;
      });
      
    }, 3000);
  };

  // Функция для добавления участника вручную
  const handleAddEntry = () => {
    if (!newEntryName.trim() || newEntryRoll === '') return;
    
    const roll = Number(newEntryRoll);
    if (isNaN(roll)) return;
    
    const newEntry: Initiative = {
      id: Date.now().toString(),
      tokenId: 'manual-' + Date.now(), // Для ручных записей создаем специальный ID
      name: newEntryName,
      roll: roll,
      isActive: false
    };
    
    onUpdateInitiative(prev => {
      const newInitiative = [...prev, newEntry].sort((a, b) => b.roll - a.roll);
      // Если это первая запись или нет активной записи, активируем первого участника
      if (newInitiative.length === 1 || !newInitiative.some(i => i.isActive)) {
        newInitiative[0].isActive = true;
      }
      return newInitiative;
    });
    
    setNewEntryName('');
    setNewEntryRoll('');
    setIsAddDialogOpen(false);
  };

  // Функция для перехода к следующему участнику
  const handleNextTurn = () => {
    onNextTurn();
  };

  // Функция для перехода к предыдущему участнику
  const handlePrevTurn = () => {
    onUpdateInitiative(prev => {
      // Находим индекс текущего активного участника
      const activeIndex = prev.findIndex(i => i.isActive);
      if (activeIndex === -1) return prev;
      
      // Вычисляем индекс предыдущего участника
      const prevIndex = activeIndex === 0 ? prev.length - 1 : activeIndex - 1;
      
      // Обновляем активность
      return prev.map((item, idx) => ({
        ...item,
        isActive: idx === prevIndex
      }));
    });
  };

  // Функция для удаления участника из списка
  const handleRemoveEntry = (id: string) => {
    onUpdateInitiative(prev => {
      const newInitiative = prev.filter(i => i.id !== id);
      // Если удаляем активного участника, активируем следующего
      if (prev.find(i => i.id === id)?.isActive && newInitiative.length > 0) {
        const nextIndex = prev.findIndex(i => i.id === id) % newInitiative.length;
        newInitiative[nextIndex].isActive = true;
      }
      return newInitiative;
    });
  };

  // Функции для drag and drop
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    draggedOverIndex.current = index;
  };

  const handleDrop = () => {
    if (dragIndex !== null && draggedOverIndex.current !== null) {
      onUpdateInitiative(prev => {
        const newInitiative = [...prev];
        const draggedItem = newInitiative[dragIndex];
        
        // Удаляем элемент с текущей позиции
        newInitiative.splice(dragIndex, 1);
        
        // Вставляем на новую позицию
        newInitiative.splice(draggedOverIndex.current!, 0, draggedItem);
        
        return newInitiative;
      });
    }
    
    setDragIndex(null);
    draggedOverIndex.current = null;
  };

  // Функция для переключения режима редактирования
  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  };

  // Обновление значения броска инициативы
  const handleUpdateRoll = (id: string, newRoll: number) => {
    if (isNaN(newRoll)) return;
    
    onUpdateInitiative(prev => {
      const updatedInitiative = prev.map(item => 
        item.id === id ? { ...item, roll: newRoll } : item
      ).sort((a, b) => b.roll - a.roll);
      
      // Сохраняем активность после сортировки
      const activeId = prev.find(i => i.isActive)?.id;
      if (activeId) {
        const activeItem = updatedInitiative.find(i => i.id === activeId);
        if (activeItem) {
          // Сбрасываем все активные флаги
          updatedInitiative.forEach(i => i.isActive = false);
          // Устанавливаем активный флаг для найденного элемента
          activeItem.isActive = true;
        }
      }
      
      return updatedInitiative;
    });
  };

  return (
    <div className="initiative-tracker space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Порядок инициативы</h3>
          {battleActive && (
            <div className="text-xs font-medium bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
              Бой активен
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={editMode ? "secondary" : "outline"}
            size="sm"
            onClick={toggleEditMode}
          >
            <Edit className="h-4 w-4 mr-1" />
            {editMode ? "Готово" : "Изменить"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>
      </div>
      
      {initiative.length === 0 ? (
        <div className="text-center p-6 bg-muted/20 rounded-md border border-border">
          <p className="text-muted-foreground">Нет данных инициативы.</p>
          <Button 
            variant="default" 
            className="mt-4"
            onClick={handleRollInitiative}
          >
            Бросить инициативу
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-3 space-y-1">
            {initiative.map((item, index) => {
              const token = tokens.find(t => t.id === item.tokenId);
              
              return (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-2 p-2 rounded border
                    ${item.isActive ? 'bg-primary/20 border-primary' : 'bg-card border-transparent'}
                    ${editMode ? 'cursor-move' : ''}`}
                  draggable={editMode}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                >
                  {editMode ? (
                    <Input 
                      type="number" 
                      value={item.roll}
                      onChange={(e) => handleUpdateRoll(item.id, parseInt(e.target.value))}
                      className="w-16 h-8 text-center p-1"
                    />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center bg-muted/30 rounded-full font-medium">
                      {item.roll}
                    </div>
                  )}
                  
                  {token && (
                    <div 
                      className="w-8 h-8 rounded-full bg-center bg-cover"
                      style={{ 
                        backgroundImage: `url(${token.img})`,
                        border: `2px solid ${
                          token.type === "boss" 
                            ? "#ff5555" 
                            : token.type === "monster" 
                            ? "#ff9955" 
                            : "#55ff55"
                        }` 
                      }}
                    />
                  )}
                  
                  <div className="flex-1 truncate">
                    {editMode ? (
                      <Input 
                        value={item.name}
                        onChange={(e) => {
                          onUpdateInitiative(prev => prev.map(i => 
                            i.id === item.id ? { ...i, name: e.target.value } : i
                          ));
                        }}
                        className="h-8 py-1"
                      />
                    ) : (
                      item.name
                    )}
                  </div>
                  
                  {item.isActive && !editMode && (
                    <div className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      Текущий ход
                    </div>
                  )}
                  
                  {editMode && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleRemoveEntry(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
      
      {initiative.length > 0 && !editMode && (
        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevTurn}
          >
            <SkipBack className="h-4 w-4 mr-1" />
            Предыдущий
          </Button>
          
          <Button
            variant="default"
            onClick={handleNextTurn}
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Следующий ход
          </Button>
        </div>
      )}
      
      <div className="flex justify-between gap-2">
        <Button
          variant={battleActive ? "destructive" : "default"}
          onClick={onToggleBattle}
          className="flex-1"
        >
          {battleActive ? "Завершить бой" : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Начать бой
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleRollInitiative}
          className="flex-1"
        >
          Бросить инициативу
        </Button>
      </div>
      
      {/* Диалог добавления нового участника инициативы */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить участника инициативы</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Имя</label>
              <Input
                className="col-span-3"
                value={newEntryName}
                onChange={(e) => setNewEntryName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Бросок</label>
              <Input
                className="col-span-3"
                type="number"
                value={newEntryRoll}
                onChange={(e) => setNewEntryRoll(parseInt(e.target.value) || '')}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAddEntry}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InitiativeTrackerPanel;
