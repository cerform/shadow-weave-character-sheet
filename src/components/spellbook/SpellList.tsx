
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Sparkles, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SpellData } from '@/hooks/spellbook/types';

interface SpellListProps {
  spells: SpellData[];
  getBadgeColor: (level: number) => string;
  getSchoolBadgeColor: (school: string) => string;
  currentTheme: any;
  handleOpenSpell: (spell: SpellData) => void;
  formatClasses: (classes: string[] | string | undefined) => string;
}

const SpellList = ({ 
  spells, 
  getBadgeColor, 
  getSchoolBadgeColor, 
  currentTheme, 
  handleOpenSpell,
  formatClasses
}: SpellListProps) => {
  const [expandedSpells, setExpandedSpells] = useState<(string | number)[]>([]);
  
  const toggleSpellExpanded = (spellId: string | number) => {
    setExpandedSpells(prev => 
      prev.includes(spellId) 
        ? prev.filter(id => id !== spellId)
        : [...prev, spellId]
    );
  };
  
  const getSpellLevelText = (level: number) => {
    if (level === 0) return 'Заговор';
    return `${level} уровень`;
  };
  
  if (spells.length === 0) {
    return (
      <div className="text-center py-12">
        <Book className="h-12 w-12 mx-auto mb-4 opacity-20" style={{color: currentTheme.textColor || 'white'}} />
        <p style={{color: currentTheme.textColor || 'white'}}>Заклинания не найдены</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {spells.map((spell) => (
        <Card 
          key={spell.id || spell.name} 
          className="border-accent hover:border-primary cursor-pointer transition-all p-0 overflow-hidden"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderColor: currentTheme.accent
          }}
          onClick={() => handleOpenSpell(spell)}
        >
          <CardContent className="p-0">
            <div className="p-3 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium mb-1" style={{color: currentTheme.textColor || 'white'}}>
                  {spell.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    style={{
                      backgroundColor: getBadgeColor(spell.level),
                      color: 'white'
                    }}
                  >
                    {getSpellLevelText(spell.level)}
                  </Badge>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: currentTheme.textColor || 'white',
                      borderColor: getSchoolBadgeColor(spell.school)
                    }}
                  >
                    {spell.school}
                  </Badge>
                  {spell.ritual && (
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: currentTheme.textColor || 'white',
                        borderColor: currentTheme.accent
                      }}
                    >
                      Ритуал
                    </Badge>
                  )}
                  {spell.concentration && (
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: currentTheme.textColor || 'white',
                        borderColor: currentTheme.accent
                      }}
                    >
                      Концентрация
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSpellExpanded(spell.id || spell.name);
                }}
                style={{
                  color: currentTheme.textColor || 'white'
                }}
              >
                {expandedSpells.includes(spell.id || spell.name) ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
            </div>
            
            {expandedSpells.includes(spell.id || spell.name) && (
              <div className="px-3 pb-3 border-t border-accent pt-2">
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div><span className="font-medium" style={{color: currentTheme.accent}}>Время накл.:</span> <span style={{color: currentTheme.textColor || 'white'}}>{spell.castingTime || 'Не указано'}</span></div>
                  <div><span className="font-medium" style={{color: currentTheme.accent}}>Дальность:</span> <span style={{color: currentTheme.textColor || 'white'}}>{spell.range || 'Не указано'}</span></div>
                  <div><span className="font-medium" style={{color: currentTheme.accent}}>Компоненты:</span> <span style={{color: currentTheme.textColor || 'white'}}>{spell.components || 'Не указано'}</span></div>
                  <div><span className="font-medium" style={{color: currentTheme.accent}}>Длительность:</span> <span style={{color: currentTheme.textColor || 'white'}}>{spell.duration || 'Не указано'}</span></div>
                  <div className="col-span-2"><span className="font-medium" style={{color: currentTheme.accent}}>Классы:</span> <span style={{color: currentTheme.textColor || 'white'}}>{formatClasses(spell.classes)}</span></div>
                </div>
                
                {spell.description && (
                  <ScrollArea className="max-h-32 mt-2">
                    <p className="text-sm whitespace-pre-line" style={{color: currentTheme.textColor || 'white'}}>
                      {spell.description.length > 200 
                        ? spell.description.substring(0, 200) + '...'
                        : spell.description
                      }
                    </p>
                  </ScrollArea>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SpellList;
