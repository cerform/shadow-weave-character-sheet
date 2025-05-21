import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SpellSelectionModal from './SpellSelectionModal';
import { SpellSlotsPopover } from './SpellSlotsPopover';
import { Search, Plus, BookOpen } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { normalizeSpells, convertToSpellData } from '@/utils/spellUtils';

interface SpellPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  onSpellClick?: (spell: SpellData) => void;
}

const SpellPanel: React.FC<SpellPanelProps> = ({ character, onUpdate, onSpellClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Получаем нормализованные заклинания
  const normalizedSpells = normalizeSpells(character);

  // Группируем заклинания по уровням
  const spellsByLevel = normalizedSpells.reduce((acc: Record<number, CharacterSpell[]>, spell) => {
    const level = spell.level || 0;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {});

  // Получаем отфильтрованные заклинания
  const filteredSpells = normalizedSpells.filter(spell =>
    spell.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Функция для отображения использования слотов заклинаний
  const renderSpellSlotUse = (character: Character, level: number) => {
    if (!character.spellSlots) return null;
    
    const slotInfo = character.spellSlots[level];
    if (!slotInfo) return null;
    
    const used = slotInfo.used || 0;
    const max = slotInfo.max || 0;
    
    return (
      <div key={`spell-slots-${level}`} className="flex items-center justify-between">
        <span style={{ color: currentTheme.textColor }}>{level}-й уровень:</span>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" style={{ color: currentTheme.textColor }}>
            {used} / {max}
          </Badge>
          <SpellSlotsPopover 
            level={level}
            character={character}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    );
  };

  // Если есть поиск, показываем только заклинания, соответствующие поиску
  if (searchTerm) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle style={{ color: currentTheme.textColor }}>Заклинания</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Поиск заклинаний..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[150px] h-8"
            />
            <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleModal}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pl-2 pr-2">
          <ScrollArea className="h-[200px] w-full">
            <div className="flex flex-col space-y-2">
              {filteredSpells.map((spell) => (
                <Button
                  key={`spell-${spell.id || spell.name}-${Math.random()}`}
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => onSpellClick && onSpellClick(convertToSpellData(spell))}
                  style={{ color: currentTheme.textColor }}
                >
                  {spell.name} {spell.level === 0 ? "(Заговор)" : `(Ур. ${spell.level})`}
                </Button>
              ))}
              {filteredSpells.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Заклинания не найдены
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Separator style={{ backgroundColor: `${currentTheme.accent}40` }} />
          {character.spellSlots && Object.keys(character.spellSlots).map((level) =>
            renderSpellSlotUse(character, parseInt(level))
          )}
        </CardFooter>
        <SpellSelectionModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          character={character}
          onUpdateCharacter={onUpdate} // Передаем onUpdate как onUpdateCharacter
        />
      </Card>
    );
  }

  // Если нет поиска, группируем заклинания по уровням
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle style={{ color: currentTheme.textColor }}>Заклинания</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Поиск заклинаний..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[150px] h-8"
          />
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleModal}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pl-2 pr-2">
        <ScrollArea className="h-[200px] w-full">
          {Object.entries(spellsByLevel).sort(([levelA], [levelB]) => 
            parseInt(levelA) - parseInt(levelB)
          ).map(([level, spells]) => (
            <div key={`level-${level}`} className="mb-4">
              <h3 className="text-sm font-medium mb-2" style={{ color: currentTheme.textColor }}>
                {level === "0" ? "Заговоры" : `${level}-й уровень`}
              </h3>
              <div className="flex flex-col space-y-1">
                {Array.isArray(spells) && spells.map((spell) => (
                  <TooltipProvider key={`spell-${spell.id || spell.name}-${Math.random()}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-1"
                          onClick={() => onSpellClick && onSpellClick(convertToSpellData(spell))}
                          style={{ color: currentTheme.textColor }}
                        >
                          <div className="flex items-center w-full">
                            <span className="flex-1 truncate">{spell.name}</span>
                            {spell.prepared && (
                              <Badge variant="outline" className="ml-2">П</Badge>
                            )}
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="max-w-[200px]">
                          <p className="font-bold">{spell.name}</p>
                          <p className="text-xs">{spell.school || "Универсальная"}</p>
                          {spell.castingTime && <p className="text-xs">Время: {spell.castingTime}</p>}
                          {spell.range && <p className="text-xs">Дистанция: {spell.range}</p>}
                          {spell.components && <p className="text-xs">Компоненты: {spell.components}</p>}
                          {spell.duration && <p className="text-xs">Длительность: {spell.duration}</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}
          {normalizedSpells.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Нет известных заклинаний
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Separator style={{ backgroundColor: `${currentTheme.accent}40` }} />
        {character.spellSlots && Object.keys(character.spellSlots).map((level) =>
          renderSpellSlotUse(character, parseInt(level))
        )}
      </CardFooter>
      <SpellSelectionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        character={character}
        onUpdateCharacter={onUpdate} // Передаем onUpdate как onUpdateCharacter
      />
    </Card>
  );
};

export default SpellPanel;
