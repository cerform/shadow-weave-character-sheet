
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Character } from '@/contexts/CharacterContext';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useContext } from 'react';
import { CharacterContext } from '@/contexts/CharacterContext';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Circle, CheckCircle2 } from 'lucide-react';

interface StatsPanelProps {
  character: Character | null;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ character }) => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { updateCharacter } = useContext(CharacterContext);
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Получаем модификатор для характеристики
  const getModifier = (score: number | undefined) => {
    if (score === undefined) return "+0";
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Обработчик использования ячеек заклинаний
  const handleUseSpellSlot = (level: number) => {
    if (!character?.spellSlots) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    
    if (updatedSpellSlots[level] && updatedSpellSlots[level].used < updatedSpellSlots[level].max) {
      updatedSpellSlots[level].used += 1;
      updateCharacter({ spellSlots: updatedSpellSlots });
      
      toast({
        title: "Ячейка использована",
        description: `Использована ячейка ${level} уровня. Осталось: ${updatedSpellSlots[level].max - updatedSpellSlots[level].used}`,
      });
    }
  };
  
  // Обработчик восстановления ячеек заклинаний
  const handleRestoreSpellSlot = (level: number) => {
    if (!character?.spellSlots) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    
    if (updatedSpellSlots[level] && updatedSpellSlots[level].used > 0) {
      updatedSpellSlots[level].used -= 1;
      updateCharacter({ spellSlots: updatedSpellSlots });
      
      toast({
        title: "Ячейка восстановлена",
        description: `Восстановлена ячейка ${level} уровня. Доступно: ${updatedSpellSlots[level].max - updatedSpellSlots[level].used + 1}`,
      });
    }
  };

  // Helper to get current sorcery points safely
  const getSorceryPointsCurrent = () => {
    if (!character?.sorceryPoints) return 0;
    // Check if we have current property, otherwise use (max - used)
    return character.sorceryPoints.current !== undefined 
      ? character.sorceryPoints.current 
      : (character.sorceryPoints.max - character.sorceryPoints.used);
  };

  // Отображение слотов заклинаний
  const renderSpellSlots = () => {
    if (!character?.spellSlots || Object.keys(character.spellSlots).length === 0) {
      return (
        <div className="text-center py-2">
          <Sparkles className="h-5 w-5 mx-auto mb-1 opacity-40" />
          <p className="text-xs" style={{ color: currentTheme.mutedTextColor }}>
            Нет слотов заклинаний
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {Object.entries(character.spellSlots)
          .filter(([_, slot]) => slot.max > 0)
          .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
          .map(([level, slot]) => {
            const usedCount = slot.used;
            const maxCount = slot.max;
            
            return (
              <div key={level} className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium" style={{ color: currentTheme.textColor }}>
                    {level === "0" ? "Заговоры" : `${level} уровень`}
                  </span>
                  <span className="text-xs" style={{ color: currentTheme.mutedTextColor }}>
                    {maxCount - usedCount}/{maxCount}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {[...Array(maxCount)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all`}
                      style={{
                        backgroundColor: i < usedCount ? `${currentTheme.accent}20` : `${currentTheme.accent}40`,
                        border: `1px solid ${currentTheme.accent}`,
                        color: currentTheme.buttonText
                      }}
                      onClick={() => i >= usedCount ? handleUseSpellSlot(parseInt(level)) : handleRestoreSpellSlot(parseInt(level))}
                    >
                      {i < usedCount ? (
                        <Circle className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20 p-4">
      <h3 className="text-lg font-semibold mb-2" style={{ color: currentTheme.textColor }}>
        Спасброски
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-primary">Сила</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.STR)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
          
          <div className="flex justify-between items-center my-2">
            <span className="text-sm font-medium text-primary">Телосложение</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.CON)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
          
          <div className="flex justify-between items-center my-2">
            <span className="text-sm font-medium text-primary">Мудрость</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.WIS)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-primary">Ловкость</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.DEX)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
          
          <div className="flex justify-between items-center my-2">
            <span className="text-sm font-medium text-primary">Интеллект</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.INT)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
          
          <div className="flex justify-between items-center my-2">
            <span className="text-sm font-medium text-primary">Харизма</span>
            <span className="text-sm font-bold text-emerald-400">
              {getModifier(character?.abilities?.CHA)}
            </span>
          </div>
          <Separator className="bg-primary/20" />
        </div>
      </div>

      {/* Секция слотов заклинаний, перенесенная из SpellPanel */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2" style={{ color: currentTheme.textColor }}>
          Магия
        </h3>
        {renderSpellSlots()}
        
        {/* Отображение очков чародейства, если они есть */}
        {character?.sorceryPoints && character.sorceryPoints.max > 0 && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium" style={{ color: currentTheme.textColor }}>
                Очки чародейства
              </span>
              <span className="text-xs" style={{ color: currentTheme.mutedTextColor }}>
                {getSorceryPointsCurrent()}/{character.sorceryPoints.max}
              </span>
            </div>
            <div className="flex justify-between">
              <div className="flex flex-wrap gap-1">
                {[...Array(character.sorceryPoints.max)].map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full"
                    style={{
                      backgroundColor: i < getSorceryPointsCurrent() ? 
                        `${currentTheme.accent}` : "transparent",
                      border: `1px solid ${currentTheme.accent}`,
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    if (character.sorceryPoints) {
                      if (character.sorceryPoints.current !== undefined) {
                        // For objects with current property
                        if (character.sorceryPoints.current < character.sorceryPoints.max) {
                          updateCharacter({
                            sorceryPoints: {
                              ...character.sorceryPoints,
                              current: character.sorceryPoints.current + 1
                            }
                          });
                        }
                      } else {
                        // For objects with used property
                        if (character.sorceryPoints.used > 0) {
                          updateCharacter({
                            sorceryPoints: {
                              ...character.sorceryPoints,
                              used: character.sorceryPoints.used - 1
                            }
                          });
                        }
                      }
                    }
                  }}
                  disabled={getSorceryPointsCurrent() >= character.sorceryPoints.max}
                  style={{
                    borderColor: currentTheme.accent,
                    color: getSorceryPointsCurrent() >= character.sorceryPoints.max ? 
                      `${currentTheme.mutedTextColor}80` : currentTheme.accent
                  }}
                >+</Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    if (character.sorceryPoints) {
                      if (character.sorceryPoints.current !== undefined) {
                        // For objects with current property
                        if (character.sorceryPoints.current > 0) {
                          updateCharacter({
                            sorceryPoints: {
                              ...character.sorceryPoints,
                              current: character.sorceryPoints.current - 1
                            }
                          });
                        }
                      } else {
                        // For objects with used property
                        if (character.sorceryPoints.used < character.sorceryPoints.max) {
                          updateCharacter({
                            sorceryPoints: {
                              ...character.sorceryPoints,
                              used: character.sorceryPoints.used + 1
                            }
                          });
                        }
                      }
                    }
                  }}
                  disabled={getSorceryPointsCurrent() <= 0}
                  style={{
                    borderColor: currentTheme.accent,
                    color: getSorceryPointsCurrent() <= 0 ? 
                      `${currentTheme.mutedTextColor}80` : currentTheme.accent
                  }}
                >-</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
