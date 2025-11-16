import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { useCombatStore, Condition } from '@/stores/combatStore';
import useBattleStore from '@/stores/battleStore';

const PRESET_CONDITIONS: Omit<Condition, 'id' | 'duration'>[] = [
  {
    name: 'Ошеломлён',
    description: 'Не может совершать действия или реакции.',
    effects: { speedModifier: 0 }
  },
  {
    name: 'Отравлен',
    description: 'Помеха к броскам атаки и проверкам характеристик.',
    effects: { advantageType: 'disadvantage' }
  },
  {
    name: 'Лежит ничком',
    description: 'Скорость равна 0, помеха к атакам.',
    effects: { speedModifier: 0, advantageType: 'disadvantage' }
  },
  {
    name: 'Ослеплён',
    description: 'Автоматически проваливает проверки Зрения.',
    effects: { advantageType: 'disadvantage' }
  },
  {
    name: 'Оглушён',
    description: 'Недееспособен, не может двигаться или говорить.',
    effects: { speedModifier: 0 }
  },
  {
    name: 'Испуган',
    description: 'Помеха к проверкам характеристик и броскам атаки.',
    effects: { advantageType: 'disadvantage' }
  }
];

interface ConditionsPanelProps {
  tokenId?: string;
}

export const ConditionsPanel: React.FC<ConditionsPanelProps> = ({ tokenId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string>(tokenId || '');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [duration, setDuration] = useState<number>(1);

  const { addCondition, removeCondition, getTokenConditions } = useCombatStore();
  const { tokens } = useBattleStore();

  const currentTokenConditions = selectedTokenId ? getTokenConditions(selectedTokenId) : [];

  const handleAddCondition = () => {
    if (!selectedTokenId) return;

    let conditionData;
    
    if (selectedCondition === 'custom') {
      if (!customName.trim()) return;
      conditionData = {
        name: customName,
        description: customDescription,
        effects: {}
      };
    } else {
      const preset = PRESET_CONDITIONS.find(c => c.name === selectedCondition);
      if (!preset) return;
      conditionData = preset;
    }

    const condition: Condition = {
      id: `condition_${Date.now()}_${Math.random()}`,
      ...conditionData,
      duration
    };

    addCondition(selectedTokenId, condition);
    setIsDialogOpen(false);
    setSelectedCondition('');
    setCustomName('');
    setCustomDescription('');
    setDuration(1);
  };

  const handleRemoveCondition = (conditionId: string) => {
    if (!selectedTokenId) return;
    removeCondition(selectedTokenId, conditionId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Состояния</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить состояние</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="token-select">Токен</Label>
                  <Select value={selectedTokenId} onValueChange={setSelectedTokenId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите токен" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map(token => (
                        <SelectItem key={token.id} value={token.id.toString()}>
                          {token.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="condition-select">Состояние</Label>
                  <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите состояние" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_CONDITIONS.map(condition => (
                        <SelectItem key={condition.name} value={condition.name}>
                          {String(condition.name || '')}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Пользовательское...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedCondition === 'custom' && (
                  <>
                    <div>
                      <Label htmlFor="custom-name">Название</Label>
                      <Input
                        id="custom-name"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Название состояния"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-description">Описание</Label>
                      <Textarea
                        id="custom-description"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="Описание эффекта"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="duration">Длительность (раундов)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  />
                </div>

                <Button 
                  onClick={handleAddCondition}
                  disabled={!selectedTokenId || !selectedCondition || (selectedCondition === 'custom' && !customName.trim())}
                  className="w-full"
                >
                  Добавить состояние
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedTokenId && !tokenId ? (
          <div className="text-center text-muted-foreground py-4">
            Выберите токен для просмотра состояний
          </div>
        ) : currentTokenConditions.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            Нет активных состояний
          </div>
        ) : (
          <div className="space-y-2">
            {currentTokenConditions.map((condition) => (
              <div
                key={condition.id}
                className="flex items-start justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{String(condition.name || '')}</span>
                    <Badge variant="outline">
                      {String(condition.duration || 0)} раунд{(condition.duration || 0) > 1 ? 'ов' : ''}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {String(condition.description || '')}
                  </p>
                </div>
                <Button
                  onClick={() => handleRemoveCondition(condition.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};