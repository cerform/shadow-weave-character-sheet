
import React, { useState, useEffect } from 'react';
import { CharacterSheet, CharacterSpell } from '@/types/character';
import NavigationButtons from '@/components/character-creation/NavigationButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { spells } from '@/data/spells';

// Функция для получения заклинаний по классу
const getSpellsByClass = (className: string) => {
  if (!className) return [];
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase().includes(className.toLowerCase());
    }
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(c => 
        c.toLowerCase().includes(className.toLowerCase())
      );
    }
    
    return false;
  });
};

// Функция для получения заклинаний по уровню
const getSpellsByLevel = (level: number) => {
  return spells.filter(spell => spell.level === level);
};

interface CharacterSpellSelectionProps {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  prevStep: () => void;
  nextStep: () => void;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character,
  updateCharacter,
  prevStep,
  nextStep,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>(
    Array.isArray(character.spells) ? 
      character.spells.map(spell => {
        if (typeof spell === 'string') {
          // Преобразуем строку в объект CharacterSpell
          const spellDetails = spells.find(s => s.name === spell);
          return spellDetails || { 
            name: spell, 
            level: 0, 
            description: '', 
            school: '' 
          };
        }
        return spell;
      }) : 
      []
  );
  const [availableSpells, setAvailableSpells] = useState<CharacterSpell[]>([]);
  const [activeTab, setActiveTab] = useState("0");
  
  useEffect(() => {
    // Загружаем заклинания для выбранного класса
    if (character.class) {
      const classSpells = getSpellsByClass(character.class);
      setAvailableSpells(classSpells);
    }
  }, [character.class]);
  
  // Фильтрация заклинаний по поисковому запросу и уровню
  const filteredSpells = availableSpells.filter(spell => {
    const matchesSearch = searchTerm === "" || 
      spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = activeTab === "all" || spell.level.toString() === activeTab;
    return matchesSearch && matchesLevel;
  });
  
  const handleAddSpell = (spell: CharacterSpell) => {
    if (selectedSpells.some(s => s.name === spell.name)) return;
    
    setSelectedSpells([...selectedSpells, spell]);
  };
  
  const handleRemoveSpell = (spellName: string) => {
    setSelectedSpells(selectedSpells.filter(s => s.name !== spellName));
  };
  
  const handleNext = () => {
    updateCharacter({ spells: selectedSpells });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выбор заклинаний</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск заклинаний..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="0" value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="w-full overflow-x-auto flex-nowrap">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="0">Заговоры</TabsTrigger>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                <TabsTrigger key={level} value={level.toString()}>
                  {level} уровень
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block mb-2">Доступные заклинания</Label>
              <ScrollArea className="h-[400px] border rounded-md p-2">
                {filteredSpells.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredSpells.map((spell) => (
                      <li 
                        key={spell.name} 
                        className="flex justify-between items-center py-1 px-2 hover:bg-muted/30 rounded cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{spell.name}</div>
                          <div className="text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs mr-1">
                              {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                            </Badge>
                            {spell.school}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleAddSpell(spell)}
                          disabled={selectedSpells.some(s => s.name === spell.name)}
                          className="h-7"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    {searchTerm ? 'Заклинания не найдены' : 'Нет доступных заклинаний для этого класса и уровня'}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            <div>
              <Label className="block mb-2">Выбранные заклинания</Label>
              <ScrollArea className="h-[400px] border rounded-md p-2">
                {selectedSpells.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedSpells.map((spell) => (
                      <li 
                        key={spell.name} 
                        className="flex justify-between items-center py-1 px-2 bg-muted/30 rounded"
                      >
                        <div>
                          <div className="font-medium">{spell.name}</div>
                          <div className="text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs mr-1">
                              {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                            </Badge>
                            {spell.school}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveSpell(spell.name)}
                          className="h-7 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Еще не выбрано ни одного заклинания
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>

      <NavigationButtons
        prevStep={prevStep}
        nextStep={handleNext}
        allowNext={true}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSpellSelection;
