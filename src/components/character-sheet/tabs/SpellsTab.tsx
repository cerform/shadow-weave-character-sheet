import React, { useState, useEffect, useMemo } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { SpellData, convertSpellDataToCharacterSpell } from '@/types/spells';
import { Button } from '@/components/ui/button';
import { Search, BookPlus, Trash2, Star, Plus, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useSpellbook } from '@/contexts/SpellbookContext';
import { importSpellsFromText } from '@/utils/spellBatchImporter';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellsTabProps {
  character: Character;
  onUpdateCharacter: (updates: Partial<Character>) => void;
}

interface SpellSelectionModalProps {
  character: Character;
  open: boolean;
  onClose: () => void;
  onUpdateCharacter: (updates: Partial<Character>) => void;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({ 
  character, 
  open, 
  onClose, 
  onUpdateCharacter 
}) => {
  const { availableSpells, loading } = useSpellbook();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [importText, setImportText] = useState('');
  const { toast } = useToast();
  
  const filteredSpells = useMemo(() => {
    if (!availableSpells) return [];
    
    let filtered = [...availableSpells];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(term) || 
        (spell.school && spell.school.toLowerCase().includes(term))
      );
    }
    
    // Filter by level
    if (selectedLevel !== 'all') {
      const level = parseInt(selectedLevel, 10);
      filtered = filtered.filter(spell => spell.level === level);
    }
    
    return filtered;
  }, [availableSpells, searchTerm, selectedLevel]);
  
  const isSpellKnown = (spellId: string | number): boolean => {
    if (!character.spells) return false;
    
    return character.spells.some(spell => {
      if (typeof spell === 'string') return false;
      return spell.id === spellId || spell.name === (availableSpells.find(s => s.id === spellId)?.name);
    });
  };
  
  const handleAddSpell = (spell: SpellData) => {
    if (!character.spells) {
      onUpdateCharacter({ spells: [convertSpellDataToCharacterSpell(spell)] });
      return;
    }
    
    // Check if spell already exists
    if (isSpellKnown(spell.id)) {
      toast({
        title: "Заклинание уже известно",
        description: `${spell.name} уже в списке заклинаний персонажа.`,
        variant: "default"
      });
      return;
    }
    
    // Add spell to character
    const newSpell = convertSpellDataToCharacterSpell(spell);
    const updatedSpells = [...character.spells, newSpell];
    onUpdateCharacter({ spells: updatedSpells });
    
    toast({
      title: "Заклинание добавлено",
      description: `${spell.name} добавлено в список заклинаний.`
    });
  };
  
  const handleImportSpells = () => {
    if (!importText.trim()) {
      toast({
        title: "Нет текста для импорта",
        description: "Введите текст с заклинаниями для импорта.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const currentSpells = character.spells || [];
      const updatedSpells = importSpellsFromText(importText, currentSpells);
      
      onUpdateCharacter({ spells: updatedSpells });
      
      const newSpellsCount = updatedSpells.length - currentSpells.length;
      
      toast({
        title: "Заклинания импортированы",
        description: `Добавлено ${newSpellsCount} новых заклинаний.`
      });
      
      setImportText('');
    } catch (error) {
      console.error('Error importing spells:', error);
      toast({
        title: "Ошибка импорта",
        description: "Не удалось импортировать заклинания. Проверьте формат текста.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Добавление заклинаний</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="browse" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="browse">Обзор заклинаний</TabsTrigger>
            <TabsTrigger value="import">Импорт из текста</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="flex-1 overflow-hidden flex flex-col mt-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск заклинаний..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select 
                className="p-2 border rounded"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="all">Все уровни</option>
                <option value="0">Заговоры</option>
                <option value="1">1 уровень</option>
                <option value="2">2 уровень</option>
                <option value="3">3 уровень</option>
                <option value="4">4 уровень</option>
                <option value="5">5 уровень</option>
                <option value="6">6 уровень</option>
                <option value="7">7 уровень</option>
                <option value="8">8 уровень</option>
                <option value="9">9 уровень</option>
              </select>
            </div>
            
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="text-center py-8">Загрузка заклинаний...</div>
              ) : filteredSpells.length === 0 ? (
                <div className="text-center py-8">Заклинания не найдены</div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredSpells.map((spell) => (
                    <Card key={spell.id} className="overflow-hidden">
                      <CardContent className="p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{spell.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {spell.school || 'Универсальная'}, {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant={isSpellKnown(spell.id) ? "secondary" : "outline"}
                          onClick={() => handleAddSpell(spell)}
                          disabled={isSpellKnown(spell.id)}
                        >
                          {isSpellKnown(spell.id) ? 'Добавлено' : 'Добавить'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4 mt-2">
            <div>
              <Label htmlFor="import-text">Вставьте текст с заклинаниями</Label>
              <Textarea
                id="import-text"
                placeholder="Например:
Огненный снаряд (1-й уровень, воплощение)
Волшебная рука (заговор, вызов)
Обнаружение магии (1-й уровень, прорицание)"
                className="h-40 mt-1"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
            </div>
            
            <Button onClick={handleImportSpells}>
              Импортировать заклинания
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdateCharacter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Group spells by level
  const spellsByLevel = useMemo(() => {
    if (!character.spells || character.spells.length === 0) {
      return {};
    }
    
    return character.spells.reduce((acc: Record<number, CharacterSpell[]>, spell) => {
      if (typeof spell === 'string') return acc;
      
      const level = spell.level || 0;
      if (!acc[level]) acc[level] = [];
      acc[level].push(spell);
      return acc;
    }, {});
  }, [character.spells]);
  
  // Filter spells based on search and active tab
  const filteredSpells = useMemo(() => {
    if (!character.spells) return [];
    
    let filtered = character.spells.filter(spell => typeof spell !== 'string');
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(spell => {
        if (typeof spell === 'string') return false;
        return spell.name.toLowerCase().includes(term);
      });
    }
    
    // Filter by level tab
    if (activeTab !== 'all') {
      const level = parseInt(activeTab, 10);
      filtered = filtered.filter(spell => {
        if (typeof spell === 'string') return false;
        return spell.level === level;
      });
    }
    
    return filtered as CharacterSpell[];
  }, [character.spells, searchTerm, activeTab]);
  
  // Get unique spell levels for tabs
  const spellLevels = useMemo(() => {
    if (!character.spells) return [];
    
    const levels = new Set<number>();
    character.spells.forEach(spell => {
      if (typeof spell !== 'string') {
        levels.add(spell.level);
      }
    });
    
    return Array.from(levels).sort((a, b) => a - b);
  }, [character.spells]);
  
  // Handle spell preparation toggle
  const togglePrepared = (spell: CharacterSpell) => {
    if (!character.spells) return;
    
    const updatedSpells = character.spells.map(s => {
      if (typeof s === 'string') return s;
      if (s.name === spell.name) {
        return { ...s, prepared: !s.prepared };
      }
      return s;
    });
    
    onUpdateCharacter({ spells: updatedSpells });
    
    toast({
      title: spell.prepared ? "Заклинание не подготовлено" : "Заклинание подготовлено",
      description: `${spell.name} ${spell.prepared ? 'убрано из' : 'добавлено в'} список подготовленных заклинаний.`
    });
  };
  
  // Handle spell deletion
  const deleteSpell = (spell: CharacterSpell) => {
    if (!character.spells) return;
    
    const updatedSpells = character.spells.filter(s => {
      if (typeof s === 'string') return true;
      return s.name !== spell.name;
    });
    
    onUpdateCharacter({ spells: updatedSpells });
    
    toast({
      title: "Заклинание удалено",
      description: `${spell.name} удалено из списка заклинаний.`
    });
  };
  
  // Calculate prepared spells count and limit
  const preparedSpellsInfo = useMemo(() => {
    if (!character.spells) return { count: 0, limit: 0 };
    
    const preparedCount = character.spells.filter(s => {
      if (typeof s === 'string') return false;
      return s.prepared && s.level > 0;
    }).length;
    
    // Calculate prepared spell limit based on class and ability score
    let abilityMod = 0;
    const classLower = character.class?.toLowerCase() || '';
    
    if (['жрец', 'друид'].includes(classLower)) {
      // Wisdom-based casters
      abilityMod = Math.floor(((character.abilities?.wisdom || character.wisdom || 10) - 10) / 2);
    } else if (['волшебник', 'маг'].includes(classLower)) {
      // Intelligence-based casters
      abilityMod = Math.floor(((character.abilities?.intelligence || character.intelligence || 10) - 10) / 2);
    } else {
      // Charisma-based casters (default)
      abilityMod = Math.floor(((character.abilities?.charisma || character.charisma || 10) - 10) / 2);
    }
    
    const limit = character.level + abilityMod;
    
    return { count: preparedCount, limit: Math.max(1, limit) };
  }, [character]);
  
  // Get spell slot information
  const spellSlots = useMemo(() => {
    if (!character.spellSlots) return {};
    return character.spellSlots;
  }, [character.spellSlots]);
  
  // Handle spell slot usage
  const toggleSpellSlot = (level: number, index: number) => {
    if (!character.spellSlots || !character.spellSlots[level]) return;
    
    const currentSlot = character.spellSlots[level];
    const newUsed = index < currentSlot.used ? currentSlot.used - 1 : currentSlot.used + 1;
    
    const updatedSpellSlots = {
      ...character.spellSlots,
      [level]: {
        ...currentSlot,
        used: Math.max(0, Math.min(newUsed, currentSlot.max))
      }
    };
    
    onUpdateCharacter({ spellSlots: updatedSpellSlots });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Заклинания персонажа</h3>
        <Button 
          onClick={() => setIsSpellModalOpen(true)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <BookPlus className="w-4 h-4" />
          Добавить заклинания
        </Button>
      </div>
      
      {/* Search input for spells */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Поиск заклинаний..."
          className="pl-8 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Spell slots tracker */}
      {Object.keys(spellSlots).length > 0 && (
        <div className="bg-black/10 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Ячейки заклинаний</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(spellSlots).map(([level, slot]) => {
              if (parseInt(level, 10) === 0) return null; // Skip cantrips
              return (
                <div key={`slot-${level}`} className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">{level} уровень</span>
                  <div className="flex gap-1">
                    {Array.from({ length: slot.max }).map((_, i) => (
                      <button
                        key={`slot-${level}-${i}`}
                        className={`w-6 h-6 rounded-full border ${i < slot.used ? 'bg-primary border-primary' : 'bg-transparent border-gray-400'}`}
                        onClick={() => toggleSpellSlot(parseInt(level, 10), i)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Prepared spells info */}
      {preparedSpellsInfo.limit > 0 && (
        <div className="text-sm">
          <span className={preparedSpellsInfo.count > preparedSpellsInfo.limit ? "text-red-500" : ""}>
            Подготовлено: {preparedSpellsInfo.count}/{preparedSpellsInfo.limit}
          </span>
        </div>
      )}
      
      {/* Spell list tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex flex-wrap">
          <TabsTrigger value="all">
            Все ({character.spells?.length || 0})
          </TabsTrigger>
          {spellLevels.map(level => (
            <TabsTrigger key={`level-${level}`} value={level.toString()}>
              {level === 0 ? 'Заговоры' : `${level} уровень`} ({spellsByLevel[level]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {/* Spell list */}
      <ScrollArea className="h-[400px]">
        {!character.spells || character.spells.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            У персонажа нет заклинаний. Добавьте их, нажав кнопку "Добавить заклинания".
          </div>
        ) : filteredSpells.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Заклинания не найдены по запросу "{searchTerm}"
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSpells.map((spell, index) => (
              <Collapsible key={`spell-${index}`}>
                <Card style={{ borderColor: spell.prepared ? currentTheme.accent : undefined }}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger className="flex-1 text-left flex items-center">
                        <div>
                          <div className="font-medium flex items-center">
                            {spell.name}
                            {spell.prepared && <Star className="ml-1 h-3 w-3 text-amber-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {spell.school || 'Универсальная'}, {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <div className="flex gap-1">
                        {spell.level > 0 && (
                          <Button
                            size="sm"
                            variant={spell.prepared ? "default" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePrepared(spell);
                            }}
                            disabled={!spell.prepared && preparedSpellsInfo.count >= preparedSpellsInfo.limit}
                          >
                            {spell.prepared ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSpell(spell);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <CollapsibleContent className="pt-3">
                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                        <div>
                          <span className="font-medium">Время накладывания:</span> {spell.castingTime || '1 действие'}
                        </div>
                        <div>
                          <span className="font-medium">Дистанция:</span> {spell.range || 'На себя'}
                        </div>
                        <div>
                          <span className="font-medium">Компоненты:</span> {spell.components || 'В, С'}
                        </div>
                        <div>
                          <span className="font-medium">Длительность:</span> {spell.duration || 'Мгновенная'}
                        </div>
                      </div>
                      
                      {spell.description && (
                        <div className="text-sm mt-2">
                          <div className="font-medium">Описание:</div>
                          <div className="text-muted-foreground">
                            {typeof spell.description === 'string' 
                              ? spell.description 
                              : spell.description.map((p, i) => <p key={i} className="mt-1">{p}</p>)}
                          </div>
                        </div>
                      )}
                      
                      {spell.higherLevels && (
                        <div className="text-sm mt-2">
                          <div className="font-medium">На более высоких уровнях:</div>
                          <div className="text-muted-foreground">{spell.higherLevels}</div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <SpellSelectionModal
        character={character}
        open={isSpellModalOpen}
        onClose={() => setIsSpellModalOpen(false)}
        onUpdateCharacter={onUpdateCharacter}
      />
    </div>
  );
};

export default SpellsTab;
