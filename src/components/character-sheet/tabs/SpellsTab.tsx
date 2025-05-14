
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import SpellPanel from '../SpellPanel';
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import SpellSelectionModal from '../SpellSelectionModal';
import { SpellSlotsPanel } from '../SpellSlotsPanel';
import { getSpellLevel, isSpellPrepared, isCharacterSpellObject, getSpellLevelName } from '@/utils/spellHelpers';
import { Book, CircleDot, CircleDotDashed } from 'lucide-react';

interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdate }) => {
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isAddSpellModalOpen, setIsAddSpellModalOpen] = useState(false);
  const { toast } = useToast();

  // Переключение подготовки заклинания
  const toggleSpellPrepared = (spellName: string) => {
    if (!character.spells) return;
    
    const updatedSpells = character.spells.map(spell => {
      const spellObj = isCharacterSpellObject(spell) ? spell : { name: spell, level: 0 };
      
      if (spellObj.name === spellName) {
        return {
          ...spellObj,
          prepared: isCharacterSpellObject(spell) ? !spell.prepared : true
        };
      }
      return spell;
    });
    
    onUpdate({ spells: updatedSpells });
    
    toast({
      title: "Заклинание обновлено",
      description: `Статус подготовки изменен`,
    });
  };

  // Открываем модальное окно для добавления нового заклинания
  const handleAddSpell = () => {
    setIsAddSpellModalOpen(true);
  };

  // Группируем заклинания по уровням
  const spellsByLevel: { [key: number]: any[] } = {};
  if (character.spells && character.spells.length > 0) {
    character.spells.forEach(spell => {
      const level = getSpellLevel(spell);
      if (!spellsByLevel[level]) spellsByLevel[level] = [];
      spellsByLevel[level].push(spell);
    });
  }

  // Функция для использования ячейки заклинания
  const useSpellSlot = (level: number) => {
    if (!character.spellSlots || !character.spellSlots[level]) return;
    
    const slotInfo = character.spellSlots[level];
    if (slotInfo.used >= slotInfo.max) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used + 1
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
    
    toast({
      title: "Ячейка использована",
      description: `Использована ячейка заклинания ${level} уровня`,
    });
  };

  // Функция для восстановления ячейки заклинания
  const restoreSpellSlot = (level: number) => {
    if (!character.spellSlots || !character.spellSlots[level]) return;
    
    const slotInfo = character.spellSlots[level];
    if (slotInfo.used <= 0) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used - 1
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
    
    toast({
      title: "Ячейка восстановлена",
      description: `Восстановлена ячейка заклинания ${level} уровня`,
    });
  };

  // Handle spell selection from modal
  const handleSpellsSelected = (spells: CharacterSpell[]) => {
    const currentSpells = character.spells || [];
    // Merge existing spells with newly selected ones
    const updatedSpells = [...currentSpells];
    
    // Add new spells that aren't already in the list
    spells.forEach(newSpell => {
      const existingIndex = updatedSpells.findIndex(s => 
        (isCharacterSpellObject(s) && isCharacterSpellObject(newSpell) && s.id === newSpell.id) ||
        (isCharacterSpellObject(s) && s.name === newSpell.name)
      );
      
      if (existingIndex === -1) {
        updatedSpells.push(newSpell);
      }
    });
    
    onUpdate({ spells: updatedSpells });
    
    toast({
      title: "Заклинания добавлены",
      description: `Добавлено ${spells.length} заклинаний`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <Book className="mr-2 h-6 w-6" />
          Заклинания
        </h2>
        <Button onClick={() => setIsAddSpellModalOpen(true)}>Добавить заклинание</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">Все заклинания</TabsTrigger>
              <TabsTrigger value="prepared">Подготовленные</TabsTrigger>
              <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {Object.keys(spellsByLevel).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(spellsByLevel).sort(([a, b]) => Number(a) - Number(b)).map(([level, levelSpells]) => (
                    <Card key={level}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {level === '0' ? 'Заговоры' : getSpellLevelName(parseInt(level))}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[150px]">
                          <div className="space-y-2">
                            {levelSpells.map(spell => {
                              const name = isCharacterSpellObject(spell) ? spell.name : spell;
                              return (
                                <div key={name} className="flex justify-between items-center p-2 rounded-md hover:bg-accent/20">
                                  <span className="font-medium">{name}</span>
                                  <div className="flex items-center space-x-2">
                                    {parseInt(level) > 0 && (
                                      <Button 
                                        variant={isSpellPrepared(spell) ? "default" : "outline"} 
                                        size="sm"
                                        onClick={() => toggleSpellPrepared(name)}
                                      >
                                        {isSpellPrepared(spell) ? "Подготовлено" : "Подготовить"}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  У вас еще нет заклинаний. Нажмите "Добавить заклинание" чтобы начать.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="prepared">
              {Object.keys(spellsByLevel).length > 0 && 
               character.spells?.some(spell => isCharacterSpellObject(spell) && spell.prepared) ? (
                <div className="space-y-6">
                  {Object.entries(spellsByLevel).map(([level, levelSpells]) => {
                    const preparedSpells = levelSpells.filter(spell => 
                      isCharacterSpellObject(spell) && spell.prepared
                    );
                    
                    if (preparedSpells.length === 0) return null;
                    
                    return (
                      <Card key={`prepared-${level}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {level === '0' ? 'Заговоры' : getSpellLevelName(parseInt(level))}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[150px]">
                            <div className="space-y-2">
                              {preparedSpells.map(spell => (
                                <div key={isCharacterSpellObject(spell) ? spell.name : String(spell)} 
                                     className="flex justify-between items-center p-2 rounded-md hover:bg-accent/20">
                                  <span className="font-medium">
                                    {isCharacterSpellObject(spell) ? spell.name : String(spell)}
                                  </span>
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => toggleSpellPrepared(isCharacterSpellObject(spell) ? spell.name : String(spell))}
                                  >
                                    Отменить
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  У вас еще нет подготовленных заклинаний.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cantrips">
              {spellsByLevel['0'] && spellsByLevel['0'].length > 0 ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Заговоры</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-2">
                        {spellsByLevel['0'].map(spell => (
                          <div key={isCharacterSpellObject(spell) ? spell.name : String(spell)} 
                               className="flex justify-between items-center p-2 rounded-md hover:bg-accent/20">
                            <span className="font-medium">{isCharacterSpellObject(spell) ? spell.name : String(spell)}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  У вас еще нет заговоров.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Колдовство</h3>
          
          {/* Информация о заклинательной способности */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Параметры заклинателя</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Базовая характеристика:</span>
                  <span className="font-medium">{character.spellcasting?.ability || "Не выбрано"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Сложность спасброска:</span>
                  <span className="font-medium">{character.spellcasting?.saveDC || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Бонус атаки:</span>
                  <span className="font-medium">{character.spellcasting?.attackBonus ? `+${character.spellcasting.attackBonus}` : "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Отображение ячеек заклинаний */}
          <SpellSlotsPanel 
            character={character}
            onUpdate={onUpdate}
          />
          
          {/* Дополнительные ресурсы колдовства */}
          {character.sorceryPoints && (
            <div className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Очки колдовства</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <span>Очки:</span>
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          if (!character.sorceryPoints) return;
                          if (character.sorceryPoints.current <= 0) return;
                          
                          onUpdate({
                            sorceryPoints: {
                              ...character.sorceryPoints,
                              current: character.sorceryPoints.current - 1
                            }
                          });
                        }}
                      >
                        -
                      </Button>
                      <span className="mx-2 font-bold">
                        {character.sorceryPoints.current}/{character.sorceryPoints.max}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          if (!character.sorceryPoints) return;
                          if (character.sorceryPoints.current >= character.sorceryPoints.max) return;
                          
                          onUpdate({
                            sorceryPoints: {
                              ...character.sorceryPoints,
                              current: character.sorceryPoints.current + 1
                            }
                          });
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      <Separator />
      
      {/* Модальное окно для добавления заклинаний */}
      <SpellSelectionModal
        open={isAddSpellModalOpen}
        onClose={() => setIsAddSpellModalOpen(false)}
        onSpellsSelected={handleSpellsSelected}
        selectedSpells={character.spells || []}
      />
    </div>
  );
};

export default SpellsTab;
