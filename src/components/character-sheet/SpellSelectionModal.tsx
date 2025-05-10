import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Character, CharacterSpell } from '@/types/character';
import { SpellData, convertSpellDataToCharacterSpell } from '@/types/spells';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getPreparedSpellsLimit, canPrepareMoreSpells, isSpellAdded } from '@/utils/spellUtils';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  availableSpells?: SpellData[];
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  open,
  onOpenChange,
  character,
  onUpdate,
  availableSpells = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [spellList, setSpellList] = useState<SpellData[]>([]);
  const [activeTab, setActiveTab] = useState('wizard');
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Load spells
  useEffect(() => {
    if (!open) return;
    
    // If availableSpells are provided, use them
    if (availableSpells.length > 0) {
      setSpellList(availableSpells);
      return;
    }
    
    // Otherwise, load from a default source
    import('@/data/spells').then(module => {
      const allSpells = module.getAllSpells();
      setSpellList(allSpells);
    }).catch(err => {
      console.error("Failed to load spells:", err);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список заклинаний",
        variant: "destructive"
      });
    });
  }, [open, availableSpells, toast]);
  
  // Filter spells based on search term and class
  const filteredSpells = spellList.filter(spell => {
    const matchesSearch = 
      searchTerm === '' || 
      spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by class if the activeTab corresponds to a class
    const matchesClass = 
      activeTab === 'all' || 
      (spell.classes && 
        (Array.isArray(spell.classes) 
          ? spell.classes.some(cls => cls.toLowerCase().includes(activeTab.toLowerCase()))
          : spell.classes.toLowerCase().includes(activeTab.toLowerCase()))
      );
    
    return matchesSearch && matchesClass;
  });

  // Group spells by level
  const spellsByLevel = filteredSpells.reduce((acc: Record<number, SpellData[]>, spell) => {
    const level = spell.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {});
  
  // Check if a spell is already added to the character
  const isSpellAlreadyAdded = (spellName: string): boolean => {
    return isSpellAdded(character, spellName);
  };
  
  // Add a spell to the character
  const addSpellToCharacter = (spell: SpellData) => {
    if (isSpellAlreadyAdded(spell.name)) {
      toast({
        title: "Заклинание уже добавлено",
        description: `Заклинание ${spell.name} уже в списке известных заклинаний`
      });
      return;
    }
    
    const characterSpell = convertSpellDataToCharacterSpell(spell);
    const existingSpells = character.spells || [];
    
    // Convert to ensure ID is present for each spell
    const updatedSpells: CharacterSpell[] = [...existingSpells.map(s => {
      if (typeof s === 'string') {
        return {
          id: `spell-${s.toLowerCase().replace(/\s+/g, '-')}`,
          name: s,
          level: 0
        };
      }
      return {
        ...s,
        id: s.id || `spell-${s.name.toLowerCase().replace(/\s+/g, '-')}`
      };
    }), characterSpell];
    
    onUpdate({ spells: updatedSpells });
    
    toast({
      title: "Заклинание добавлено",
      description: `Заклинание ${spell.name} добавлено в список известных заклинаний`
    });
  };
  
  // Toggle spell prepared status
  const toggleSpellPrepared = (spell: CharacterSpell) => {
    if (!character.spells) return;
    
    // If trying to prepare a spell, check if we can prepare more
    if (!spell.prepared && !canPrepareMoreSpells(character)) {
      const limit = getPreparedSpellsLimit(character);
      toast({
        title: "Лимит подготовленных заклинаний",
        description: `Вы можете подготовить максимум ${limit} заклинаний.`
      });
      return;
    }
    
    const updatedSpells = character.spells.map(existingSpell => {
      if (typeof existingSpell === 'string') {
        return {
          id: `spell-${existingSpell.toLowerCase().replace(/\s+/g, '-')}`,
          name: existingSpell,
          level: 0
        };
      }
      if (existingSpell.name === spell.name) {
        return { 
          ...existingSpell, 
          id: existingSpell.id || `spell-${existingSpell.name.toLowerCase().replace(/\s+/g, '-')}`,
          prepared: !existingSpell.prepared 
        };
      }
      return {
        ...existingSpell,
        id: existingSpell.id || `spell-${existingSpell.name.toLowerCase().replace(/\s+/g, '-')}`
      };
    });
    
    onUpdate({ spells: updatedSpells });
  };

  // Classes for filtering
  const spellClasses = [
    { id: 'all', name: 'Все' },
    { id: 'wizard', name: 'Волшебник' },
    { id: 'cleric', name: 'Жрец' },
    { id: 'druid', name: 'Друид' },
    { id: 'paladin', name: 'Паладин' },
    { id: 'ranger', name: 'Следопыт' },
    { id: 'sorcerer', name: 'Чародей' },
    { id: 'warlock', name: 'Колдун' },
    { id: 'bard', name: 'Бард' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Выбор заклинаний</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              placeholder="Поиск заклинаний..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          {/* Class Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5">
              {spellClasses.slice(0, 5).map(cls => (
                <TabsTrigger key={cls.id} value={cls.id}>{cls.name}</TabsTrigger>
              ))}
            </TabsList>
            <TabsList className="grid grid-cols-4 mt-2">
              {spellClasses.slice(5).map(cls => (
                <TabsTrigger key={cls.id} value={cls.id}>{cls.name}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {/* Spell List */}
          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="space-y-4 pb-6">
              {Object.entries(spellsByLevel)
                .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
                .map(([level, spells]) => (
                  <div key={`level-${level}`}>
                    <h4 className="text-sm font-medium mb-2 px-1">
                      {level === '0' ? 'Заговоры' : `${level} уровень`}
                    </h4>
                    <div className="space-y-2">
                      {spells.map(spell => {
                        const isAdded = isSpellAlreadyAdded(spell.name);
                        
                        return (
                          <div 
                            key={spell.id}
                            className={`p-2 rounded-md flex items-center justify-between
                              ${isAdded ? 'bg-primary/10' : 'hover:bg-secondary/50'}`}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{spell.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {spell.school}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {spell.castingTime} • {spell.range} • {spell.duration}
                              </span>
                            </div>
                            <Button 
                              onClick={() => !isAdded && addSpellToCharacter(spell)}
                              variant={isAdded ? "ghost" : "default"}
                              size="sm"
                              disabled={isAdded}
                              className={isAdded ? "cursor-default" : ""}
                              style={{ 
                                color: isAdded ? currentTheme.textColor : currentTheme.buttonText
                              }}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" /> Добавлено
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" /> Добавить
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {filteredSpells.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    {searchTerm ? 'Заклинания не найдены' : 'Загрузка заклинаний...'}
                  </div>
                )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
