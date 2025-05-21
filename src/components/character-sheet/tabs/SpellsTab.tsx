
import React, { useState, useEffect } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { Button } from "@/components/ui/button";
import { useSpellbook } from '@/hooks/spellbook';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Book, PlusCircle } from 'lucide-react';
import SpellCard from '@/components/character-sheet/SpellCard';
import SpellSelectionModal from '@/components/character-sheet/SpellSelectionModal';
import SpellDetailsModal from '@/components/character-sheet/SpellDetailsModal';
import { SpellData } from '@/types/spells';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellsTabProps {
  character: Character;
  onUpdateCharacter: (updates: Partial<Character>) => void;
}

const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdateCharacter }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const { loadSpells } = useSpellbook();
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpells, setFilteredSpells] = useState<CharacterSpell[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Prepare the character's spells when component mounts
  useEffect(() => {
    loadSpells();
  }, [loadSpells]);
  
  // Filter spells based on search term and active tab
  useEffect(() => {
    if (!character.spells) {
      setFilteredSpells([]);
      return;
    }
    
    // Убедитесь, что все элементы в character.spells - объекты
    const spellObjects = character.spells.filter(
      (spell): spell is CharacterSpell => typeof spell !== 'string'
    );
    
    let filtered = [...spellObjects];
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(spell => {
        return (
          spell.name.toLowerCase().includes(searchLower) ||
          (spell.school && spell.school.toLowerCase().includes(searchLower)) ||
          (spell.description && typeof spell.description === 'string' && 
            spell.description.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Filter by level
    if (activeTab !== 'all') {
      if (activeTab === 'prepared') {
        filtered = filtered.filter(spell => spell.prepared);
      } else {
        const level = activeTab === 'cantrips' ? 0 : parseInt(activeTab, 10);
        filtered = filtered.filter(spell => spell.level === level);
      }
    }
    
    setFilteredSpells(filtered);
  }, [character.spells, searchTerm, activeTab]);

  const handleOpenDetailModal = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsDetailsModalOpen(true);
  };
  
  const togglePrepared = (spellName: string) => {
    if (!character.spells) return;
    
    const updatedSpells = character.spells.map(spell => {
      if (typeof spell === 'string') return spell;
      if (spell.name === spellName) {
        return { ...spell, prepared: !spell.prepared };
      }
      return spell;
    });
    
    onUpdateCharacter({ spells: updatedSpells });
  };
  
  // Get unique spell levels for tabs
  const spellLevels = React.useMemo(() => {
    if (!character.spells) return [];
    
    const levels = new Set<number>();
    character.spells.forEach(spell => {
      if (typeof spell !== 'string' && spell.level !== undefined) {
        levels.add(spell.level);
      }
    });
    
    return [...levels].sort((a, b) => a - b);
  }, [character.spells]);
  
  // Count number of prepared spells
  const preparedSpellsCount = React.useMemo(() => {
    if (!character.spells) return 0;
    
    return character.spells.filter(spell => {
      if (typeof spell === 'string') return false;
      return spell.prepared && spell.level > 0;
    }).length;
  }, [character.spells]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold mb-1">Заклинания</h3>
          <p className="text-sm text-muted-foreground">
            Подготовлено: {preparedSpellsCount}, 
            Всего: {character.spells?.filter(s => typeof s !== 'string' && s.level > 0).length || 0}
          </p>
        </div>
        
        <Button onClick={() => setIsSelectionModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить заклинания
        </Button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Поиск заклинаний..." 
          className="pl-8"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="prepared">Подготовленные</TabsTrigger>
          <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
          {spellLevels.filter(level => level > 0).map(level => (
            <TabsTrigger key={`level-${level}`} value={String(level)}>
              {level} уровень
            </TabsTrigger>
          ))}
        </TabsList>
        
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Загрузка заклинаний...</p>
            </div>
          ) : filteredSpells.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Book className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-1">Нет заклинаний</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {character.spells?.length === 0 
                  ? 'У вас еще нет заклинаний. Добавьте заклинания из списка.' 
                  : 'По вашему запросу не найдено заклинаний.'}
              </p>
              
              {character.spells?.length === 0 && (
                <Button onClick={() => setIsSelectionModalOpen(true)} variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Добавить заклинания
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredSpells.map((spell, index) => (
                <SpellCard 
                  key={`${spell.name}-${index}`}
                  spell={spell}
                  onTogglePrepared={() => togglePrepared(spell.name)}
                  onClick={() => handleOpenDetailModal(spell)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </Tabs>
      
      <SpellSelectionModal 
        open={isSelectionModalOpen}
        onOpenChange={setIsSelectionModalOpen}
        character={character}
        onUpdateCharacter={onUpdateCharacter}
      />
      
      {selectedSpell && (
        <SpellDetailsModal 
          spell={selectedSpell}
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
        />
      )}
    </div>
  );
};

export default SpellsTab;
