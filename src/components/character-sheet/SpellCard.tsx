
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CircleSlash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpellData } from '@/types/spells';

interface SpellCardProps {
  spell: SpellData;
  onTogglePrepared: () => void;
  onClick: () => void;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, onTogglePrepared, onClick }) => {
  const handlePrepareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    onTogglePrepared();
  };

  const getSpellLevelName = (level: number) => {
    if (level === 0) return 'Заговор';
    return `${level} уровень`;
  };

  return (
    <Card 
      onClick={onClick}
      className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors mb-2 relative"
    >
      <CardContent className="p-0 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">{spell.name}</h4>
            <Badge variant="outline" className="text-xs">
              {getSpellLevelName(spell.level)}
            </Badge>
            {spell.school && (
              <Badge variant="secondary" className="text-xs">
                {spell.school}
              </Badge>
            )}
            {spell.concentration && (
              <Badge variant="destructive" className="text-xs">
                Концентрация
              </Badge>
            )}
            {spell.ritual && (
              <Badge variant="outline" className="text-xs">
                Ритуал
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground mt-1">
            {spell.components && <span className="mr-2">Компоненты: {spell.components}</span>}
            {spell.range && <span className="mr-2">Дистанция: {spell.range}</span>}
          </div>
        </div>
        
        {spell.level > 0 && (
          <Button
            variant={spell.prepared ? "default" : "outline"}
            size="sm"
            onClick={handlePrepareClick}
            className={`min-w-24 ${spell.prepared ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {spell.prepared ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Подготовлено
              </>
            ) : (
              <>
                <CircleSlash className="mr-1 h-4 w-4" />
                Не подготовлено
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SpellCard;
