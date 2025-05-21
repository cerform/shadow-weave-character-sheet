
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Character, CharacterSpell } from '@/types/character';
import { useSpellbook } from '@/contexts/SpellbookContext';
import { SpellData } from '@/types/spells';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { importSpellsFromText } from '@/utils/spellBatchImporter';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { calculateAvailableSpellsByClassAndLevel } from '@/utils/spellUtils';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { getAllSpells, getSpellsByClass } from '@/data/spells';

interface SpellSelectionModalProps {
  character: Character;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCharacter: (updates: Partial<Character>) => void;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({ 
  character, 
  open, 
  onOpenChange,
  onUpdateCharacter
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const { loadSpells } = useSpellbook();
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [batchImportText, setBatchImportText] = useState('');
  const [importMode, setImportMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Load spells when modal opens
  useEffect(() => {
    if (open && character.class) {
      loadSpells();
      // Загружаем заклинания для класса
      if (character.class) {
        setLoading(true);
        const spells = getSpellsByClass(character.class);
        const formattedSpells: SpellData[] = spells.map(spell => ({
          id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
          name: spell.name,
          level: spell.level,
          school: spell.school || '',
          castingTime: spell.castingTime || '',
          range: spell.range || '',
          components: spell.components || '',
          duration: spell.duration || '',
          description: spell.description || '',
          classes: spell.classes || []
        }));
        setAvailableSpells(formattedSpells);
        setLoading(false);
      }
    }
  }, [open, character.class, loadSpells]);
  
  // Filter spells based on search term and active tab
  useEffect(() => {
    if (!availableSpells) {
      setFilteredSpells([]);
      return;
    }
    
    let filtered = availableSpells;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(searchLower) ||
        (spell.school && spell.school.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by level
    if (activeTab !== 'all') {
      const level = activeTab === 'cantrips' ? 0 : parseInt(activeTab, 10);
      filtered = filtered.filter(spell => spell.level === level);
    }
    
    setFilteredSpells(filtered);
  }, [availableSpells, searchTerm, activeTab]);
  
  // Get unique spell levels for tabs
  const spellLevels = React.useMemo(() => {
    if (!availableSpells || availableSpells.length === 0) return [];
    return [...new Set(availableSpells.map(spell => spell.level))].sort((a, b) => a - b);
  }, [availableSpells]);
  
  // Check if a spell is already known by the character
  const isSpellKnown = (spell: SpellData): boolean => {
    if (!character.spells) return false;
    
    return character.spells.some(s => {
      if (typeof s === 'string') return s === spell.name;
      return s.name === spell.name;
    });
  };
  
  // Add a spell to the character
  const addSpell = (spell: SpellData) => {
    if (isSpellKnown(spell)) return;
    
    const newSpell: CharacterSpell = {
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
      concentration: spell.concentration,
      verbal: spell.verbal,
      somatic: spell.somatic,
      material: spell.material,
      prepared: spell.level === 0 // Cantrips are always prepared
    };
    
    const updatedSpells = [...(character.spells || []), newSpell];
    onUpdateCharacter({ spells: updatedSpells });
    
    toast.success(`Добавлено заклинание: ${spell.name}`);
  };
  
  // Remove a spell from the character
  const removeSpell = (spell: SpellData) => {
    if (!character.spells) return;
    
    const updatedSpells = character.spells.filter(s => {
      if (typeof s === 'string') return s !== spell.name;
      return s.name !== spell.name;
    });
    
    onUpdateCharacter({ spells: updatedSpells });
    toast.success(`Удалено заклинание: ${spell.name}`);
  };
  
  // Handle batch import of spells
  const handleBatchImport = () => {
    if (!batchImportText.trim()) {
      toast.error('Введите текст для импорта заклинаний');
      return;
    }
    
    try {
      const updatedSpells = importSpellsFromText(
        batchImportText,
        character.spells || []
      );
      
      onUpdateCharacter({ spells: updatedSpells });
      
      const newSpellsCount = updatedSpells.length - (character.spells?.length || 0);
      toast.success(`Импортировано ${newSpellsCount} новых заклинаний`);
      
      setBatchImportText('');
      setImportMode(false);
    } catch (error) {
      console.error('Error importing spells:', error);
      toast.error('Ошибка при импорте заклинаний');
    }
  };
  
  // Calculate spell limits based on class and level
  const { cantripsCount, knownSpells } = calculateAvailableSpellsByClassAndLevel(
    character.class || '',
    character.level || 1
  );
  
  // Count current spells
  const currentCantrips = character.spells?.filter(s => {
    if (typeof s === 'string') return false;
    return s.level === 0;
  }).length || 0;
  
  const currentSpells = character.spells?.filter(s => {
    if (typeof s === 'string') return false;
    return s.level > 0;
  }).length || 0;

  // Группировка заклинаний по уровням для меток на вкладках
  const spellCountsByLevel = React.useMemo(() => {
    if (!availableSpells || availableSpells.length === 0) return {};
    
    return availableSpells.reduce((acc: Record<string, number>, spell) => {
      const level = spell.level;
      if (level !== undefined) {
        const levelStr = level.toString();
        acc[levelStr] = (acc[levelStr] || 0) + 1;
      }
      return acc;
    }, {});
  }, [availableSpells]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Выбор заклинаний</DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Известно заговоров: {currentCantrips}/{cantripsCount}, 
              заклинаний: {currentSpells}/{knownSpells}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setImportMode(!importMode)}
          >
            {importMode ? 'Выбор заклинаний' : 'Импорт списком'}
          </Button>
        </div>

        {importMode ? (
          <div className="space-y-4">
            <Textarea
              placeholder="Вставьте список заклинаний, по одному на строке..."
              value={batchImportText}
              onChange={(e) => setBatchImportText(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex justify-end">
              <Button onClick={handleBatchImport}>
                Импортировать заклинания
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск заклинаний..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mb-2 flex flex-wrap">
                <TabsTrigger value="all">
                  Все ({availableSpells.length})
                </TabsTrigger>
                <TabsTrigger value="cantrips">
                  Заговоры ({spellCountsByLevel['0'] || 0})
                </TabsTrigger>
                {spellLevels.filter(level => typeof level === 'number' && level > 0).map(level => (
                  <TabsTrigger key={`level-${level}`} value={String(level)}>
                    {level} уровень ({spellCountsByLevel[level.toString()] || 0})
                  </TabsTrigger>
                ))}
              </TabsList>

              <ScrollArea className="flex-1">
                <div className="space-y-2 p-1">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Загрузка заклинаний...
                    </div>
                  ) : filteredSpells.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {availableSpells.length === 0 
                        ? 'Нет доступных заклинаний для этого класса' 
                        : 'Нет заклинаний, соответствующих фильтру'}
                    </div>
                  ) : (
                    filteredSpells.map(spell => {
                      const known = isSpellKnown(spell);
                      return (
                        <Card 
                          key={spell.id || spell.name}
                          style={{
                            backgroundColor: known ? `${currentTheme.accent}20` : currentTheme.cardBackground,
                            borderColor: known ? currentTheme.accent : currentTheme.borderColor
                          }}
                        >
                          <CardContent className="p-3 flex justify-between items-center">
                            <div>
                              <div className="font-medium">{spell.name}</div>
                              <div className="flex items-center gap-2 text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                                </Badge>
                                {spell.school && (
                                  <span className="text-muted-foreground">{spell.school}</span>
                                )}
                              </div>
                            </div>
                            
                            {known ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeSpell(spell)}
                                className="gap-1"
                              >
                                <Check className="h-4 w-4" />
                                Изучено
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => addSpell(spell)}
                                className="gap-1"
                              >
                                <Plus className="h-4 w-4" />
                                Добавить
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
