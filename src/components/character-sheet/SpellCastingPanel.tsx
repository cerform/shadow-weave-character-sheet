
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Character, CharacterSpell } from '@/types/character';
import { calculateAbilityModifier } from '@/utils/characterUtils';
import { Badge } from '@/components/ui/badge';
import { Book, BookOpen, Brain, Filter, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpellSlotManager from './SpellSlotManager';
import { useCharacter } from '@/contexts/CharacterContext';
import { SpellData } from '@/types/spells';
import SpellDialog from './SpellDialog';

interface SpellCastingPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellCastingPanel = ({ character, onUpdate }: SpellCastingPanelProps) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState('');
  
  // Check if the character has spellcasting abilities
  const hasSpellcasting = useMemo(() => {
    const spellcastingClasses = ['бард', 'волшебник', 'друид', 'жрец', 'клерик', 'колдун', 'паладин', 'следопыт', 'чародей'];
    return spellcastingClasses.includes((character.class || '').toLowerCase()) || (character.spells && character.spells.length > 0);
  }, [character.class, character.spells]);
  
  // Calculate spell save DC and attack bonus
  const spellcastingInfo = useMemo(() => {
    if (!character.spellcasting?.ability) return null;
    
    // Determine the ability score and modifier
    const abilityName = character.spellcasting.ability;
    const abilityScore = character.abilities?.[abilityName] || 10;
    const abilityModifier = calculateAbilityModifier(abilityScore);
    
    // Calculate spell save DC and spell attack bonus
    const profBonus = character.proficiencyBonus || 2;
    const saveDC = 8 + profBonus + abilityModifier;
    const attackBonus = profBonus + abilityModifier;
    
    return {
      ability: abilityName,
      saveDC,
      attackBonus
    };
  }, [character.spellcasting, character.abilities, character.proficiencyBonus]);

  // Determine which spells to display based on active tab
  const filteredSpells = useMemo(() => {
    if (!character.spells) return [];
    
    let spells = [...character.spells];
    
    // Filter by tab
    switch (activeTab) {
      case 'prepared':
        spells = spells.filter(spell => spell.prepared);
        break;
      case 'cantrips':
        spells = spells.filter(spell => spell.level === 0);
        break;
      default:
        // Show all spells
        break;
    }
    
    // Filter by search term
    if (filter) {
      const searchTerm = filter.toLowerCase();
      spells = spells.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm) ||
        (spell.school && spell.school.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort by level and then by name
    return spells.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.name.localeCompare(b.name);
    });
  }, [character.spells, activeTab, filter]);

  // Group spells by level
  const spellsByLevel = useMemo(() => {
    const grouped: Record<number, CharacterSpell[]> = {};
    
    filteredSpells.forEach(spell => {
      if (!grouped[spell.level]) {
        grouped[spell.level] = [];
      }
      grouped[spell.level].push(spell);
    });
    
    return grouped;
  }, [filteredSpells]);

  // Handle opening the spell dialog
  const openSpellDialog = (spell: CharacterSpell) => {
    setSelectedSpell(spell);
    setIsDialogOpen(true);
  };

  // Handle spell preparation toggle
  const togglePrepared = (spellToToggle: CharacterSpell) => {
    if (!character.spells) return;
    
    const updatedSpells = character.spells.map(spell => {
      if (spell.name === spellToToggle.name) {
        return { ...spell, prepared: !spell.prepared };
      }
      return spell;
    });
    
    onUpdate({ spells: updatedSpells });
  };

  // If the character doesn't have spellcasting, show a message
  if (!hasSpellcasting) {
    return (
      <Card className="mt-4 bg-card/70">
        <CardHeader>
          <CardTitle className="text-lg">Заклинания</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            У этого персонажа нет способностей к заклинаниям.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 bg-card/70">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Заклинания</span>
          </div>
          {spellcastingInfo && (
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-xs">
                Сл. спас. {spellcastingInfo.saveDC}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Бонус атаки +{spellcastingInfo.attackBonus}
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        {/* Spell Slot Manager */}
        <SpellSlotManager character={character} onUpdate={onUpdate} showTitle={false} />
        
        {/* Spell Filtering and Tabs */}
        <div className="flex items-center space-x-2 mt-4 mb-2">
          <div className="relative flex-1">
            <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Фильтр заклинаний..."
              className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="all" className="text-xs">
              <Book className="h-3.5 w-3.5 mr-1" />
              Все
            </TabsTrigger>
            <TabsTrigger value="prepared" className="text-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              Подготов.
            </TabsTrigger>
            <TabsTrigger value="cantrips" className="text-xs">
              <Brain className="h-3.5 w-3.5 mr-1" />
              Заговоры
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {Object.entries(spellsByLevel).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Заклинания не найдены
              </p>
            ) : (
              Object.entries(spellsByLevel).map(([level, spellList]) => (
                <div key={level} className="mb-4">
                  <h4 className="text-sm font-medium mb-1">
                    {level === '0' ? 'Заговоры' : `Уровень ${level}`}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {spellList.map((spell) => (
                      <div 
                        key={spell.name}
                        className={`p-2 rounded-md border text-sm cursor-pointer transition-colors ${
                          spell.prepared 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-background/50 border-border hover:bg-background/80'
                        }`}
                        onClick={() => openSpellDialog(spell)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{spell.name}</div>
                          {parseInt(level) !== 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePrepared(spell);
                              }}
                            >
                              {spell.prepared ? 'Отменить' : 'Подготовить'}
                            </Button>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {spell.school && `${spell.school}`} 
                          {spell.castingTime && ` • ${spell.castingTime}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Spell Dialog */}
      {selectedSpell && (
        <SpellDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          spell={{
            id: selectedSpell.id || selectedSpell.name,
            name: selectedSpell.name,
            level: selectedSpell.level,
            school: selectedSpell.school || '',
            castingTime: selectedSpell.castingTime || '',
            range: selectedSpell.range || '',
            components: selectedSpell.components || '',
            duration: selectedSpell.duration || '',
            description: selectedSpell.description || '',
            classes: selectedSpell.classes || [],
            prepared: selectedSpell.prepared || false,
            verbal: selectedSpell.verbal || false,
            somatic: selectedSpell.somatic || false,
            material: selectedSpell.material || false,
            materials: selectedSpell.materials || '',
            higherLevel: selectedSpell.higherLevel || '',
            higherLevels: selectedSpell.higherLevels || '',
            source: selectedSpell.source || 'Книга игрока'
          }}
          onTogglePrepared={() => {
            togglePrepared(selectedSpell);
            const updatedSpell = { ...selectedSpell, prepared: !selectedSpell.prepared };
            setSelectedSpell(updatedSpell);
          }}
        />
      )}
    </Card>
  );
};

export default SpellCastingPanel;
