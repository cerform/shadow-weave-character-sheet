import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Character, CharacterSpell } from '@/types/character';
import SpellPanel from '../SpellPanel';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import SpellSlotsPanel from '../SpellSlotsPanel';
import SpellSelectionModal from '../SpellSelectionModal';
import { CircleAlert, Book, Plus, Sparkles, PlusCircle, Filter } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SpellsTabProps {
  character: Character;
  onUpdateCharacter: (updates: Partial<Character>) => void;
}

const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdateCharacter }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [filterText, setFilterText] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [showOnlyPrepared, setShowOnlyPrepared] = useState(false);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Safely access character spells
  const characterSpells: CharacterSpell[] = Array.isArray(character.spells) 
    ? character.spells 
    : [];
  
  const hasPreparedSpellSystem = character.spellcasting?.prepareSpells || false;
  const maxPreparedSpells = character.spellcasting?.maxPreparedSpells || 0;
  const spellcastingAbility = character.spellcasting?.ability || "INT";
  const spellSaveDC = character.spellcasting?.saveDC || 10;
  const spellAttackBonus = character.spellcasting?.attackBonus || 0;
  
  // Filter spells
  const filteredSpells = characterSpells.filter((spell) => {
    // Filter by tab
    if (activeTab === "cantrips" && spell.level !== 0) return false;
    if (activeTab !== "all" && activeTab !== "cantrips" && spell.level !== parseInt(activeTab)) return false;
    
    // Filter by text
    if (filterText && !spell.name.toLowerCase().includes(filterText.toLowerCase())) return false;
    
    // Filter by prepared status
    if (showOnlyPrepared && !spell.prepared) return false;
    
    // Filter by level
    if (levelFilter !== null && spell.level !== levelFilter) return false;
    
    return true;
  });
  
  // Count prepared spells
  const preparedSpellsCount = characterSpells.filter(spell => spell.prepared).length;
  
  // Group spells by level for tab counts
  const spellsByLevel = characterSpells.reduce((acc, spell) => {
    const level = spell.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {} as Record<number, CharacterSpell[]>);
  
  // Toggle prepared status
  const togglePrepared = (spellId: string) => {
    const updatedSpells = characterSpells.map(spell => {
      if (spell.id === spellId) {
        return { ...spell, prepared: !spell.prepared };
      }
      return spell;
    });
    
    // Update character with the new spells array
    onUpdateCharacter({ spells: updatedSpells });
  };
  
  // Remove spell
  const removeSpell = (spellId: string) => {
    const updatedSpells = characterSpells.filter(spell => spell.id !== spellId);
    onUpdateCharacter({ spells: updatedSpells });
  };
  
  // Handle level filter change
  const handleLevelFilterChange = (value: string) => {
    setLevelFilter(value === "all" ? null : parseInt(value));
  };
  
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-between items-center mb-4">
          <CardTitle 
            className="text-2xl font-philosopher"
            style={{ color: currentTheme.accent }}
          >
            <Sparkles className="inline-block mr-2" size={20} />
            Заклинания
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Фильтры
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Фильтры заклинаний</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="spell-filter">Поиск по названию</Label>
                    <Input
                      id="spell-filter"
                      placeholder="Название заклинания..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level-filter">Уровень заклинания</Label>
                    <Select
                      value={levelFilter === null ? "all" : levelFilter.toString()}
                      onValueChange={handleLevelFilterChange}
                    >
                      <SelectTrigger id="level-filter">
                        <SelectValue placeholder="Выберите уровень" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все уровни</SelectItem>
                        <SelectItem value="0">Заговоры</SelectItem>
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
                  </div>
                  
                  {hasPreparedSpellSystem && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prepared-only"
                        checked={showOnlyPrepared}
                        onCheckedChange={(checked) => setShowOnlyPrepared(checked as boolean)}
                      />
                      <Label htmlFor="prepared-only">Только подготовленные</Label>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilterText("");
                      setShowOnlyPrepared(false);
                      setLevelFilter(null);
                    }}
                    className="w-full"
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={() => setOpenAddModal(true)}
              style={{ backgroundColor: currentTheme.accent }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </div>
        </div>
        
        {/* Spellcasting info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="overflow-hidden border border-primary/20 bg-gradient-to-br from-gray-800 to-black backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Атрибут заклинаний</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{spellcastingAbility}</div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border border-primary/20 bg-gradient-to-br from-gray-800 to-black backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Сложность спасброска</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{spellSaveDC}</div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border border-primary/20 bg-gradient-to-br from-gray-800 to-black backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Бонус атаки заклинанием</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">+{spellAttackBonus}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Spell slots */}
        {character.spellSlots && Object.keys(character.spellSlots).length > 0 && (
          <div className="mb-4">
            <SpellSlotsPanel 
              character={character} 
              onUpdate={onUpdateCharacter} 
            />
          </div>
        )}
        
        {/* Prepared spells count */}
        {hasPreparedSpellSystem && maxPreparedSpells > 0 && (
          <div className="mb-4 p-4 border border-primary/20 rounded-lg bg-gray-800/20 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold">Подготовленные заклинания</h3>
                <p className="text-sm opacity-70">
                  Заклинания, доступные для использования
                </p>
              </div>
              <Badge
                variant={preparedSpellsCount > maxPreparedSpells ? "destructive" : "outline"}
                className="text-lg px-3 py-1"
              >
                {preparedSpellsCount} / {maxPreparedSpells}
              </Badge>
            </div>
            {preparedSpellsCount > maxPreparedSpells && (
              <div className="mt-2 text-sm text-destructive">
                <CircleAlert className="inline-block mr-1 h-4 w-4" />
                Слишком много подготовленных заклинаний. Уберите {preparedSpellsCount - maxPreparedSpells}.
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-0">
        {characterSpells.length > 0 ? (
          <>
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="all" className="flex-1">
                  Все
                  <Badge variant="outline" className="ml-2">{characterSpells.length}</Badge>
                </TabsTrigger>
                
                <TabsTrigger value="cantrips" className="flex-1">
                  Заговоры
                  <Badge variant="outline" className="ml-2">{spellsByLevel[0]?.length || 0}</Badge>
                </TabsTrigger>
                
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                  spellsByLevel[level] && spellsByLevel[level].length > 0 && (
                    <TabsTrigger key={level} value={level.toString()} className="flex-1">
                      {level} уровень
                      <Badge variant="outline" className="ml-2">{spellsByLevel[level]?.length || 0}</Badge>
                    </TabsTrigger>
                  )
                ))}
              </TabsList>
              
              <TabsContent value={activeTab} className="m-0">
                {filteredSpells.length > 0 ? (
                  <ScrollArea className="h-[calc(100vh-24rem)]">
                    <div className="space-y-2">
                      {filteredSpells.map((spell) => (
                        <SpellPanel
                          key={spell.id}
                          spellData={spell}
                          character={character}
                          canPrepare={hasPreparedSpellSystem}
                          onTogglePrepared={() => togglePrepared(spell.id)}
                          onRemoveSpell={() => removeSpell(spell.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-1">Нет заклинаний</h3>
                    <p className="text-muted-foreground">
                      {filterText || showOnlyPrepared || levelFilter !== null ? 
                        "Нет заклинаний, соответствующих фильтрам" : 
                        "Добавьте заклинания из списка класса"
                      }
                    </p>
                    
                    {(filterText || showOnlyPrepared || levelFilter !== null) && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setFilterText("");
                          setShowOnlyPrepared(false);
                          setLevelFilter(null);
                        }}
                        className="mt-4"
                      >
                        Сбросить фильтры
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <Separator className="my-6" />
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setOpenAddModal(true)}
                className="w-full md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Добавить заклинания
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Нет заклинаний</h3>
            <p className="text-muted-foreground mb-6">
              У вашего персонажа пока нет заклинаний
            </p>
            
            <Button 
              onClick={() => setOpenAddModal(true)}
              style={{ backgroundColor: currentTheme.accent }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить заклинания
            </Button>
          </div>
        )}
      </CardContent>
      
      <SpellSelectionModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        character={character}
        onUpdate={onUpdateCharacter}
      />
    </Card>
  );
};

export default SpellsTab;
