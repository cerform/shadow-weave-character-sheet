
import React, { useState, useEffect } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { filterSpellsByClassAndLevel, calculateAvailableSpellsByClassAndLevel, getSpellcastingAbilityModifier } from '@/utils/spellUtils';
import { useSpellbook } from '@/contexts/SpellbookContext';
import { SpellData } from '@/types/spells';

interface SpellSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  isOpen,
  onClose,
  character,
  onUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>([]);
  const { spells: allSpells, loadSpellsForClass } = useSpellbook();

  // Получаем модификатор способности для заклинаний
  const abilityModifier = getSpellcastingAbilityModifier(character);

  useEffect(() => {
    if (character.class) {
      loadSpellsForClass(character.class);
    }
    
    // Инициализируем выбранные заклинания из персонажа
    if (character.spells) {
      setSelectedSpells(character.spells as CharacterSpell[]);
    }
  }, [character, loadSpellsForClass]);

  // Фильтруем заклинания по поисковому запросу
  const filteredSpells = searchTerm 
    ? allSpells.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spell.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof spell.description === 'string' && 
          spell.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : allSpells;

  // Группируем заклинания по уровням
  const cantrips = filteredSpells.filter(spell => spell.level === 0 && 
    (Array.isArray(spell.classes) 
      ? spell.classes.some(c => character.class?.toLowerCase().includes(c.toLowerCase()))
      : spell.classes?.toLowerCase().includes(character.class?.toLowerCase()))
  );
  
  const level1Spells = filteredSpells.filter(spell => spell.level === 1 && 
    (Array.isArray(spell.classes) 
      ? spell.classes.some(c => character.class?.toLowerCase().includes(c.toLowerCase()))
      : spell.classes?.toLowerCase().includes(character.class?.toLowerCase()))
  );
  
  const level2PlusSpells = filteredSpells.filter(spell => spell.level >= 2 && 
    (Array.isArray(spell.classes) 
      ? spell.classes.some(c => character.class?.toLowerCase().includes(c.toLowerCase()))
      : spell.classes?.toLowerCase().includes(character.class?.toLowerCase()))
  );

  // Обработчик выбора заклинания
  const toggleSpellSelection = (spell: SpellData) => {
    const isSelected = selectedSpells.some(s => 
      (typeof s === 'string' ? s === spell.id : s.id === spell.id || s.name === spell.name)
    );
    
    let updatedSpells: CharacterSpell[];
    
    if (isSelected) {
      updatedSpells = selectedSpells.filter(s => 
        (typeof s === 'string' ? s !== spell.id : s.id !== spell.id && s.name !== spell.name)
      );
    } else {
      const characterSpell: CharacterSpell = {
        id: spell.id,
        name: spell.name,
        level: spell.level,
        school: spell.school,
        castingTime: spell.castingTime,
        range: spell.range,
        components: spell.components,
        duration: spell.duration,
        description: spell.description,
        classes: spell.classes,
        ritual: spell.ritual,
        concentration: spell.concentration
      };
      updatedSpells = [...selectedSpells, characterSpell];
    }
    
    setSelectedSpells(updatedSpells);
  };

  // Обработчик сохранения заклинаний
  const handleSave = () => {
    onUpdate({ spells: selectedSpells });
    onClose();
  };

  // Вычисляем доступные заклинания
  const { maxSpellLevel, cantripsCount, knownSpells } = calculateAvailableSpellsByClassAndLevel(
    character.class,
    character.level || 1,
    abilityModifier
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Выбор заклинаний</DialogTitle>
          <DialogDescription>
            Выберите заклинания для вашего персонажа.
            <div className="mt-1 text-sm">
              Доступно заговоров: {cantripsCount}, Доступно заклинаний: {knownSpells}, Максимальный уровень: {maxSpellLevel}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge>Выбрано: {selectedSpells.length}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <Input 
            placeholder="Поиск заклинаний..." 
            className="mb-4" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
              <TabsTrigger value="level1">1 уровень</TabsTrigger>
              <TabsTrigger value="level2">2+ уровень</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <ScrollArea className="h-[400px]">
                {filteredSpells.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredSpells
                      .filter(spell => 
                        Array.isArray(spell.classes) 
                          ? spell.classes.some(c => character.class?.toLowerCase().includes(c.toLowerCase()))
                          : spell.classes?.toLowerCase().includes(character.class?.toLowerCase())
                      )
                      .map(spell => {
                        const isSelected = selectedSpells.some(s => 
                          (typeof s === 'string' ? s === spell.id : s.id === spell.id || s.name === spell.name)
                        );
                        return (
                          <Card 
                            key={spell.id} 
                            className={`cursor-pointer transition-colors hover:bg-accent/10 ${isSelected ? 'border-accent' : ''}`}
                            onClick={() => toggleSpellSelection(spell)}
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start">
                                <span className="font-medium">{spell.name}</span>
                                <Badge variant={isSelected ? "default" : "outline"}>
                                  {isSelected ? 'Выбрано' : 'Добавить'}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {spell.school}, {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    Не найдено заклинаний для класса {character.class}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="cantrips">
              <ScrollArea className="h-[400px]">
                {cantrips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cantrips.map(spell => {
                      const isSelected = selectedSpells.some(s => 
                        (typeof s === 'string' ? s === spell.id : s.id === spell.id || s.name === spell.name)
                      );
                      return (
                        <Card 
                          key={spell.id} 
                          className={`cursor-pointer hover:bg-accent/10 ${isSelected ? 'border-accent' : ''}`}
                          onClick={() => toggleSpellSelection(spell)}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{spell.name}</span>
                              <Badge variant={isSelected ? "default" : "outline"}>
                                {isSelected ? 'Выбрано' : 'Добавить'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {spell.school}, Заговор
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    Не найдено заговоров для класса {character.class}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="level1">
              <ScrollArea className="h-[400px]">
                {level1Spells.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {level1Spells.map(spell => {
                      const isSelected = selectedSpells.some(s => 
                        (typeof s === 'string' ? s === spell.id : s.id === spell.id || s.name === spell.name)
                      );
                      return (
                        <Card 
                          key={spell.id} 
                          className={`cursor-pointer hover:bg-accent/10 ${isSelected ? 'border-accent' : ''}`}
                          onClick={() => toggleSpellSelection(spell)}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{spell.name}</span>
                              <Badge variant={isSelected ? "default" : "outline"}>
                                {isSelected ? 'Выбрано' : 'Добавить'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {spell.school}, 1 уровень
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    Не найдено заклинаний 1 уровня для класса {character.class}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="level2">
              <ScrollArea className="h-[400px]">
                {level2PlusSpells.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {level2PlusSpells.map(spell => {
                      const isSelected = selectedSpells.some(s => 
                        (typeof s === 'string' ? s === spell.id : s.id === spell.id || s.name === spell.name)
                      );
                      return (
                        <Card 
                          key={spell.id} 
                          className={`cursor-pointer hover:bg-accent/10 ${isSelected ? 'border-accent' : ''}`}
                          onClick={() => toggleSpellSelection(spell)}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{spell.name}</span>
                              <Badge variant={isSelected ? "default" : "outline"}>
                                {isSelected ? 'Выбрано' : 'Добавить'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {spell.school}, {spell.level} уровень
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    Не найдено заклинаний 2+ уровня для класса {character.class}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
