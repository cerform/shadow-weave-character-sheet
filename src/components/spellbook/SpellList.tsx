
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
}

const SpellList: React.FC<SpellListProps> = ({
  spells,
  getBadgeColor,
  getSchoolBadgeColor,
  currentTheme,
  handleOpenSpell,
  formatClasses,
}) => {
  return (
    <ScrollArea className="h-[70vh]">
      <div className="p-4 space-y-4">
        {spells.length > 0 ? (
          spells.map((spell, index) => (
            <Card 
              key={spell.id !== undefined ? String(spell.id) : `spell-${index}`} 
              className="spell-card border border-accent hover:border-primary cursor-pointer transition-all"
              onClick={() => handleOpenSpell(spell)}
              style={{
                backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)'}`
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold" style={{color: currentTheme.textColor || 'white'}}>{spell.name}</h4>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: currentTheme.accent,
                      color: currentTheme.textColor || 'white'
                    }}
                  >
                    {spell.level === 0 ? "Заговор" : `${spell.level} уровень`}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge 
                    variant="outline"
                    style={{
                      borderColor: getSchoolBadgeColor(spell.school)
                    }}
                  >
                    {spell.school}
                  </Badge>
                  
                  {spell.ritual && (
                    <Badge 
                      variant="outline"
                    >
                      Ритуал
                    </Badge>
                  )}
                  
                  {spell.concentration && (
                    <Badge 
                      variant="outline"
                    >
                      Концентрация
                    </Badge>
                  )}
                </div>
                
                <Separator className="my-2" />
                
                <div className="text-sm text-muted-foreground truncate">
                  {spell.description?.substring(0, 100)}...
                </div>
                
                <div className="mt-2 text-xs">
                  <span className="font-medium">Классы:</span> {formatClasses(spell.classes)}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Заклинания не найдены</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default SpellList;
