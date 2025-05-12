
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { useSpellbook } from '@/hooks/spellbook';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import NavigationButtons from './NavigationButtons';
import { getSpellcastingAbilityModifier, filterSpellsByClassAndLevel } from '@/utils/spellUtils';
import { SpellData } from '@/types/spells';

interface CharacterSpellSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const spellbook = useSpellbook();
  const [selectedSpells, setSelectedSpells] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  
  useEffect(() => {
    if (character && character.class) {
      spellbook.loadSpellsForCharacter(character.class, character.level || 1);
    }
  }, [character?.class, character?.level, spellbook]);

  // Фильтрация заклинаний по поиску и классу/уровню
  useEffect(() => {
    if (!spellbook.availableSpells || !character.class) return;

    // Сначала фильтруем по классу и уровню
    const classSpells = filterSpellsByClassAndLevel(
      spellbook.availableSpells, 
      character.class, 
      character.level || 1
    );

    // Затем фильтруем по поиску, если есть
    const searchFiltered = searchTerm
      ? classSpells.filter(spell => {
          const spellName = spell.name?.toLowerCase() || '';
          const spellSchool = spell.school?.toLowerCase() || '';
          const spellDesc = typeof spell.description === 'string' 
            ? spell.description.toLowerCase() 
            : '';
          
          const searchTermLower = searchTerm.toLowerCase();
          
          return spellName.includes(searchTermLower) || 
                 spellSchool.includes(searchTermLower) || 
                 spellDesc.includes(searchTermLower);
        })
      : classSpells;

    setFilteredSpells(searchFiltered);
  }, [spellbook.availableSpells, searchTerm, character.class, character.level]);

  // При инициализации загружаем уже выбранные заклинания
  useEffect(() => {
    if (character.spells) {
      setSelectedSpells(character.spells);
    }
  }, [character.spells]);

  // Обработчик изменения заклинания
  const handleSpellChange = (spell: any, isAdding: boolean) => {
    if (isAdding) {
      setSelectedSpells(prev => [...prev, spell]);
    } else {
      setSelectedSpells(prev => prev.filter(s => s.id !== spell.id && s.name !== spell.name));
    }
  };

  // Обработчик сохранения заклинаний
  const handleSaveSpells = () => {
    updateCharacter({ spells: selectedSpells });
    if (nextStep) nextStep();
  };

  // Проверяем, выбрано ли заклинание
  const isSpellSelected = (spell: any) => {
    return selectedSpells.some(s => 
      (typeof s === 'string' && s === spell.name) ||
      (s.id === spell.id) || 
      (s.name === spell.name)
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Выбор заклинаний</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заклинаний..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList className="w-full">
            <TabsTrigger value="all">Все заклинания</TabsTrigger>
            <TabsTrigger value="selected">Выбранные</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredSpells.length > 0 ? (
                  filteredSpells.map(spell => (
                    <div key={spell.id || spell.name} className="flex items-center justify-between border p-3 rounded">
                      <div>
                        <div className="font-medium">{spell.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {spell.school}, {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                        </div>
                      </div>
                      <Checkbox
                        checked={isSpellSelected(spell)}
                        onCheckedChange={(checked) => handleSpellChange(spell, checked as boolean)}
                        id={`spell-${spell.id || spell.name}`}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    {searchTerm ? 'Заклинания не найдены' : 'Загрузка заклинаний...'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="selected" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {selectedSpells.length > 0 ? (
                  selectedSpells.map(spell => (
                    <div key={typeof spell === 'string' ? spell : (spell.id || spell.name)} className="flex items-center justify-between border p-3 rounded">
                      <div>
                        <div className="font-medium">{typeof spell === 'string' ? spell : spell.name}</div>
                        {typeof spell !== 'string' && (
                          <div className="text-sm text-muted-foreground">
                            {spell.school}, {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleSpellChange(spell, false)}
                      >
                        Удалить
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    Вы еще не выбрали заклинания
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <NavigationButtons
          prevStep={prevStep}
          nextStep={handleSaveSpells}
          nextLabel="Сохранить и продолжить"
        />
      </CardContent>
    </Card>
  );
};

export default CharacterSpellSelection;
