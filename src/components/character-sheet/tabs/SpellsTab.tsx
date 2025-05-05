import React, { useState, useEffect } from 'react';
import { Character } from '@/contexts/CharacterContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, BookOpen, Sparkles } from "lucide-react";
import { CharacterSpell } from '@/types/character';
import { spells, getSpellsByClass, getSpellsByLevel, spellLevelToText } from '@/data/spells';
import { normalizeSpells } from '@/utils/spellUtils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("0");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSpells, setFilteredSpells] = useState<CharacterSpell[]>([]);
  const [showSpellDialog, setShowSpellDialog] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const { toast } = useToast();
  
  // Нормализуем заклинания персонажа (преобразуем строки в объекты)
  const characterSpells = normalizeSpells(Array.isArray(character?.spells) ? character.spells : []);
  
  // Получаем заклинания по классу персонажа
  const classSpells = character?.className 
    ? getSpellsByClass(character.className)
    : [];
  
  // Группируем заклинания персонажа по уровням
  const spellsByLevel: Record<number, CharacterSpell[]> = {};
  characterSpells.forEach(spell => {
    if (!spellsByLevel[spell.level]) {
      spellsByLevel[spell.level] = [];
    }
    spellsByLevel[spell.level].push(spell);
  });
  
  // Обновляем отфильтрованные заклинания при изменении поискового запроса
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSpells(classSpells);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = classSpells.filter(spell => 
      spell.name.toLowerCase().includes(lowerSearchTerm) ||
      (spell.description && spell.description.toLowerCase().includes(lowerSearchTerm)) ||
      (spell.school && spell.school.toLowerCase().includes(lowerSearchTerm))
    );
    
    setFilteredSpells(filtered);
  }, [searchTerm, classSpells]);
  
  // Добавляем заклинание персонажу
  const addSpellToCharacter = (spell: CharacterSpell) => {
    // Проверяем, есть ли уже такое заклинание у персонажа
    const exists = characterSpells.some(s => s.name === spell.name);
    
    if (exists) {
      toast({
        title: "Заклинание уже добавлено",
        description: `${spell.name} уже есть в списке заклинаний персонажа.`,
        variant: "destructive"
      });
      return;
    }
    
    // Добавляем заклинание
    const updatedSpells = [...characterSpells, spell];
    
    onUpdate({
      spells: updatedSpells
    });
    
    toast({
      title: "Заклинание добавлено",
      description: `${spell.name} добавлено в список заклинаний.`
    });
  };
  
  // Удаляем заклинание у персонажа
  const removeSpellFromCharacter = (spellName: string) => {
    const updatedSpells = characterSpells.filter(s => s.name !== spellName);
    
    onUpdate({
      spells: updatedSpells
    });
    
    toast({
      title: "Заклинание удалено",
      description: `${spellName} удалено из списка заклинаний.`
    });
  };
  
  // Переключаем статус подготовки заклинания
  const togglePrepared = (spellName: string) => {
    const updatedSpells = characterSpells.map(s => 
      s.name === spellName ? { ...s, prepared: !s.prepared } : s
    );
    
    onUpdate({
      spells: updatedSpells
    });
  };
  
  // Открываем диалог с деталями заклинания
  const openSpellDetails = (spell: CharacterSpell) => {
    setSelectedSpell(spell);
    setShowSpellDialog(true);
  };
  
  // Рендерим список заклинаний определенного уровня
  const renderSpellList = (level: number) => {
    const spellsOfLevel = spellsByLevel[level] || [];
    
    if (spellsOfLevel.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          Нет заклинаний {level === 0 ? "заговоров" : `${level} уровня`}
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {spellsOfLevel.map(spell => (
          <div 
            key={spell.name} 
            className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 cursor-pointer"
            onClick={() => openSpellDetails(spell)}
          >
            <div className="flex items-center">
              <Checkbox 
                checked={spell.prepared} 
                onCheckedChange={() => togglePrepared(spell.name)}
                onClick={(e) => e.stopPropagation()}
                className="mr-2"
              />
              <div>
                <div className="font-medium">{spell.name}</div>
                <div className="text-xs text-muted-foreground">
                  {spell.school} • {spell.castingTime} • {spell.range}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                removeSpellFromCharacter(spell.name);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    );
  };
  
  // Рендерим вкладки с заклинаниями по уровням
  const renderSpellTabs = () => {
    // Определяем доступные уровни заклинаний
    const availableLevels = Object.keys(spellsByLevel).map(Number).sort((a, b) => a - b);
    
    if (availableLevels.length === 0) {
      return (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">Нет заклинаний</h3>
          <p className="text-muted-foreground">
            Добавьте заклинания из списка доступных заклинаний.
          </p>
        </div>
      );
    }
    
    return (
      <Tabs defaultValue={availableLevels[0].toString()} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          {availableLevels.map(level => (
            <TabsTrigger key={level} value={level.toString()}>
              {level === 0 ? "Заговоры" : `${level} уровень`}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {availableLevels.map(level => (
          <TabsContent key={level} value={level.toString()}>
            <Card>
              <CardHeader>
                <CardTitle>{level === 0 ? "Заговоры" : `Заклинания ${level} уровня`}</CardTitle>
                <CardDescription>
                  {level === 0 
                    ? "Заговоры можно использовать неограниченное количество раз" 
                    : "Отметьте подготовленные заклинания"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {renderSpellList(level)}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    );
  };
  
  // Рендерим список доступных заклинаний для добавления
  const renderAvailableSpells = () => {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заклинаний..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <ScrollArea className="h-[400px] pr-4">
          {filteredSpells.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Заклинания не найдены
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSpells.map(spell => (
                <div 
                  key={spell.name} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                  onClick={() => openSpellDetails(spell)}
                >
                  <div>
                    <div className="font-medium">{spell.name}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-2">
                        {spell.level === 0 ? "Заговор" : `${spell.level} уровень`}
                      </Badge>
                      {spell.school}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      addSpellToCharacter(spell);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  };
  
  // Рендерим информацию о слотах заклинаний
  const renderSpellSlots = () => {
    if (!character.spellSlots) return null;
    
    const slots = Object.entries(character.spellSlots)
      .filter(([level]) => parseInt(level) > 0) // Исключаем заговоры
      .sort(([a], [b]) => parseInt(a) - parseInt(b)); // Сортируем по уровню
    
    if (slots.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h3 className="font-medium mb-2">Слоты заклинаний</h3>
        <div className="grid grid-cols-3 gap-2">
          {slots.map(([level, { max, used }]) => (
            <div key={level} className="bg-accent/20 p-2 rounded-md text-center">
              <div className="text-xs text-muted-foreground">{level} уровень</div>
              <div className="font-bold">{max - used}/{max}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Слоты заклинаний */}
      {renderSpellSlots()}
      
      {/* Вкладки с заклинаниями персонажа */}
      <div>
        <h2 className="text-xl font-bold mb-4">Книга заклинаний</h2>
        {renderSpellTabs()}
      </div>
      
      {/* Список доступных заклинаний */}
      <div>
        <h2 className="text-xl font-bold mb-4">Доступные заклинания</h2>
        {renderAvailableSpells()}
      </div>
      
      {/* Диалог с деталями заклинания */}
      <Dialog open={showSpellDialog} onOpenChange={setShowSpellDialog}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedSpell && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  {selectedSpell.name}
                </DialogTitle>
                <DialogDescription>
                  {spellLevelToText(selectedSpell.level)} • {selectedSpell.school}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label className="text-muted-foreground">Время накладывания</Label>
                  <div>{selectedSpell.castingTime}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Дистанция</Label>
                  <div>{selectedSpell.range}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Компоненты</Label>
                  <div>{selectedSpell.components}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Длительность</Label>
                  <div>{selectedSpell.duration}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-muted-foreground">Описание</Label>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="text-sm">
                    {selectedSpell.description || "Нет описания"}
                  </div>
                  
                  {selectedSpell.higherLevels && (
                    <div className="mt-4">
                      <h4 className="font-medium">На более высоких уровнях:</h4>
                      <p className="text-sm">{selectedSpell.higherLevels}</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                {!characterSpells.some(s => s.name === selectedSpell.name) ? (
                  <Button onClick={() => {
                    addSpellToCharacter(selectedSpell);
                    setShowSpellDialog(false);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => {
                    removeSpellFromCharacter(selectedSpell.name);
                    setShowSpellDialog(false);
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
