
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpellData } from '@/types/spells';
import { Character, CharacterSpell } from '@/types/character';
import { Progress } from "@/components/ui/progress";
import { useSpellbook } from '@/hooks/spellbook';
import { useToast } from '@/hooks/use-toast';
import { Layers, Search, Plus, ArrowDownUp, X, CircleAlert } from 'lucide-react';
import SpellDetailModal from '@/components/spellbook/SpellDetailModal';
import { Badge } from "@/components/ui/badge";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export interface SpellSelectionModalProps {
  open: boolean;
  onClose: () => void;
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  open,
  onClose,
  character,
  onUpdate
}) => {
  const { filteredSpells, spells, updateFilters, resetFilters, loading } = useSpellbook();
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("available");
  
  // Character class and spellcasting stats
  const characterClass = typeof character.class === 'object' ? character.class.name : character.class || "";
  const spellcastingAbility = character.spellcasting?.ability || "INT";
  
  // Available spell slots
  const maxPreparedSpells = character.spellcasting?.maxPreparedSpells || 0;
  
  // Safely access character spells
  const characterSpells = character.spells && Array.isArray(character.spells) 
    ? character.spells 
    : character.spells && typeof character.spells === 'object' && Array.isArray(character.spells.known) 
    ? character.spells.known 
    : [];
  
  const currentPreparedSpells = characterSpells.filter(spell => spell.prepared).length;
  
  // Filter spells for character class
  useEffect(() => {
    // Reset filters when modal opens
    if (open) {
      resetFilters();
      
      // Set filter for character class
      if (characterClass) {
        updateFilters({ 
          classes: [characterClass],
          name: '' 
        });
      }
    }
  }, [open, characterClass, resetFilters, updateFilters]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    updateFilters({ name: e.target.value });
  };
  
  // Handle level filter change
  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    
    if (value === "all") {
      updateFilters({ levels: [] });
    } else if (value === "cantrips") {
      updateFilters({ levels: [0] });
    } else {
      updateFilters({ levels: [parseInt(value)] });
    }
  };
  
  // Handle sorting change
  const handleSortChange = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
  };
  
  // Add spell to character
  const handleAddSpell = (spell: SpellData) => {
    // Check if already at max prepared spells
    if (currentPreparedSpells >= maxPreparedSpells && maxPreparedSpells > 0) {
      toast({
        title: "Лимит заклинаний",
        description: `Вы уже подготовили максимальное количество заклинаний (${maxPreparedSpells}).`,
        variant: "destructive",
      });
      return;
    }
    
    // Check if already known
    const isAlreadyKnown = characterSpells.some(s => s.id === spell.id);
    if (isAlreadyKnown) {
      toast({
        title: "Заклинание уже известно",
        description: `${spell.name} уже в вашем списке заклинаний.`,
        variant: "destructive",
      });
      return;
    }
    
    // Convert to character spell
    const characterSpell: CharacterSpell = {
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      prepared: true,
      ritual: spell.ritual || false,
      concentration: spell.concentration || false,
      castingTime: spell.castingTime,
      components: `${spell.verbal ? 'В' : ''}${spell.somatic ? 'С' : ''}${spell.material ? 'М' : ''}`,
      verbal: spell.verbal,
      somatic: spell.somatic,
      material: spell.material,
      materials: spell.materials || ""
    };
    
    // Add to character spells
    if (character.spells && typeof character.spells === 'object' && 'known' in character.spells) {
      // For character.spells.known structure
      const updatedSpells = {
        ...character.spells,
        known: [...(character.spells.known || []), characterSpell]
      };
      onUpdate({ spells: updatedSpells });
    } else {
      // For character.spells as direct array
      const updatedSpells = [...(Array.isArray(character.spells) ? character.spells : []), characterSpell];
      onUpdate({ spells: updatedSpells });
    }
    
    toast({
      title: "Заклинание добавлено",
      description: `${spell.name} добавлено в ваш список заклинаний.`,
    });
    
    setShowDetails(false);
  };
  
  // Remove spell from character
  const handleRemoveSpell = (spellId: string) => {
    const updatedSpells = characterSpells.filter(s => s.id !== spellId);
    
    if (character.spells && typeof character.spells === 'object' && 'known' in character.spells) {
      // For character.spells.known structure
      onUpdate({
        spells: {
          ...character.spells,
          known: updatedSpells
        }
      });
    } else {
      // For character.spells as direct array
      onUpdate({ spells: updatedSpells });
    }
    
    toast({
      title: "Заклинание удалено",
      description: "Заклинание удалено из вашего списка.",
    });
  };
  
  // View spell details
  const handleViewDetails = (spell: SpellData) => {
    setSelectedSpell(spell);
    setShowDetails(true);
  };
  
  // Check if spell is already added
  const isSpellAdded = (spellId: string) => {
    return characterSpells.some(s => s.id === spellId);
  };
  
  // Sort spells
  const sortedSpells = [...filteredSpells].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });
  
  // Generate spell list item
  const SpellListItem = ({ spell }: { spell: SpellData }) => {
    const isAdded = isSpellAdded(spell.id);
    
    return (
      <div 
        className={`p-2 border-b last:border-b-0 hover:bg-black/20 cursor-pointer flex justify-between items-center ${isAdded ? 'opacity-50' : ''}`}
        onClick={() => handleViewDetails(spell)}
      >
        <div>
          <div className="font-semibold">{spell.name}</div>
          <div className="text-sm opacity-70 flex gap-2 flex-wrap">
            <span>{spell.level === 0 ? "Заговор" : `${spell.level} уровень`}</span>
            <span>•</span>
            <span>{spell.school}</span>
            {spell.concentration && <span>• Концентрация</span>}
            {spell.ritual && <span>• Ритуал</span>}
          </div>
        </div>
        <Button 
          size="sm" 
          variant={isAdded ? "outline" : "default"} 
          className={isAdded ? "border-green-500 text-green-500" : ""}
          style={!isAdded ? { backgroundColor: currentTheme.accent } : {}}
          onClick={(e) => {
            e.stopPropagation();
            isAdded ? handleRemoveSpell(spell.id) : handleAddSpell(spell);
          }}
        >
          {isAdded ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden p-0"
        style={{ 
          backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.95)',
          borderColor: currentTheme.accent,
          color: currentTheme.textColor
        }}
      >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle 
            className="text-2xl font-philosopher flex items-center"
            style={{ color: currentTheme.accent }}
          >
            <Layers className="mr-2" />
            Выбор заклинаний
          </DialogTitle>
          
          <div className="flex items-center justify-between my-4">
            <div className="text-sm">
              Класс: <span className="font-semibold">{characterClass}</span> • 
              Атрибут: <span className="font-semibold">{spellcastingAbility}</span>
            </div>
            {maxPreparedSpells > 0 && (
              <Badge 
                variant="outline"
                style={{ borderColor: currentTheme.accent }}
              >
                Подготовлено: {currentPreparedSpells}/{maxPreparedSpells}
              </Badge>
            )}
          </div>
          
          {maxPreparedSpells > 0 && (
            <Progress 
              value={(currentPreparedSpells / maxPreparedSpells) * 100} 
              className="h-1 mb-4"
              style={{ 
                backgroundColor: `${currentTheme.accent}30`,
                "--progress-value-color": currentTheme.accent
              } as React.CSSProperties}
            />
          )}
        </DialogHeader>
        
        <Tabs defaultValue="available" className="w-full" onValueChange={setTab}>
          <div className="px-6">
            <TabsList className="w-full">
              <TabsTrigger value="available" className="w-full">Доступные заклинания</TabsTrigger>
              <TabsTrigger value="known" className="w-full">Известные заклинания</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="available" className="m-0">
            <div className="p-4 flex gap-2 flex-col sm:flex-row">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск заклинаний..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedLevel} onValueChange={handleLevelChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все уровни</SelectItem>
                    <SelectItem value="cantrips">Заговоры</SelectItem>
                    <SelectItem value="1">1 уровень</SelectItem>
                    <SelectItem value="2">2 уровень</SelectItem>
                    <SelectItem value="3">3 уровень</SelectItem>
                    <SelectItem value="4">4 уровень</SelectItem>
                    <SelectItem value="5">5 уровень</SelectItem>
                    <SelectItem value="6">6 уровень</SelectItem>
                    <SelectItem value="7">7 уровень</SelectItem>
                    <SelectItem value="8">8 уровень</SelectItem>
                    <SelectItem value="9">9 уровень</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={handleSortChange}>
                  <ArrowDownUp className="h-4 w-4 mr-2" />
                  {sortOrder === "asc" ? "А-Я" : "Я-А"}
                </Button>
              </div>
            </div>
            
            <div className="px-4 pb-2 text-sm opacity-70">
              {loading ? (
                "Загрузка заклинаний..."
              ) : (
                <>Найдено заклинаний: {sortedSpells.length}</>
              )}
            </div>
            
            <ScrollArea className="h-[50vh]">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Загрузка заклинаний...</p>
                </div>
              ) : sortedSpells.length > 0 ? (
                <div className="divide-y divide-border">
                  {sortedSpells.map((spell) => (
                    <SpellListItem key={spell.id} spell={spell} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CircleAlert className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Заклинания не найдены</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Попробуйте изменить параметры поиска
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="known" className="m-0">
            <ScrollArea className="h-[60vh]">
              {characterSpells.length > 0 ? (
                <div className="divide-y divide-border">
                  {characterSpells.map((spell) => {
                    // Find full spell data
                    const fullSpell = spells.find(s => s.id === spell.id);
                    if (!fullSpell) return null;
                    
                    return (
                      <div 
                        key={spell.id}
                        className="p-2 border-b last:border-b-0 hover:bg-black/20 cursor-pointer flex justify-between items-center"
                        onClick={() => handleViewDetails(fullSpell)}
                      >
                        <div>
                          <div className="font-semibold">{spell.name}</div>
                          <div className="text-sm opacity-70 flex gap-2 flex-wrap">
                            <span>{spell.level === 0 ? "Заговор" : `${spell.level} уровень`}</span>
                            <span>•</span>
                            <span>{spell.school}</span>
                            {spell.concentration && <span>• Концентрация</span>}
                            {spell.ritual && <span>• Ритуал</span>}
                            {spell.prepared && <span className="text-green-500">• Подготовлено</span>}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSpell(spell.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CircleAlert className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>У вас еще нет известных заклинаний</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Перейдите на вкладку "Доступные заклинания", чтобы добавить заклинания
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        {selectedSpell && (
          <SpellDetailModal
            spell={selectedSpell}
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
            theme={currentTheme}
            showAddButton={tab === "available"}
            onAddSpell={handleAddSpell}
            isSpellAdded={isSpellAdded(selectedSpell.id)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
