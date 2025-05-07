
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Play, Pause, SkipForward, UserCircle, X, MoveDown, MoveUp } from 'lucide-react';
import { Initiative, TokenData } from '@/types/session.types';

export interface InitiativeTrackerPanelProps {
  initiatives: Initiative[];
  tokens: TokenData[];
  battleActive: boolean;
  sessionId: string;
  onUpdateInitiatives: (newInitiative: Initiative[]) => void;
  onToggleBattle: () => void;
  onNextTurn: () => void;
}

export const InitiativeTrackerPanel: React.FC<InitiativeTrackerPanelProps> = ({
  initiatives,
  tokens,
  battleActive,
  sessionId,
  onUpdateInitiatives,
  onToggleBattle,
  onNextTurn
}) => {
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newInitiativeRoll, setNewInitiativeRoll] = useState('');

  // Обработчик добавления нового участника инициативы
  const handleAddInitiative = () => {
    if (!newCharacterName || !newInitiativeRoll) return;
    
    const roll = parseInt(newInitiativeRoll);
    if (isNaN(roll)) return;
    
    const newInitiative: Initiative = {
      id: `manual-${Date.now()}`,
      name: newCharacterName,
      initiative: roll,
      roll: roll,
      isActive: false
    };
    
    const updatedInitiatives = [...initiatives, newInitiative]
      .sort((a, b) => b.initiative - a.initiative);
    
    onUpdateInitiatives(updatedInitiatives);
    
    setNewCharacterName('');
    setNewInitiativeRoll('');
  };

  // Обработчик удаления участника инициативы
  const handleRemoveInitiative = (id: string) => {
    const updatedInitiatives = initiatives.filter(init => init.id !== id);
    onUpdateInitiatives(updatedInitiatives);
  };

  // Обработчик перемещения участника вверх в списке инициативы
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    
    const updatedInitiatives = [...initiatives];
    const temp = updatedInitiatives[index - 1];
    updatedInitiatives[index - 1] = updatedInitiatives[index];
    updatedInitiatives[index] = temp;
    
    onUpdateInitiatives(updatedInitiatives);
  };

  // Обработчик перемещения участника вниз в списке инициативы
  const handleMoveDown = (index: number) => {
    if (index >= initiatives.length - 1) return;
    
    const updatedInitiatives = [...initiatives];
    const temp = updatedInitiatives[index + 1];
    updatedInitiatives[index + 1] = updatedInitiatives[index];
    updatedInitiatives[index] = temp;
    
    onUpdateInitiatives(updatedInitiatives);
  };

  // Обработчик броска инициативы для всех токенов
  const handleRollForAll = () => {
    const newInitiatives: Initiative[] = [];
    
    // Создаем инициативу для каждого токена
    tokens.forEach(token => {
      const roll = Math.floor(Math.random() * 20) + 1;
      newInitiatives.push({
        id: token.id,
        tokenId: token.id,
        name: token.name || `Токен ${token.id}`,
        initiative: roll,
        roll: roll,
        isActive: false
      });
    });
    
    // Сортируем по значению инициативы
    const sortedInitiatives = newInitiatives.sort((a, b) => b.initiative - a.initiative);
    
    // Устанавливаем активным первого участника
    if (sortedInitiatives.length > 0) {
      sortedInitiatives[0].isActive = true;
    }
    
    onUpdateInitiatives(sortedInitiatives);
  };

  // Обработчик очистки списка инициативы
  const handleClearInitiative = () => {
    onUpdateInitiatives([]);
  };

  // Вспомогательная функция для получения URL изображения токена
  const getTokenImage = (tokenId?: string) => {
    if (!tokenId) return null;
    const token = tokens.find(t => t.id === tokenId);
    return token?.img || token?.image;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">
          Трекер инициативы
          {battleActive && <span className="ml-2 text-green-500">(Активен)</span>}
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleBattle}
          >
            {battleActive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {battleActive ? 'Пауза' : 'Старт'}
          </Button>
          
          {battleActive && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onNextTurn}
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Следующий
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Список инициативы */}
        <div className="space-y-2 mb-4">
          {initiatives.length === 0 ? (
            <div className="text-center py-2 text-muted-foreground">
              Список инициативы пуст
            </div>
          ) : (
            initiatives.map((init, index) => (
              <div 
                key={init.id} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  init.isActive ? 'bg-primary/20 border border-primary' : 'bg-secondary/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getTokenImage(init.tokenId) ? (
                    <img 
                      src={getTokenImage(init.tokenId)!} 
                      alt={init.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-8 h-8 text-muted-foreground" />
                  )}
                  <span className="font-medium">{init.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 px-2 py-0.5 rounded-full text-sm">
                    {init.initiative}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveUp(index)}>
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveDown(index)}>
                      <MoveDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveInitiative(init.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Форма добавления нового участника */}
        <div className="flex gap-2">
          <Input 
            placeholder="Имя" 
            value={newCharacterName}
            onChange={e => setNewCharacterName(e.target.value)}
          />
          <Input 
            placeholder="Инициатива" 
            value={newInitiativeRoll}
            onChange={e => setNewInitiativeRoll(e.target.value)}
            className="w-20"
            type="number"
          />
          <Button onClick={handleAddInitiative}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>
        
        {/* Дополнительные кнопки управления */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleRollForAll}>
            Бросить для всех
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={handleClearInitiative}>
            Очистить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InitiativeTrackerPanel;
