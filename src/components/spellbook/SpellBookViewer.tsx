
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, BookOpen, Plus, Filter, ScrollText, Clock, BookMarked } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SpellImporter from './SpellImporter';
import { CharacterSpell, SpellData } from '@/types/character';
import { useSpellbook } from '@/hooks/spellbook';
import { schools } from '@/data/spellSchools';
import { cn } from '@/lib/utils';

interface SpellBookViewerProps {
  characterClass?: string;
  characterLevel?: number;
  spells?: CharacterSpell[];
  onSpellsChange?: (spells: CharacterSpell[]) => void;
}

const SpellBookViewer: React.FC<SpellBookViewerProps> = ({
  characterClass,
  characterLevel = 1,
  spells: characterSpells = [],
  onSpellsChange,
}) => {
  const { spells: allSpells, adaptToSpellData, adaptToCharacterSpell } = useSpellbook(characterClass);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('character');
  const [spellDetails, setSpellDetails] = useState<SpellData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Convert character spells to SpellData format for display
  const [characterSpellData, setCharacterSpellData] = useState<SpellData[]>([]);
  
  useEffect(() => {
    // Convert character spells to SpellData for consistent display
    if (characterSpells && characterSpells.length > 0) {
      const convertedSpells = characterSpells.map(spell => adaptToSpellData(spell));
      setCharacterSpellData(convertedSpells);
    } else {
      setCharacterSpellData([]);
    }
  }, [characterSpells, adaptToSpellData]);
  
  // Filter spells based on search term and filters
  const filteredSpells = React.useMemo(() => {
    return allSpells.filter(spell => {
      // Filter by search term
      const searchMatch = !searchTerm || 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (spell.description && spell.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
      // Filter by school
      const schoolMatch = !filterSchool || spell.school.toLowerCase() === filterSchool.toLowerCase();
      
      // Filter by level
      const levelMatch = filterLevel === null || spell.level === filterLevel;
      
      return searchMatch && schoolMatch && levelMatch;
    });
  }, [allSpells, searchTerm, filterSchool, filterLevel]);
  
  // Group spells by level
  const groupedSpells = React.useMemo(() => {
    const grouped: Record<number, SpellData[]> = {};
    
    // Group filtered spells by level
    filteredSpells.forEach(spell => {
      if (!grouped[spell.level]) {
        grouped[spell.level] = [];
      }
      grouped[spell.level].push(spell);
    });
    
    // Group character spells by level
    if (activeTab === 'character') {
      const charGrouped: Record<number, SpellData[]> = {};
      characterSpellData.forEach(spell => {
        if (!charGrouped[spell.level]) {
          charGrouped[spell.level] = [];
        }
        charGrouped[spell.level].push(spell);
      });
      return charGrouped;
    }
    
    return grouped;
  }, [filteredSpells, characterSpellData, activeTab]);
  
  // Calculate max spell level based on character level
  const maxSpellLevel = React.useMemo(() => {
    if (characterLevel >= 17) return 9;
    if (characterLevel >= 15) return 8;
    if (characterLevel >= 13) return 7;
    if (characterLevel >= 11) return 6;
    if (characterLevel >= 9) return 5;
    if (characterLevel >= 7) return 4;
    if (characterLevel >= 5) return 3;
    if (characterLevel >= 3) return 2;
    if (characterLevel >= 1) return 1;
    return 0;
  }, [characterLevel]);
  
  // Handle spell selection
  const handleSelectSpell = (spell: SpellData) => {
    // Convert to CharacterSpell and add to character's spellbook
    if (onSpellsChange) {
      const isExisting = characterSpellData.some(s => s.name === spell.name);
      
      if (isExisting) {
        // Remove spell if it already exists
        const updatedSpells = characterSpells.filter(s => s.name !== spell.name);
        onSpellsChange(updatedSpells);
      } else {
        // Add spell if it doesn't exist
        const characterSpell = adaptToCharacterSpell(spell);
        onSpellsChange([...characterSpells, characterSpell]);
      }
    }
  };
  
  // Toggle spell preparation status
  const togglePrepared = (spell: SpellData) => {
    if (onSpellsChange) {
      const updatedSpells = characterSpells.map(s => {
        if (s.name === spell.name) {
          return { ...s, prepared: !s.prepared };
        }
        return s;
      });
      onSpellsChange(updatedSpells);
    }
  };
  
  // Handle importing spells
  const handleImportSpells = (importedSpells: CharacterSpell[]) => {
    if (onSpellsChange) {
      // Combine existing spells with imported spells, removing duplicates
      const existingNames = new Set(characterSpells.map(spell => spell.name));
      const newSpells = importedSpells.filter(spell => !existingNames.has(spell.name));
      
      onSpellsChange([...characterSpells, ...newSpells]);
    }
    setIsImportOpen(false);
  };
  
  // Get a spell card background style based on its school
  const getSpellCardStyle = (school: string) => {
    const schoolKey = school.toLowerCase();
    switch (schoolKey) {
      case 'evocation': return 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-orange-500/20';
      case 'abjuration': return 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-cyan-500/20';
      case 'conjuration': return 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-yellow-500/20';
      case 'divination': return 'bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border-fuchsia-500/20';
      case 'enchantment': return 'bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-rose-500/20';
      case 'illusion': return 'bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-violet-500/20';
      case 'necromancy': return 'bg-gradient-to-br from-neutral-700/10 to-stone-900/10 border-stone-500/20';
      case 'transmutation': return 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-emerald-500/20';
      default: return 'bg-card/30';
    }
  };
  
  // Render spell card
  const SpellCard = ({ spell, inSpellbook = false }: { spell: SpellData, inSpellbook?: boolean }) => {
    const cardStyle = getSpellCardStyle(spell.school);
    
    return (
      <Card 
        className={cn(
          "mb-2 cursor-pointer hover:shadow-md transition-shadow",
          cardStyle,
          spell.prepared ? "ring-1 ring-primary/30" : ""
        )}
        onClick={() => {
          setSpellDetails(spell);
          setIsDetailsOpen(true);
        }}
      >
        <CardContent className="p-3 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-medium">{spell.name}</h4>
              {spell.ritual && <Badge variant="outline" className="ml-1 text-xs">Ритуал</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
              {spell.school}, {spell.castingTime}
            </p>
          </div>
          
          {inSpellbook && spell.level > 0 && (
            <Checkbox 
              checked={spell.prepared} 
              onCheckedChange={() => togglePrepared(spell)}
              onClick={e => e.stopPropagation()}
              className="mt-1"
            />
          )}
          
          {!inSpellbook && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectSpell(spell);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Render spell level section
  const renderSpellLevelSection = (level: number, spells: SpellData[], inSpellbook = false) => {
    // Use explicit type safety by ensuring level is a number and spells is an array
    if (typeof level !== "number" || !Array.isArray(spells)) {
      return null;
    }
    
    const levelName = level === 0 ? "Заговоры" : `${level} уровень`;
    
    return (
      <div key={level} className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{levelName}</h3>
        <div className="space-y-1">
          {spells.map((spell, index) => (
            <SpellCard 
              key={`${spell.name}-${index}`} 
              spell={spell} 
              inSpellbook={inSpellbook} 
            />
          ))}
        </div>
      </div>
    );
  };
  
  // Main component render
  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-semibold">Книга заклинаний</div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Импорт
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="character" className="flex items-center">
              <BookMarked className="h-4 w-4 mr-2" />
              Мои заклинания
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Все заклинания
            </TabsTrigger>
          </TabsList>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <div className="grow">
                <Input
                  placeholder="Поиск заклинаний..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  startIcon={<Search className="h-4 w-4" />}
                />
              </div>
              
              <Select value={filterSchool || ''} onValueChange={val => setFilterSchool(val || null)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Школа магии" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все школы</SelectItem>
                  {schools.map(school => (
                    <SelectItem key={school.name} value={school.name}>{school.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={filterLevel !== null ? String(filterLevel) : ''} 
                onValueChange={val => setFilterLevel(val ? Number(val) : null)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все уровни</SelectItem>
                  <SelectItem value="0">Заговоры</SelectItem>
                  {Array.from({length: maxSpellLevel}, (_, i) => i + 1).map(level => (
                    <SelectItem key={level} value={String(level)}>
                      {level} уровень
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="character" className="h-full">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {Object.keys(groupedSpells).length > 0 ? (
                Object.entries(groupedSpells)
                  .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
                  .map(([level, spells]) => renderSpellLevelSection(Number(level), spells, true))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">У вас пока нет заклинаний</p>
                  <Button variant="outline" onClick={() => setActiveTab('all')}>
                    Добавить заклинания
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="all" className="h-full">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {Object.entries(groupedSpells)
                .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
                .map(([level, spells]) => renderSpellLevelSection(Number(level), spells))
              }
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Spell Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {spellDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div>{spellDetails.name}</div>
                  <div className="flex gap-2">
                    {spellDetails.ritual && <Badge variant="outline">Ритуал</Badge>}
                    {spellDetails.concentration && <Badge variant="outline">Концентрация</Badge>}
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium mb-1">Уровень</div>
                  <div>{spellDetails.level === 0 ? "Заговор" : `${spellDetails.level} уровень`}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Школа</div>
                  <div>{spellDetails.school}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Время накладывания</div>
                  <div>{spellDetails.castingTime}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Дистанция</div>
                  <div>{spellDetails.range}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Компоненты</div>
                  <div>
                    {spellDetails.components}
                    {spellDetails.material && spellDetails.materialComponents && (
                      <span className="text-sm ml-1">({spellDetails.materialComponents})</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Длительность</div>
                  <div>{spellDetails.duration}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Описание</div>
                <div className="text-sm whitespace-pre-wrap">{spellDetails.description}</div>
              </div>
              
              {spellDetails.higherLevels && (
                <div>
                  <div className="text-sm font-medium mb-2">На больших уровнях</div>
                  <div className="text-sm">{spellDetails.higherLevels}</div>
                </div>
              )}
              
              <div className="mt-4">
                <div className="text-sm font-medium mb-1">Классы</div>
                <div className="flex flex-wrap gap-1">
                  {typeof spellDetails.classes === 'string' ? (
                    <Badge variant="secondary">{spellDetails.classes}</Badge>
                  ) : (
                    Array.isArray(spellDetails.classes) && spellDetails.classes.map((cls, idx) => (
                      <Badge key={idx} variant="secondary">{cls}</Badge>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => {
                    handleSelectSpell(spellDetails);
                    setIsDetailsOpen(false);
                  }}
                >
                  {characterSpellData.some(s => s.name === spellDetails.name) 
                    ? "Удалить из книги заклинаний" 
                    : "Добавить в книгу заклинаний"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Spell Importer Dialog */}
      {isImportOpen && (
        <SpellImporter
          onClose={() => setIsImportOpen(false)}
          onImport={handleImportSpells}
        />
      )}
    </>
  );
};

export default SpellBookViewer;
