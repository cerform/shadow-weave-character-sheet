
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useSpellbook } from '@/contexts/SpellbookContext';
import { canPrepareMoreSpells } from '@/utils/spellUtils';
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
  const { availableSpells: contextSpells, loadSpellsForCharacter } = useSpellbook();
  
  // Prepare spells for the character
  useEffect(() => {
    if (character.class) {
      loadSpellsForCharacter(character.class, character.level || 1);
      
      // Convert character spells to SpellData for state management
      if (character.spells && character.spells.length > 0) {
        const convertedSpells = character.spells.map(spell => {
          if (typeof spell === 'string') {
            return {
              id: `spell-${safeToString(spell).toLowerCase().replace(/\s+/g, '-')}`,
              name: spell,
              level: 0,
              school: 'Универсальная',
              castingTime: '1 действие',
              range: 'На себя',
              components: '',
              duration: 'Мгновенная',
              description: ''
            } as SpellData;
          }
          return {
            id: spell.id || `spell-${safeToString(spell.name).toLowerCase().replace(/\s+/g, '-')}`,
            name: spell.name,
            level: spell.level || 0,
            school: spell.school || 'Универсальная',
            castingTime: spell.castingTime || '1 действие',
            range: spell.range || 'На себя',
            components: spell.components || '',
            duration: spell.duration || 'Мгновенная',
            description: spell.description || '',
            classes: spell.classes || []
          } as SpellData;
        });
        
        setAvailableSpells(convertedSpells);
      }
    }
  }, [character.class, character.level, character.spells, loadSpellsForCharacter]);

  // Filter spells based on search term, level, and school
  const filteredSpells = contextSpells.filter(spell => {
    const matchesSearch = safeToString(spell.name).toLowerCase().includes(safeToString(searchTerm).toLowerCase());
    const matchesLevel = selectedLevel === null || spell.level === selectedLevel;
    const matchesSchool = selectedSchool === null || 
                          safeToString(spell.school).toLowerCase() === safeToString(selectedSchool).toLowerCase();
    
    // Check if the spell is for the character's class
    const isForClass = Array.isArray(spell.classes) 
      ? spell.classes.some(c => 
          safeToString(character.class).toLowerCase().includes(safeToString(c).toLowerCase()))
      : safeToString(character.class).toLowerCase().includes(safeToString(spell.classes || '').toLowerCase());
    
    return matchesSearch && matchesLevel && matchesSchool && isForClass;
  });

  // Check if a spell is already added to the character
  const isSpellAdded = (spellId: string): boolean => {
    return (character.spells || []).some(spell => {
      if (typeof spell === 'string') {
        return `spell-${safeToString(spell).toLowerCase().replace(/\s+/g, '-')}` === spellId;
      }
      return String(spell.id) === String(spellId) || safeToString(spell.name) === spellId;
    });
  };

  // Add spell to character
  const addSpell = (spell: SpellData) => {
    if (isSpellAdded(spell.id)) return;
    
    const newSpell: CharacterSpell = {
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime || '1 действие',
      range: spell.range || 'На себя',
      components: spell.components || '',
      duration: spell.duration || 'Мгновенная',
      description: spell.description || '',
      prepared: false,
      ritual: spell.ritual || false,
      concentration: spell.concentration || false,
      verbal: spell.verbal || false,
      somatic: spell.somatic || false,
      material: spell.material || false,
      materials: spell.materials || '',
      classes: Array.isArray(spell.classes) ? spell.classes : [spell.classes || '']
    };
    
    const updatedSpells = [...(character.spells || []), newSpell];
    onUpdate({ spells: updatedSpells });
  };

  // Remove spell from character
  const removeSpell = (spellId: string) => {
    const updatedSpells = (character.spells || []).filter(spell => {
      if (typeof spell === 'string') {
        return `spell-${safeToString(spell).toLowerCase().replace(/\s+/g, '-')}` !== spellId;
      }
      return safeToString(spell.id) !== spellId;
    });
    onUpdate({ spells: updatedSpells });
  };

  // Get unique spell schools for filtering
  const spellSchools = Array.from(new Set(contextSpells.map(spell => spell.school)));
  
  // Get unique spell levels for filtering
  const spellLevels = Array.from(new Set(contextSpells.map(spell => spell.level))).sort((a, b) => a - b);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Выбор заклинаний</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
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
                  <option key={level} value={level.toString()}>{level === 0 ? 'Заговор' : `Уровень ${level}`}</option>
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
                  <option key={safeToString(school)} value={safeToString(school)}>{safeToString(school)}</option>
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
                        key={safeToString(spell.id)} 
                        className="flex items-center justify-between p-2 border rounded"
                        style={{ borderColor: currentTheme.accent + '50' }}
                      >
                        <div>
                          <div className="font-medium">{safeToString(spell.name)}</div>
                          <div className="text-xs">
                            {spell.level === 0 ? 'Заговор' : `Уровень ${spell.level}`} • {safeToString(spell.school)}
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
                    character.spells.map((spell) => {
                      const spellName = typeof spell === 'string' ? spell : spell.name;
                      const spellId = typeof spell === 'string' 
                        ? `spell-${safeToString(spell).toLowerCase().replace(/\s+/g, '-')}`
                        : spell.id;
                      const spellLevel = typeof spell === 'string' ? 0 : (spell.level || 0);
                      const spellSchool = typeof spell === 'string' ? 'Универсальная' : (spell.school || 'Универсальная');
                      const isPrepared = typeof spell === 'string' ? false : !!spell.prepared;
                      
                      return (
                        <div 
                          key={safeToString(spellId)} 
                          className="flex items-center justify-between p-2 border rounded"
                          style={{ borderColor: currentTheme.accent + '50' }}
                        >
                          <div>
                            <div className="font-medium">{safeToString(spellName)}</div>
                            <div className="text-xs flex items-center gap-1">
                              <Badge variant="outline" className="h-5">
                                {spellLevel === 0 ? 'Заговор' : `Ур.${spellLevel}`}
                              </Badge>
                              <Badge variant="outline" className="h-5">{safeToString(spellSchool)}</Badge>
                              {isPrepared && (
                                <Badge variant="outline" className="h-5 bg-green-500/20">Подг.</Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => removeSpell(safeToString(spellId))}
                          >
                            Удалить
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center p-4">Нет выбранных заклинаний</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="text-sm mr-auto">
            {canPrepareMoreSpells(character, character.class || '') ? (
              <span style={{ color: currentTheme.success || '#10b981' }}>
                Вы можете подготовить больше заклинаний
              </span>
            ) : (
              <span>
                У вас максимальное количество подготовленных заклинаний
              </span>
            )}
          </div>
          <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
