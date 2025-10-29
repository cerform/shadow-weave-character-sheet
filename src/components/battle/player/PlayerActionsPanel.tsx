import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Swords, 
  Shield, 
  Sparkles, 
  Users, 
  Skull,
  Dices,
  BookOpen,
  Target
} from 'lucide-react';
import { SummonCreatureDialog } from '../SummonCreatureDialog';
import { EnhancedToken } from '@/stores/enhancedBattleStore';
import { useToast } from '@/hooks/use-toast';

interface PlayerActionsPanelProps {
  token?: EnhancedToken;
  sessionId: string;
  onAction?: (actionType: string, data?: any) => void;
  onSummon?: (creature: any) => void;
}

export const PlayerActionsPanel: React.FC<PlayerActionsPanelProps> = ({
  token,
  sessionId,
  onAction,
  onSummon
}) => {
  const { toast } = useToast();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleAttack = () => {
    setSelectedAction('attack');
    onAction?.('attack');
    toast({
      title: "Атака",
      description: "Выберите цель на карте",
    });
  };

  const handleSavingThrow = (ability: string) => {
    onAction?.('saving_throw', { ability });
    toast({
      title: "Спасбросок",
      description: `Бросок спасброска: ${ability}`,
    });
  };

  const handleSkillCheck = () => {
    onAction?.('skill_check');
    toast({
      title: "Проверка навыка",
      description: "Выберите навык для проверки",
    });
  };

  const handleEndTurn = () => {
    onAction?.('end_turn');
    toast({
      title: "Конец хода",
      description: "Ход завершен",
    });
  };

  if (!token) {
    return (
      <Card className="w-full">
        <CardContent className="py-4 text-center text-muted-foreground">
          <p className="text-sm">Ожидание персонажа...</p>
        </CardContent>
      </Card>
    );
  }

  const canSummon = ['necromancer', 'druid', 'wizard', 'warlock', 'ranger'].includes(
    token.class?.toLowerCase() || ''
  );

  return (
    <Card className="w-full border-t-2 border-primary/20">
      <CardContent className="py-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {/* Атака */}
          <Button
            variant={selectedAction === 'attack' ? 'default' : 'outline'}
            size="sm"
            onClick={handleAttack}
            className="flex items-center gap-1"
          >
            <Swords className="h-4 w-4" />
            Атака
            <Badge variant="secondary" className="ml-1 text-xs">
              A
            </Badge>
          </Button>

          {/* Защита */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction?.('dodge')}
            className="flex items-center gap-1"
          >
            <Shield className="h-4 w-4" />
            Защита
            <Badge variant="secondary" className="ml-1 text-xs">
              A
            </Badge>
          </Button>

          {/* Спасброски */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSavingThrow('dex')}
            className="flex items-center gap-1"
          >
            <Target className="h-4 w-4" />
            Спасбросок
          </Button>

          {/* Проверка навыка */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkillCheck}
            className="flex items-center gap-1"
          >
            <Dices className="h-4 w-4" />
            Навык
          </Button>

          {/* Книга заклинаний */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction?.('spellbook')}
            className="flex items-center gap-1"
          >
            <BookOpen className="h-4 w-4" />
            Заклинания
          </Button>

          {/* Призыв существа */}
          {canSummon && token && (
            <SummonCreatureDialog
              parentToken={token}
              sessionId={sessionId}
              onSummon={onSummon}
            />
          )}

          {/* Завершить ход */}
          <Button
            variant="default"
            size="sm"
            onClick={handleEndTurn}
            className="flex items-center gap-1 ml-auto"
          >
            <Sparkles className="h-4 w-4" />
            Завершить ход
          </Button>
        </div>

        {/* Подсказка о выбранном действии */}
        {selectedAction && (
          <div className="mt-2 p-2 bg-primary/10 rounded text-xs text-center">
            {selectedAction === 'attack' && 'Выберите цель для атаки на карте'}
            {selectedAction === 'spell' && 'Выберите заклинание из книги заклинаний'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
