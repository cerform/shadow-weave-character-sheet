
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import SpellSelectionModal from './SpellSelectionModal';
import { SpellSlotsPopover } from './SpellSlotsPopover';
import { Search, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { convertCharacterSpellToSpellData } from '@/utils/spellHelpers';

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

  // Helper function to safely handle character spells that may be strings or CharacterSpell objects
  const getSpellName = (spell: string | CharacterSpell): string => {
    if (typeof spell === 'string') {
      return spell;
    }
    return spell.name;
  };

  // Helper function to convert spell to SpellData
  const convertSpell = (spell: string | CharacterSpell): SpellData => {
    if (typeof spell === 'string') {
      return {
        id: spell,
        name: spell,
        level: 0,
        school: 'Unknown',
        castingTime: '1 action',
        range: '30 feet',
        components: '',
        duration: 'Instantaneous',
        description: ''
      };
    }
    return convertCharacterSpellToSpellData(spell);
  };

  const filteredSpells = character.spells?.filter(spell =>
    getSpellName(spell).toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4 mr-2" />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleModal}>
            <Plus className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pl-2 pr-2">
        <ScrollArea className="h-[200px] w-full">
          <div className="flex flex-col space-y-2">
            {filteredSpells.map((spell) => (
              <Button
                key={getSpellName(spell)}
                variant="secondary"
                className="w-full justify-start"
                onClick={() => onSpellClick && onSpellClick(convertSpell(spell))}
                style={{ color: currentTheme.textColor }}
              >
                {getSpellName(spell)}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Separator style={{ backgroundColor: `${currentTheme.accent}40` }} />
        {Object.keys(character.spellSlots || {}).map((level) =>
          renderSpellSlotUse(character, parseInt(level))
        )}
      </CardFooter>
      <SpellSelectionModal
        open={isModalOpen}
        onClose={toggleModal}
        character={character}
        onUpdate={onUpdate}
      />
    </Card>
  );
};

export default SpellPanel;
