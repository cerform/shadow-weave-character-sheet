
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SpellData } from '@/types/spells';
import { Character } from '@/types/character';
import { Button } from '@/components/ui/button';
import { getSpellLevelName } from '@/utils/spellHelpers';

interface SpellDetailsProps {
  spell: SpellData | null;
  character?: Character;
  onTogglePrepared?: (spellId: string, prepared: boolean) => void;
}

const SpellDetails: React.FC<SpellDetailsProps> = ({ 
  spell, 
  character,
  onTogglePrepared
}) => {
  if (!spell) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground py-12">
          Выберите заклинание для просмотра деталей
        </CardContent>
      </Card>
    );
  }

  const togglePrepared = () => {
    if (onTogglePrepared && spell) {
      onTogglePrepared(spell.id, !spell.prepared);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{spell.name}</CardTitle>
            <div className="text-sm text-muted-foreground flex items-center mt-1">
              <span>{getSpellLevelName(spell.level)}</span>
              <span className="mx-2">•</span>
              <span>{spell.school}</span>
              
              {spell.ritual && (
                <>
                  <span className="mx-2">•</span>
                  <Badge variant="outline">Ритуал</Badge>
                </>
              )}
              
              {spell.concentration && (
                <>
                  <span className="mx-2">•</span>
                  <Badge variant="outline">Концентрация</Badge>
                </>
              )}
            </div>
          </div>
          
          {onTogglePrepared && (
            <Button 
              variant={spell.prepared ? "default" : "outline"}
              size="sm"
              onClick={togglePrepared}
            >
              {spell.prepared ? 'Подготовлено' : 'Подготовить'}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Время накладывания:</span>
              <div>{spell.castingTime}</div>
            </div>
            
            <div>
              <span className="font-medium">Дистанция:</span>
              <div>{spell.range}</div>
            </div>
            
            <div>
              <span className="font-medium">Компоненты:</span>
              <div className="flex gap-1 mt-1">
                {spell.verbal && <Badge variant="outline">В</Badge>}
                {spell.somatic && <Badge variant="outline">С</Badge>}
                {spell.material && <Badge variant="outline">М</Badge>}
                {!spell.verbal && !spell.somatic && !spell.material && 
                  <span className="text-muted-foreground italic">Нет</span>
                }
              </div>
            </div>
            
            <div>
              <span className="font-medium">Длительность:</span>
              <div>{spell.duration}</div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Описание</h4>
            <div className="text-sm space-y-2">
              {typeof spell.description === 'string' ? (
                <p>{spell.description}</p>
              ) : Array.isArray(spell.description) ? (
                spell.description.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))
              ) : null}
            </div>
          </div>
          
          {spell.classes && spell.classes.length > 0 && (
            <>
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Классы</h4>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(spell.classes) ? (
                    spell.classes.map((cls, i) => (
                      <Badge key={i} variant="outline">
                        {cls}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">{spell.classes}</Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellDetails;
