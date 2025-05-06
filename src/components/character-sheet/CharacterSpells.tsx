
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Character, CharacterSpell } from '@/types/character';
import { normalizeSpells, convertToSpellData } from '@/utils/spellUtils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, CheckCircle, Circle } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { SpellData } from '@/types/spells';

interface CharacterSpellsProps {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
  onSpellClick?: (spell: SpellData) => void;
}

const CharacterSpells: React.FC<CharacterSpellsProps> = ({ 
  character, 
  onUpdate,
  onSpellClick
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Нормализуем заклинания персонажа
  const spells = useMemo(() => {
    return normalizeSpells(character);
  }, [character.spells]);

  // Группируем заклинания по уровням
  const spellsByLevel = useMemo(() => {
    return spells.reduce((acc: Record<number, CharacterSpell[]>, spell) => {
      const level = spell.level || 0;
      if (!acc[level]) acc[level] = [];
      acc[level].push(spell);
      return acc;
    }, {});
  }, [spells]);

  // Подготовленные заклинания
  const preparedSpells = useMemo(() => {
    return spells.filter(spell => spell.prepared);
  }, [spells]);

  // Получаем цвет для бейджа уровня заклинания
  const getSpellLevelColor = (level: number): string => {
    const colors = {
      0: "#6b7280", // Заговор - серый
      1: "#10b981", // 1 уровень - зеленый
      2: "#3b82f6", // 2 уровень - синий
      3: "#8b5cf6", // 3 уровень - фиолетовый
      4: "#ec4899", // 4 уровень - розовый
      5: "#f59e0b", // 5 уровень - оранжевый
      6: "#ef4444", // 6 уровень - красный
      7: "#6366f1", // 7 уровень - индиго
      8: "#0ea5e9", // 8 уровень - голубой
      9: "#7c3aed"  // 9 уровень - насыщенный фиолетовый
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  // Обработчик переключения "подготовлено"
  const handleTogglePrepared = (spellName: string) => {
    if (!onUpdate) return;

    const updatedSpells = spells.map(spell => {
      if (spell.name === spellName) {
        return { ...spell, prepared: !spell.prepared };
      }
      return spell;
    });

    onUpdate({ spells: updatedSpells });
  };

  // Обработчик клика по заклинанию с правильным преобразованием типов
  const handleSpellClick = (spell: CharacterSpell) => {
    if (onSpellClick) {
      // Преобразуем CharacterSpell в SpellData с дефолтными значениями для обязательных полей
      const spellData: SpellData = convertToSpellData(spell);
      onSpellClick(spellData);
    }
  };

  // Проверка, есть ли заклинания
  if (!spells.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Заклинания</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          У персонажа нет известных заклинаний
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle style={{ color: currentTheme.textColor }}>Заклинания</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="prepared">Подготовленные</TabsTrigger>
            {Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b)).map(level => (
              <TabsTrigger key={`level-tab-${level}`} value={level}>
                {Number(level) === 0 ? 'Заговоры' : `Уровень ${level}`}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[300px]">
            {/* Вкладка "Все заклинания" */}
            <TabsContent value="all" className="space-y-4">
              {Object.entries(spellsByLevel)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([level, spellList]) => {
                  // Проверяем, является ли spellList массивом перед вызовом map
                  const spells = Array.isArray(spellList) ? spellList : [];
                  return (
                    <div key={`level-group-${level}`} className="space-y-2">
                      <h3 className="text-lg font-medium" style={{ color: currentTheme.textColor }}>
                        {Number(level) === 0 ? 'Заговоры' : `Заклинания ${level} уровня`}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {spells.map((spell: CharacterSpell) => (
                          <div 
                            key={`all-${spell.name}`} 
                            className="flex items-center justify-between p-2 border rounded-md hover:bg-black/20"
                            style={{ borderColor: spell.prepared ? getSpellLevelColor(spell.level || 0) : 'inherit' }}
                          >
                            <div className="flex items-center gap-2">
                              <Badge 
                                style={{ backgroundColor: getSpellLevelColor(spell.level || 0) }}
                                className="text-white"
                              >
                                {spell.level === 0 ? 'Заговор' : spell.level}
                              </Badge>
                              <span style={{ color: currentTheme.textColor }}>{spell.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSpellClick(spell)}
                              >
                                <Book className="h-4 w-4" />
                              </Button>
                              {onUpdate && spell.level > 0 && (
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTogglePrepared(spell.name)}
                                >
                                  {spell.prepared ? (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Circle className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </TabsContent>

            {/* Вкладка "Подготовленные заклинания" */}
            <TabsContent value="prepared" className="space-y-2">
              {preparedSpells.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {preparedSpells.map(spell => (
                    <div 
                      key={`prepared-${spell.name}`} 
                      className="flex items-center justify-between p-2 border rounded-md hover:bg-black/20"
                      style={{ borderColor: getSpellLevelColor(spell.level || 0) }}
                    >
                      <div className="flex items-center gap-2">
                        <Badge 
                          style={{ backgroundColor: getSpellLevelColor(spell.level || 0) }}
                          className="text-white"
                        >
                          {spell.level === 0 ? 'Заговор' : spell.level}
                        </Badge>
                        <span style={{ color: currentTheme.textColor }}>{spell.name}</span>
                      </div>
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpellClick(spell)}
                      >
                        <Book className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Нет подготовленных заклинаний
                </div>
              )}
            </TabsContent>

            {/* Вкладки для каждого уровня заклинаний */}
            {Object.entries(spellsByLevel)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([level, spellList]) => {
                // Проверяем, является ли spellList массивом перед вызовом map
                const spells = Array.isArray(spellList) ? spellList : [];
                return (
                  <TabsContent key={`level-content-${level}`} value={level} className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {spells.map((spell: CharacterSpell) => (
                        <div 
                          key={`level-spell-${spell.name}`} 
                          className="flex items-center justify-between p-2 border rounded-md hover:bg-black/20"
                          style={{ borderColor: spell.prepared ? getSpellLevelColor(Number(level)) : 'inherit' }}
                        >
                          <span style={{ color: currentTheme.textColor }}>{spell.name}</span>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSpellClick(spell)}
                            >
                              <Book className="h-4 w-4" />
                            </Button>
                            {onUpdate && Number(level) > 0 && (
                              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePrepared(spell.name)}
                              >
                                {spell.prepared ? (
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                );
              })}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CharacterSpells;
