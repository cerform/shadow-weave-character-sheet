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
  const normalizedSpells = normalizeSpells(character.spells || []);

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
  const renderSpellSlotUse = (level: number) => {
    if (!character.spellSlots) return null;
    
    const slotInfo = character.spellSlots[level];
    if (!slotInfo) return null;
    
    // Получить количество используемых и максимальных слотов в зависимости от формата
    let used = 0;
    let max = 0;
    
    if (typeof slotInfo === 'number') {
      max = level === 0 ? 0 : 4; // Заговоры не имеют слотов
      used = max - slotInfo;
    } else {
      max = slotInfo.max;
      used = slotInfo.used;
    }
    
    // Ensure we're passing the proper structure to SpellSlotsPopover
    const slotObject = typeof slotInfo === 'number' 
      ? { max, used } // Convert number to object structure
      : slotInfo;
    
    return (
      <div key={`spell-slots-${level}`} className="flex items-center justify-between">
        <span style={{ color: currentTheme.textColor }}>{level}-й уровень:</span>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" style={{ color: currentTheme.textColor }}>
            {max - used} / {max}
          </Badge>
          <SpellSlotsPopover
            level={level}
            currentSlots={max - used}
            maxSlots={max}
            onSlotsChange={(newSlots) => {
              const updatedSpellSlots = { ...character.spellSlots };
              
              // Create or update the slot object
              updatedSpellSlots[level] = {
                max: max,
                used: max - newSlots
              };
              
              onUpdate({ spellSlots: updatedSpellSlots });
            }}
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
            renderSpellSlotUse(parseInt(level))
          )}
        </CardFooter>
        <SpellSelectionModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          character={character}
          onUpdate={onUpdate}
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
          {searchTerm ? (
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
          ) : (
            Object.entries(spellsByLevel).sort(([levelA], [levelB]) => 
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
                            {spell.name}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs">
                            <div className="font-medium">{spell.name}</div>
                            <div className="text-xs opacity-80">
                              {spell.school} {spell.level === 0 ? "Заговор" : `${spell.level}-й уровень`}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Separator style={{ backgroundColor: `${currentTheme.accent}40` }} />
        {character.spellSlots && Object.keys(character.spellSlots).map((level) =>
          renderSpellSlotUse(parseInt(level))
        )}
      </CardFooter>
      <SpellSelectionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        character={character}
        onUpdate={onUpdate}
      />
    </Card>
  );
};

export default SpellPanel;
