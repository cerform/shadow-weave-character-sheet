
import React, { useState, useEffect } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Sparkles } from "lucide-react";
import SpellCastingPanel from '../SpellCastingPanel';
import SpellPanel from '../SpellPanel';
import { SpellSelectionModal } from '../SpellSelectionModal';

interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

interface SpellsByLevel {
  [level: number]: (string | CharacterSpell)[];
}

const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdate }) => {
  const [spellsByLevel, setSpellsByLevel] = useState<SpellsByLevel>({});
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Группируем заклинания по уровням
  useEffect(() => {
    const groupedSpells: SpellsByLevel = {};
    
    // Инициализируем все уровни пустыми массивами от 0 до 9
    for (let i = 0; i <= 9; i++) {
      groupedSpells[i] = [];
    }
    
    // Сгруппируем заклинания по уровням
    if (character.spells) {
      character.spells.forEach(spell => {
        const spellLevel = typeof spell === 'string' ? 0 : (spell.level || 0);
        if (!groupedSpells[spellLevel]) {
          groupedSpells[spellLevel] = [];
        }
        groupedSpells[spellLevel].push(spell);
      });
    }
    
    setSpellsByLevel(groupedSpells);
  }, [character.spells]);

  // Обработчик для обновления заклинаний на определенном уровне
  const handleUpdateSpellsForLevel = (level: number, newSpells: (string | CharacterSpell)[]) => {
    // Создаем новый список всех заклинаний, заменив заклинания указанного уровня
    const allSpells = [...(character.spells || [])];
    
    // Находим и удаляем заклинания указанного уровня
    const filteredSpells = allSpells.filter(spell => {
      if (typeof spell === 'string') {
        // Предполагаем, что строковые заклинания это заговоры (уровень 0)
        return level !== 0;
      }
      return spell.level !== level;
    });
    
    // Добавляем новые заклинания этого уровня
    const updatedSpells = [...filteredSpells, ...newSpells];
    
    // Обновляем персонажа
    onUpdate({
      spells: updatedSpells
    });
  };

  return (
    <div className="space-y-4">
      {/* Основная информация о заклинаниях */}
      <SpellCastingPanel character={character} onUpdate={onUpdate} />
      
      {/* Вкладки для заклинаний разных уровней */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="cantrips"><Sparkles className="h-4 w-4 mr-1" /> Заговоры</TabsTrigger>
          <TabsTrigger value="1">Уровень 1</TabsTrigger>
          <TabsTrigger value="2">Уровень 2</TabsTrigger>
          <TabsTrigger value="3">Уровень 3+</TabsTrigger>
          <TabsTrigger value="prepared">Подготовленные</TabsTrigger>
        </TabsList>
        
        {/* Содержимое вкладки "Все" */}
        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <SpellPanel 
              character={character}
              spells={spellsByLevel[0] || []}
              onUpdate={(newSpells) => handleUpdateSpellsForLevel(0, newSpells)}
              level={0}
            />
            
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
              spellsByLevel[level] && spellsByLevel[level].length > 0 && (
                <SpellPanel 
                  key={level}
                  character={character}
                  spells={spellsByLevel[level] || []}
                  onUpdate={(newSpells) => handleUpdateSpellsForLevel(level, newSpells)}
                  level={level}
                />
              )
            ))}
          </ScrollArea>
        </TabsContent>
        
        {/* Остальные вкладки могут быть добавлены по аналогии */}
      </Tabs>
      
      {/* Кнопка добавления заклинаний */}
      <div className="flex justify-center mt-4">
        <Button onClick={() => setIsSpellModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Добавить заклинания
        </Button>
      </div>
      
      {/* Модальное окно для выбора заклинаний */}
      {isSpellModalOpen && (
        <SpellSelectionModal 
          isOpen={isSpellModalOpen}
          onClose={() => setIsSpellModalOpen(false)}
          character={character}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default SpellsTab;
