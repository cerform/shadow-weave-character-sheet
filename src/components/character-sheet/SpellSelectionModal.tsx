
import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalFooter, ModalBody } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { Select } from '@/components/ui/select';
import { themes } from '@/lib/themes';
import { useSpellbook } from '@/contexts/SpellbookContext';
import { canPrepareMoreSpells, convertSpellsForState } from '@/utils/spellUtils';
import { safeToString } from '@/utils/stringUtils';

export interface SpellSelectionModalProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  character,
  onUpdate,
  open = false,
  onOpenChange = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { allSpells, loadSpellsByClass } = useSpellbook();
  
  // Prepare spells for the character
  useEffect(() => {
    if (character.class) {
      loadSpellsByClass(character.class);
      
      // Convert character spells to SpellData for state management
      if (character.spells && character.spells.length > 0) {
        setAvailableSpells(convertSpellsForState(character.spells));
      }
    }
  }, [character.class, loadSpellsByClass]);

  // Filter spells based on search term, level, and school
  const filteredSpells = allSpells.filter(spell => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === null || spell.level === selectedLevel;
    const matchesSchool = selectedSchool === null || 
                          spell.school.toLowerCase() === selectedSchool.toLowerCase();
    
    // Check if the spell is for the character's class
    const isForClass = Array.isArray(spell.classes) 
      ? spell.classes.some(c => 
          safeToString(character.class).toLowerCase().includes(safeToString(c).toLowerCase()))
      : safeToString(character.class).toLowerCase().includes(safeToString(spell.classes || '').toLowerCase());
    
    return matchesSearch && matchesLevel && matchesSchool && isForClass;
  });

  // Check if a spell is already added to the character
  const isSpellAdded = (spellId: string): boolean => {
    return (character.spells || []).some(spell => spell.id === spellId);
  };

  // Add spell to character
  const addSpell = (spell: SpellData) => {
    if (isSpellAdded(spell.id)) return;
    
    const newSpell: CharacterSpell = {
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      description: spell.description,
      prepared: false,
      ritual: spell.ritual || false,
      concentration: spell.concentration || false,
      verbal: spell.verbal || false,
      somatic: spell.somatic || false,
      material: spell.material || false,
      materials: spell.materials,
      classes: Array.isArray(spell.classes) ? spell.classes : [spell.classes || '']
    };
    
    const updatedSpells = [...(character.spells || []), newSpell];
    onUpdate({ spells: updatedSpells });
  };

  // Remove spell from character
  const removeSpell = (spellId: string) => {
    const updatedSpells = (character.spells || []).filter(spell => spell.id !== spellId);
    onUpdate({ spells: updatedSpells });
  };

  // Get unique spell schools for filtering
  const spellSchools = Array.from(new Set(allSpells.map(spell => spell.school)));
  
  // Get unique spell levels for filtering
  const spellLevels = Array.from(new Set(allSpells.map(spell => spell.level))).sort((a, b) => a - b);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <ModalHeader>Выбор заклинаний</ModalHeader>
        <ModalBody className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-wrap gap-2 mb-4">
              <Input
                placeholder="Поиск заклинаний..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
              
              <select
                value={selectedLevel === null ? '' : selectedLevel.toString()}
                onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) : null)}
                className="p-2 border rounded"
                style={{ backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor }}
              >
                <option value="">Все уровни</option>
                {spellLevels.map((level) => (
                  <option key={level} value={level}>{level === 0 ? 'Заговор' : `Уровень ${level}`}</option>
                ))}
              </select>
              
              <select
                value={selectedSchool || ''}
                onChange={(e) => setSelectedSchool(e.target.value || null)}
                className="p-2 border rounded"
                style={{ backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor }}
              >
                <option value="">Все школы</option>
                {spellSchools.map((school) => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-2">
              <div className="overflow-y-auto border rounded p-2 h-[60vh]">
                <h3 className="font-bold mb-2" style={{ color: currentTheme.accent }}>Доступные заклинания</h3>
                <div className="space-y-2">
                  {filteredSpells.length > 0 ? (
                    filteredSpells.map((spell) => (
                      <div 
                        key={spell.id} 
                        className="flex items-center justify-between p-2 border rounded"
                        style={{ borderColor: currentTheme.accent + '50' }}
                      >
                        <div>
                          <div className="font-medium">{spell.name}</div>
                          <div className="text-xs">
                            {spell.level === 0 ? 'Заговор' : `Уровень ${spell.level}`} • {spell.school}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => addSpell(spell)}
                          disabled={isSpellAdded(spell.id)}
                          variant={isSpellAdded(spell.id) ? "outline" : "default"}
                        >
                          {isSpellAdded(spell.id) ? 'Добавлено' : 'Добавить'}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4">Заклинания не найдены</div>
                  )}
                </div>
              </div>
              
              <div className="overflow-y-auto border rounded p-2 h-[60vh]">
                <h3 className="font-bold mb-2" style={{ color: currentTheme.accent }}>
                  Выбранные заклинания ({character.spells?.length || 0})
                </h3>
                <div className="space-y-2">
                  {character.spells && character.spells.length > 0 ? (
                    character.spells.map((spell) => (
                      <div 
                        key={spell.id} 
                        className="flex items-center justify-between p-2 border rounded"
                        style={{ borderColor: currentTheme.accent + '50' }}
                      >
                        <div>
                          <div className="font-medium">{spell.name}</div>
                          <div className="text-xs flex items-center gap-1">
                            <Badge variant="outline" className="h-5">
                              {spell.level === 0 ? 'Заговор' : `Ур.${spell.level}`}
                            </Badge>
                            <Badge variant="outline" className="h-5">{spell.school}</Badge>
                            {spell.prepared && (
                              <Badge variant="outline" className="h-5 bg-green-500/20">Подг.</Badge>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => removeSpell(spell.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4">Нет выбранных заклинаний</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="text-sm mr-auto">
            {canPrepareMoreSpells(character) ? (
              <span style={{ color: currentTheme.success }}>
                Вы можете подготовить больше заклинаний
              </span>
            ) : (
              <span>
                У вас максимальное количество подготовленных заклинаний
              </span>
            )}
          </div>
          <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SpellSelectionModal;
