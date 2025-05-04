
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CharacterSpell } from '@/types/character';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface SpellSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSpells: CharacterSpell[];
  onConfirm: (selectedSpells: CharacterSpell[]) => void;
  maxSpellsCount: number;
  maxCantripsCount: number;
  characterClass?: string;
  characterLevel?: number;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  open,
  onOpenChange,
  availableSpells,
  onConfirm,
  maxSpellsCount,
  maxCantripsCount,
  characterClass,
  characterLevel
}) => {
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Подготавливаем заклинания, добавляя уникальные id если их нет
  const processedSpells = availableSpells.map((spell, index) => {
    if (spell.id === undefined) {
      return { ...spell, id: `spell-${index}-${spell.name.replace(/\s+/g, '-').toLowerCase()}` };
    }
    return spell;
  });
  
  // Сбрасываем выбранные заклинания при открытии/закрытии модального окна
  useEffect(() => {
    if (!open) {
      setSelectedSpells([]);
    }
  }, [open]);
  
  // Группируем заклинания по уровням
  const spellsByLevel = processedSpells.reduce((acc, spell) => {
    const level = spell.level || 0;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {} as Record<number, CharacterSpell[]>);
  
  // Разделяем заклинания на заговоры и обычные
  const cantrips = spellsByLevel[0] || [];
  const spells = processedSpells.filter(spell => (spell.level || 0) > 0);
  
  // Счетчики выбранных заклинаний
  const selectedCantripsCount = selectedSpells.filter(spell => (spell.level || 0) === 0).length;
  const selectedSpellsCount = selectedSpells.filter(spell => (spell.level || 0) > 0).length;
  
  // Обработчик выбора заклинания
  const handleSpellToggle = (spell: CharacterSpell, checked: boolean) => {
    if (checked) {
      // Проверяем лимиты перед добавлением
      if ((spell.level === 0 && selectedCantripsCount >= maxCantripsCount) ||
          (spell.level !== 0 && selectedSpellsCount >= maxSpellsCount)) {
        return;
      }
      setSelectedSpells(prev => [...prev, spell]);
    } else {
      setSelectedSpells(prev => prev.filter(s => s.id !== spell.id));
    }
  };
  
  // Обработчик подтверждения выбора заклинаний
  const handleConfirm = () => {
    onConfirm(selectedSpells);
  };
  
  // Получаем имя или id заклинания для использования в качестве ключа
  const getSpellKey = (spell: CharacterSpell) => {
    return spell.id || spell.name;
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Выбор новых заклинаний</SheetTitle>
          <SheetDescription>
            {characterClass && characterLevel && (
              <>
                Персонаж класса {characterClass} уровня {characterLevel + 1} может выбрать:
                {maxCantripsCount > 0 && (
                  <div className="mt-1">• {maxCantripsCount} новых заговоров</div>
                )}
                {maxSpellsCount > 0 && (
                  <div className="mt-1">• {maxSpellsCount} новых заклинаний</div>
                )}
              </>
            )}
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="cantrips">Заговоры ({selectedCantripsCount}/{maxCantripsCount})</TabsTrigger>
              <TabsTrigger value="spells">Заклинания ({selectedSpellsCount}/{maxSpellsCount})</TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              <ScrollArea className="h-[60vh] pr-4">
                {activeTab === "all" && (
                  <div className="space-y-6">
                    {cantrips.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Заговоры</h4>
                        <div className="space-y-2">
                          {cantrips.map(spell => (
                            <div key={getSpellKey(spell)} className="flex items-start space-x-2 p-2 rounded-md bg-card/50">
                              <Checkbox 
                                id={`spell-${getSpellKey(spell)}`} 
                                checked={selectedSpells.some(s => s.id === spell.id || s.name === spell.name)}
                                onCheckedChange={(checked) => handleSpellToggle(spell, checked === true)}
                                disabled={!selectedSpells.some(s => s.id === spell.id || s.name === spell.name) && selectedCantripsCount >= maxCantripsCount}
                              />
                              <div className="space-y-1">
                                <Label 
                                  htmlFor={`spell-${getSpellKey(spell)}`} 
                                  className="font-medium cursor-pointer"
                                >
                                  {spell.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {spell.school} • {spell.castingTime}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {Object.entries(spellsByLevel).filter(([level]) => level !== "0").map(([level, levelSpells]) => (
                      <div key={level}>
                        <h4 className="text-sm font-medium mb-2">Уровень {level}</h4>
                        <div className="space-y-2">
                          {levelSpells.map(spell => (
                            <div key={getSpellKey(spell)} className="flex items-start space-x-2 p-2 rounded-md bg-card/50">
                              <Checkbox 
                                id={`spell-${getSpellKey(spell)}`} 
                                checked={selectedSpells.some(s => s.id === spell.id || s.name === spell.name)}
                                onCheckedChange={(checked) => handleSpellToggle(spell, checked === true)}
                                disabled={!selectedSpells.some(s => s.id === spell.id || s.name === spell.name) && selectedSpellsCount >= maxSpellsCount}
                              />
                              <div className="space-y-1">
                                <Label 
                                  htmlFor={`spell-${getSpellKey(spell)}`} 
                                  className="font-medium cursor-pointer"
                                >
                                  {spell.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {spell.school} • {spell.castingTime}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === "cantrips" && (
                  <div className="space-y-2">
                    {cantrips.map(spell => (
                      <div key={getSpellKey(spell)} className="flex items-start space-x-2 p-2 rounded-md bg-card/50">
                        <Checkbox 
                          id={`spell-cantrip-${getSpellKey(spell)}`} 
                          checked={selectedSpells.some(s => s.id === spell.id || s.name === spell.name)}
                          onCheckedChange={(checked) => handleSpellToggle(spell, checked === true)}
                          disabled={!selectedSpells.some(s => s.id === spell.id || s.name === spell.name) && selectedCantripsCount >= maxCantripsCount}
                        />
                        <div className="space-y-1">
                          <Label 
                            htmlFor={`spell-cantrip-${getSpellKey(spell)}`} 
                            className="font-medium cursor-pointer"
                          >
                            {spell.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {spell.school} • {spell.castingTime}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(spell.description || "").substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === "spells" && (
                  <div className="space-y-6">
                    {Object.entries(spellsByLevel).filter(([level]) => level !== "0").map(([level, levelSpells]) => (
                      <div key={level}>
                        <h4 className="text-sm font-medium mb-2">Уровень {level}</h4>
                        <div className="space-y-2">
                          {levelSpells.map(spell => (
                            <div key={getSpellKey(spell)} className="flex items-start space-x-2 p-2 rounded-md bg-card/50">
                              <Checkbox 
                                id={`spell-level-${getSpellKey(spell)}`} 
                                checked={selectedSpells.some(s => s.id === spell.id || s.name === spell.name)}
                                onCheckedChange={(checked) => handleSpellToggle(spell, checked === true)}
                                disabled={!selectedSpells.some(s => s.id === spell.id || s.name === spell.name) && selectedSpellsCount >= maxSpellsCount}
                              />
                              <div className="space-y-1">
                                <Label 
                                  htmlFor={`spell-level-${getSpellKey(spell)}`} 
                                  className="font-medium cursor-pointer"
                                >
                                  {spell.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {spell.school} • {spell.castingTime}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(spell.description || "").substring(0, 100)}...
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </Tabs>
        </div>
        
        <Separator className="my-4" />
        
        <SheetFooter>
          <Button 
            onClick={handleConfirm}
            disabled={(maxCantripsCount > 0 && selectedCantripsCount < maxCantripsCount) || 
                      (maxSpellsCount > 0 && selectedSpellsCount < maxSpellsCount)}
          >
            Подтвердить выбор
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SpellSelectionModal;
