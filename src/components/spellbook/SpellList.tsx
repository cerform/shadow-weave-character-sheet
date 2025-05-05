
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpellData } from '@/hooks/spellbook/types';

interface SpellListProps {
  spells: SpellData[];
  getBadgeColor: (level: number) => string;
  getSchoolBadgeColor: (school: string) => string;
  currentTheme: any;
  handleOpenSpell: (spell: SpellData) => void;
  formatClasses: (classes: string[] | string | undefined) => string;
  totalShown: string;
}

const SpellList: React.FC<SpellListProps> = ({
  spells,
  getBadgeColor,
  getSchoolBadgeColor,
  currentTheme,
  handleOpenSpell,
  formatClasses,
  totalShown
}) => {
  return (
    <div className="h-full">
      <Card className="bg-black/60 backdrop-blur-sm border-accent/30 mb-4">
        <CardContent className="p-3">
          <div className="text-sm flex justify-between items-center">
            <span>Показано: <strong>{totalShown}</strong></span>
          </div>
        </CardContent>
      </Card>
    
      <div className="space-y-4">
        {spells.length > 0 ? (
          spells.map((spell, index) => (
            <Card 
              key={spell.id !== undefined ? String(spell.id) : `spell-${index}`} 
              className="spell-card border border-accent/40 hover:border-primary transition-all"
              onClick={() => handleOpenSpell(spell)}
              style={{
                backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)'}`,
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold" style={{color: currentTheme.textColor || 'white'}}>{spell.name}</h4>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: `${getBadgeColor(spell.level)}70`,
                      color: currentTheme.textColor || 'white',
                      borderColor: getBadgeColor(spell.level)
                    }}
                  >
                    {spell.level === 0 ? "Заговор" : `${spell.level}-й уровень`}
                  </Badge>
                </div>
                <div className="flex items-center text-sm mb-2 flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: currentTheme.textColor || 'white',
                      borderColor: getSchoolBadgeColor(spell.school || '')
                    }}
                  >
                    {spell.school}
                  </Badge>
                  {(spell.ritual) && (
                    <Badge variant="outline" style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: currentTheme.textColor || 'white',
                      borderColor: currentTheme.accent
                    }}>
                      Ритуал
                    </Badge>
                  )}
                  {(spell.concentration) && (
                    <Badge variant="outline" style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: currentTheme.textColor || 'white',
                      borderColor: currentTheme.accent
                    }}>
                      Концентрация
                    </Badge>
                  )}
                </div>
                <Separator className="my-2 bg-accent/30" />
                <div className="grid grid-cols-2 gap-2 text-sm" style={{color: currentTheme.textColor || 'white'}}>
                  <div>
                    <span className="font-semibold">Время накладывания:</span> {spell.castingTime}
                  </div>
                  <div>
                    <span className="font-semibold">Дистанция:</span> {spell.range}
                  </div>
                  <div>
                    <span className="font-semibold">Компоненты:</span> {spell.components}
                  </div>
                  <div>
                    <span className="font-semibold">Длительность:</span> {spell.duration}
                  </div>
                </div>
                {spell.classes && (
                  <div className="mt-2 text-sm" style={{color: currentTheme.textColor || 'white'}}>
                    <span className="font-semibold">Классы:</span> {formatClasses(spell.classes)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Заклинания не найдены. Попробуйте изменить критерии поиска.
          </div>
        )}
      </div>
    </div>
  );
};

export default SpellList;
