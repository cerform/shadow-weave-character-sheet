
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Character } from '@/types/character';
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import { ChevronDown, ChevronUp, Plus, Search, BookOpen } from 'lucide-react';
import SpellCard from './SpellCard';
import SpellDetails from './SpellDetails';
import { normalizeSpells, convertToSpellData } from '@/utils/spellUtils';

interface SpellBookViewerProps {
  character: Character;
  onAddSpell?: () => void;
}

const SpellBookViewer: React.FC<SpellBookViewerProps> = ({ character, onAddSpell }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);
  const [spells, setSpells] = useState<SpellData[]>([]);
  const { theme, themeStyles } = useTheme();
  
  // Convert character spells to SpellData format for display
  useEffect(() => {
    if (character.spells) {
      const normalizedSpells = normalizeSpells(character.spells || []);
      const spellDataList = normalizedSpells.map(spell => convertToSpellData(spell));
      setSpells(spellDataList);
    } else {
      setSpells([]);
    }
  }, [character.spells]);

  // Filter spells based on search and active tab
  const filteredSpells = spells.filter(spell => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'cantrips' && spell.level === 0) || 
                       (activeTab === 'prepared' && spell.prepared) ||
                       (activeTab === String(spell.level));
    return matchesSearch && matchesTab;
  });

  // Group spells by level for display
  const spellsByLevel = filteredSpells.reduce((acc, spell) => {
    const level = spell.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {} as Record<number, SpellData[]>);

  // Handle spell click
  const handleSpellClick = (spellId: string) => {
    setSelectedSpellId(spellId);
  };

  // Toggle spell expansion
  const toggleSpellExpansion = (spellId: string) => {
    setExpandedSpellId(expandedSpellId === spellId ? null : spellId);
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Книга заклинаний</CardTitle>
            {onAddSpell && (
              <Button size="sm" onClick={onAddSpell}>
                <Plus className="w-4 h-4 mr-1" /> Добавить
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Поиск заклинаний..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4 sm:grid-cols-4">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
              <TabsTrigger value="prepared">Подготовленные</TabsTrigger>
              <TabsTrigger value="ritual">Ритуалы</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
        <div className="overflow-y-auto pr-2 space-y-4">
          {Object.keys(spellsByLevel).length > 0 ? (
            Object.keys(spellsByLevel)
              .map(Number)
              .sort((a, b) => a - b)
              .map(level => (
                <div key={`level-${level}`}>
                  <h3 className="font-medium mb-2 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {level === 0 ? 'Заговоры' : `Заклинания ${level} уровня`}
                    <Badge className="ml-2" variant="outline">
                      {spellsByLevel[level].length}
                    </Badge>
                  </h3>
                  
                  <div className="space-y-2">
                    {spellsByLevel[level].map(spell => (
                      <Card 
                        key={spell.id} 
                        className={`cursor-pointer ${selectedSpellId === spell.id ? 'border-primary' : ''}`}
                        onClick={() => handleSpellClick(spell.id)}
                      >
                        <div className="p-3 flex justify-between items-start">
                          <div>
                            <div className="font-medium">{spell.name}</div>
                            <div className="text-xs">
                              {spell.school}
                              {spell.ritual && ' (Ритуал)'}
                              {spell.concentration && ' (Концентрация)'}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {spell.prepared && (
                              <Badge className="mr-2 bg-green-500/20 text-green-600">
                                Подг
                              </Badge>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="p-0 h-6 w-6" 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSpellExpansion(spell.id);
                              }}
                            >
                              {expandedSpellId === spell.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {expandedSpellId === spell.id && (
                          <CardContent className="pt-0 pb-3">
                            <SpellCard 
                              spell={spell} 
                              currentTheme={theme as string}
                              onClick={() => handleSpellClick(spell.id)}
                            />
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {searchTerm ? 'Заклинания не найдены.' : 'Нет доступных заклинаний.'}
            </div>
          )}
        </div>
        
        <div>
          {selectedSpellId && (
            <div className="sticky top-0">
              <SpellDetails 
                spell={spells.find(s => s.id === selectedSpellId) || null}
                character={character}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellBookViewer;
