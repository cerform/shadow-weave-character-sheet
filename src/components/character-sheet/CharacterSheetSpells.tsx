import React from 'react';
import { Character } from '@/types/character';
import SpellCastingPanel from './SpellCastingPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpellDialog from './SpellDialog';
import { useState, useEffect } from 'react';
import { SpellData } from '@/types/spells';

interface CharacterSheetSpellsProps {
  character: Character;
}

const CharacterSheetSpells: React.FC<CharacterSheetSpellsProps> = ({ character }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [spellsByLevel, setSpellsByLevel] = useState<{[key: number]: any[]}>({});
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isSpellDialogOpen, setIsSpellDialogOpen] = useState(false);

  // Providing empty onUpdate function to make it compatible with SpellCastingPanel
  const handleUpdate = () => {
    // This is a read-only view, so do nothing
  };

  // Group spells by level
  useEffect(() => {
    if (!character.spells) return;

    const grouped: {[key: number]: any[]} = {};
    
    // Initialize all levels with empty arrays
    for (let i = 0; i <= 9; i++) {
      grouped[i] = [];
    }
    
    // Group spells by level
    character.spells.forEach(spell => {
      const level = typeof spell === 'string' ? 0 : (spell.level || 0);
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push(spell);
    });
    
    setSpellsByLevel(grouped);
  }, [character.spells]);

  // Handle opening a spell dialog
  const handleOpenSpell = (spell: any) => {
    // Convert to SpellData format
    const spellData: SpellData = {
      id: typeof spell === 'string' ? spell : (spell.id || ''),
      name: typeof spell === 'string' ? spell : spell.name,
      level: typeof spell === 'string' ? 0 : (spell.level || 0),
      school: typeof spell === 'string' ? '' : (spell.school || ''),
      castingTime: typeof spell === 'string' ? '1 действие' : (spell.castingTime || '1 действие'),
      range: typeof spell === 'string' ? 'Касание' : (spell.range || 'Касание'),
      components: typeof spell === 'string' ? '' : (spell.components || ''),
      duration: typeof spell === 'string' ? 'Мгновенная' : (spell.duration || 'Мгновенная'),
      description: typeof spell === 'string' ? '' : (spell.description || ''),
      classes: typeof spell === 'string' ? [] : (spell.classes || []),
      ritual: typeof spell === 'string' ? false : (spell.ritual || false),
      concentration: typeof spell === 'string' ? false : (spell.concentration || false),
    };
    
    setSelectedSpell(spellData);
    setIsSpellDialogOpen(true);
  };

  // Get spell level name
  const getSpellLevelName = (level: number): string => {
    if (level === 0) return 'Заговоры';
    return `Уровень ${level}`;
  };

  return (
    <div className="space-y-4">
      <SpellCastingPanel 
        character={character} 
        onUpdate={handleUpdate}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
          <TabsTrigger value="level1">Уровень 1</TabsTrigger>
          <TabsTrigger value="level2">Уровень 2</TabsTrigger>
          <TabsTrigger value="level3+">Уровень 3+</TabsTrigger>
          <TabsTrigger value="prepared">Подготовленные</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          <ScrollArea className="h-[calc(100vh-320px)]">
            {Object.entries(spellsByLevel).map(([level, spells]) => {
              if (spells.length === 0) return null;
              
              return (
                <Card key={level} className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      {getSpellLevelName(parseInt(level))}
                      <Badge variant="outline" className="ml-2">{spells.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {spells.map((spell, index) => {
                        const spellName = typeof spell === 'string' ? spell : spell.name;
                        const isPrepared = typeof spell !== 'string' && spell.prepared;
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary/10">
                            <Button 
                              variant="ghost" 
                              onClick={() => handleOpenSpell(spell)}
                              className="flex-1 justify-start px-2 hover:bg-transparent hover:underline"
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              <span className="truncate">{spellName}</span>
                            </Button>
                            {isPrepared && (
                              <Badge variant="secondary" className="ml-2">Подготовлено</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="cantrips" className="space-y-4 mt-4">
          <ScrollArea className="h-[calc(100vh-320px)]">
            {spellsByLevel[0]?.length > 0 ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    Заговоры
                    <Badge variant="outline" className="ml-2">{spellsByLevel[0].length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {spellsByLevel[0].map((spell, index) => {
                      const spellName = typeof spell === 'string' ? spell : spell.name;
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary/10">
                          <Button 
                            variant="ghost" 
                            onClick={() => handleOpenSpell(spell)}
                            className="flex-1 justify-start px-2 hover:bg-transparent hover:underline"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            <span className="truncate">{spellName}</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Нет известных заговоров
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="level1" className="space-y-4 mt-4">
          <ScrollArea className="h-[calc(100vh-320px)]">
            {spellsByLevel[1]?.length > 0 ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    Заклинания 1 уровня
                    <Badge variant="outline" className="ml-2">{spellsByLevel[1].length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {spellsByLevel[1].map((spell, index) => {
                      const spellName = typeof spell === 'string' ? spell : spell.name;
                      const isPrepared = typeof spell !== 'string' && spell.prepared;
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary/10">
                          <Button 
                            variant="ghost" 
                            onClick={() => handleOpenSpell(spell)}
                            className="flex-1 justify-start px-2 hover:bg-transparent hover:underline"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            <span className="truncate">{spellName}</span>
                          </Button>
                          {isPrepared && (
                            <Badge variant="secondary" className="ml-2">Подготовлено</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Нет заклинаний 1 уровня
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="level2" className="space-y-4 mt-4">
          <ScrollArea className="h-[calc(100vh-320px)]">
            {spellsByLevel[2]?.length > 0 ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    Заклинания 2 уровня
                    <Badge variant="outline" className="ml-2">{spellsByLevel[2].length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {spellsByLevel[2].map((spell, index) => {
                      const spellName = typeof spell === 'string' ? spell : spell.name;
                      const isPrepared = typeof spell !== 'string' && spell.prepared;
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary/10">
                          <Button 
                            variant="ghost" 
                            onClick={() => handleOpenSpell(spell)}
                            className="flex-1 justify-start px-2 hover:bg-transparent hover:underline"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            <span className="truncate">{spellName}</span>
                          </Button>
                          {isPrepared && (
                            <Badge variant="secondary" className="ml-2">Подготовлено</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Нет заклинаний 2 уровня
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="level3+" className="space-y-4 mt-4">
          <ScrollArea className="h-[calc(100vh-320px)]">
            {[3, 4, 5, 6, 7, 8, 9].some(level => spellsByLevel[level]?.length > 0) ? (
              <>
                {[3, 4, 5, 6, 7, 8, 9].map(level => {
                  if (!spellsByLevel[level] || spellsByLevel[level].length === 0) return null;
                  
                  return (
                    <Card key={level} className="mb-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          Заклинания {level} уровня
                          <Badge variant="outline" className="ml-2">{spellsByLevel[level].length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {spellsByLevel[level].map((spell, index) => {
                            const spellName = typeof spell === 'string' ? spell : spell.name;
                            const isPrepared = typeof spell !== 'string' && spell.prepared;
                            
                            return (
                              <div key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary/10">
                                <Button 
                                  variant="ghost" 
                                  onClick={() => handleOpenSpell(spell)}
                                  className="flex-1 justify-start px-2 hover:bg-transparent hover:underline"
                                >
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  <span className="truncate">{spellName}</span>
                                </Button>
                                {isPrepared && (
                                  <Badge variant="secondary" className="ml-2">Подготовлено</Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Нет заклинаний 3+ уровня
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="prepared" className="space-y-4 mt-4">
          <ScrollArea className="h-[calc(100vh-320px)]">
            {Object.values(spellsByLevel).some(spells => 
              spells.some(spell => typeof spell !== 'string' && spell.prepared)
            ) ? (
              <>
                {Object.entries(spellsByLevel).map(([level, spells]) => {
                  const preparedSpells = spells.filter(spell => 
                    typeof spell !== 'string' && spell.prepared
                  );
                  
                  if (preparedSpells.length === 0) return null;
                  
                  return (
                    <Card key={level} className="mb-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          {getSpellLevelName(parseInt(level))}
                          <Badge variant="outline" className="ml-2">{preparedSpells.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {preparedSpells.map((spell, index) => {
                            const spellName = typeof spell === 'string' ? spell : spell.name;
                            
                            return (
                              <div key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary/10">
                                <Button 
                                  variant="ghost" 
                                  onClick={() => handleOpenSpell(spell)}
                                  className="flex-1 justify-start px-2 hover:bg-transparent hover:underline"
                                >
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  <span className="truncate">{spellName}</span>
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Нет подготовленных заклинаний
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      {selectedSpell && (
        <SpellDialog
          open={isSpellDialogOpen}
          onOpenChange={setIsSpellDialogOpen}
          spell={selectedSpell}
          character={character}
        />
      )}
    </div>
  );
};

export default CharacterSheetSpells;
