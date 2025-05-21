import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, BookOpen, Plus, Minus, Star, Download, Upload } from 'lucide-react';
import { SpellData } from '@/types/spells';
import { useSpellbook } from '@/contexts/SpellbookContext';
import SpellDetailView from './SpellDetailView';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import SpellImportModal from './SpellImportModal';
import SpellDatabaseManager from './SpellDatabaseManager';
import { useToast } from '@/hooks/use-toast';
import { CharacterSpell } from '@/types/character';
import { getSpellSchoolColor } from '@/utils/spellProcessors';

const SpellBookViewer: React.FC = () => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const { toast } = useToast();
  
  const {
    availableSpells,
    selectedSpells,
    addSpell,
    removeSpell,
    prepareSpell,
    unprepareSpell,
    loadSpells,
    exportSpells,
    importSpells,
    loading
  } = useSpellbook();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [filters, setFilters] = useState({
    schools: [] as string[],
    ritual: false,
    concentration: false,
    level: 'all'
  });

  // Load spells on component mount
  useEffect(() => {
    loadSpells();
  }, [loadSpells]);

  // Filter spells based on search term and filters
  const filteredSpells = useMemo(() => {
    if (!availableSpells) return [];

    let filtered = [...availableSpells];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(term) || 
        (spell.description && typeof spell.description === 'string' && spell.description.toLowerCase().includes(term)) ||
        (spell.school && spell.school.toLowerCase().includes(term))
      );
    }

    // Filter by tab
    if (activeTab === 'my-spells') {
      const selectedIds = selectedSpells.map(s => s.id);
      filtered = filtered.filter(spell => selectedIds.includes(spell.id));
    } else if (activeTab === 'prepared') {
      const preparedIds = selectedSpells.filter(s => s.prepared).map(s => s.id);
      filtered = filtered.filter(spell => preparedIds.includes(spell.id));
    }

    // Apply additional filters
    if (filters.schools.length > 0) {
      filtered = filtered.filter(spell => 
        spell.school && filters.schools.includes(spell.school.toLowerCase())
      );
    }

    if (filters.ritual) {
      filtered = filtered.filter(spell => spell.ritual);
    }

    if (filters.concentration) {
      filtered = filtered.filter(spell => spell.concentration);
    }

    if (filters.level !== 'all') {
      const level = parseInt(filters.level, 10);
      filtered = filtered.filter(spell => spell.level === level);
    }

    return filtered;
  }, [availableSpells, searchTerm, activeTab, selectedSpells, filters]);

  // Group spells by level for display
  const spellsByLevel = useMemo(() => {
    const grouped: Record<number, SpellData[]> = {};
    
    filteredSpells.forEach(spell => {
      if (!grouped[spell.level]) {
        grouped[spell.level] = [];
      }
      grouped[spell.level].push(spell);
    });
    
    // Sort each level group by name
    Object.keys(grouped).forEach(level => {
      grouped[parseInt(level, 10)].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return grouped;
  }, [filteredSpells]);

  // Get unique schools for filtering
  const spellSchools = useMemo(() => {
    if (!availableSpells) return [];
    
    const schools = new Set<string>();
    availableSpells.forEach(spell => {
      if (spell.school) {
        schools.add(spell.school.toLowerCase());
      }
    });
    
    return Array.from(schools).sort();
  }, [availableSpells]);

  // Handle spell selection
  const handleSelectSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
  };

  // Check if a spell is in the selected list
  const isSpellSelected = (spellId: string | number): boolean => {
    return selectedSpells.some(s => s.id === spellId);
  };

  // Check if a spell is prepared
  const isSpellPrepared = (spellId: string | number): boolean => {
    const spell = selectedSpells.find(s => s.id === spellId);
    return spell ? !!spell.prepared : false;
  };

  // Handle adding a spell to the spellbook
  const handleAddSpell = (spell: SpellData) => {
    if (isSpellSelected(spell.id)) {
      toast({
        title: "Уже добавлено",
        description: "Это заклинание уже есть в вашей книге заклинаний"
      });
      return;
    }
    
    addSpell(spell);
    toast({
      title: "Заклинание добавлено",
      description: `${spell.name} добавлено в вашу книгу заклинаний`
    });
  };

  // Handle removing a spell from the spellbook
  const handleRemoveSpell = (spell: SpellData) => {
    removeSpell(spell.id.toString());
    toast({
      title: "Заклинание удалено",
      description: `${spell.name} удалено из вашей книги заклинаний`
    });
  };

  // Handle preparing/unpreparing a spell
  const handlePrepareSpell = (spell: SpellData) => {
    if (isSpellPrepared(spell.id)) {
      unprepareSpell(spell.id.toString());
      toast({
        title: "Заклинание не подготовлено",
        description: `${spell.name} больше не подготовлено`
      });
    } else {
      prepareSpell(spell.id.toString());
      toast({
        title: "Заклинание подготовлено",
        description: `${spell.name} теперь подготовлено`
      });
    }
  };

  // Handle exporting spells
  const handleExportSpells = () => {
    if (selectedSpells.length === 0) {
      toast({
        title: "Нет заклинаний",
        description: "У вас нет заклинаний для экспорта",
        variant: "destructive"
      });
      return;
    }
    
    exportSpells();
    toast({
      title: "Заклинания экспортированы",
      description: "Ваши заклинания были экспортированы в JSON файл"
    });
  };

  // Render level headers
  const renderLevelHeader = (level: number) => {
    const spellCount = spellsByLevel[level]?.length || 0;
    
    if (level === 0) {
      return `Заговоры (${spellCount})`;
    }
    
    return `${level} уровень (${spellCount})`;
  };

  // Render spell card
  const renderSpellCard = (spell: SpellData) => {
    const isOwned = isSpellSelected(spell.id);
    const isPrepared = isSpellPrepared(spell.id);
    
    return (
      <Card 
        key={spell.id} 
        className={`mb-2 cursor-pointer hover:bg-accent/10 transition-colors ${selectedSpell?.id === spell.id ? 'border-primary' : ''}`}
        style={{ backgroundColor: currentTheme.cardBackground }}
        onClick={() => handleSelectSpell(spell)}
      >
        <CardContent className="p-3 flex justify-between items-center">
          <div>
            <div className="font-medium" style={{ color: currentTheme.textColor }}>
              {spell.name}
            </div>
            <div className="text-xs flex items-center gap-1" style={{ color: currentTheme.mutedTextColor }}>
              <span>{spell.school || 'Универсальная'}</span>
              {spell.ritual && <Badge variant="outline" className="text-xs py-0 px-1 h-4">Ритуал</Badge>}
              {spell.concentration && <Badge variant="outline" className="text-xs py-0 px-1 h-4">Концентрация</Badge>}
            </div>
          </div>
          
          <div className="flex gap-1">
            {isOwned ? (
              <>
                {spell.level > 0 && (
                  <Button 
                    size="icon" 
                    variant={isPrepared ? "default" : "outline"} 
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrepareSpell(spell);
                    }}
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSpell(spell);
                  }}
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button 
                size="icon" 
                variant="outline" 
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSpell(spell);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left sidebar - spell list */}
      <div className="md:col-span-1">
        <Card className="h-full" style={{ backgroundColor: currentTheme.background }}>
          <CardContent className="p-4 h-full flex flex-col">
            <div className="mb-4 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск заклинаний..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowDatabaseModal(true)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="my-spells">Мои</TabsTrigger>
                  <TabsTrigger value="prepared">Подготовленные</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setShowImportModal(true)}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Импорт
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={handleExportSpells}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Экспорт
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-grow pr-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Загрузка заклинаний...
                </div>
              ) : filteredSpells.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Заклинания не найдены
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.keys(spellsByLevel)
                    .map(Number)
                    .sort((a, b) => a - b)
                    .map(level => (
                      <div key={level}>
                        <h3 
                          className="text-sm font-medium mb-2 pb-1 border-b"
                          style={{ 
                            borderColor: currentTheme.borderColor,
                            color: currentTheme.textColor
                          }}
                        >
                          {renderLevelHeader(level)}
                        </h3>
                        <div className="space-y-2">
                          {spellsByLevel[level].map(spell => renderSpellCard(spell))}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - spell details */}
      <div className="md:col-span-2">
        <SpellDetailView
          spell={selectedSpell}
          onPrepareSpell={handlePrepareSpell}
          onAddSpell={handleAddSpell}
          onRemoveSpell={handleRemoveSpell}
          isOwned={selectedSpell ? isSpellSelected(selectedSpell.id) : false}
          isPrepared={selectedSpell ? isSpellPrepared(selectedSpell.id) : false}
        />
      </div>
      
      {/* Import Modal */}
      <SpellImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(spells) => {
          importSpells(spells);
          setShowImportModal(false);
        }}
      />
      
      {/* Database Management Modal */}
      <Dialog open={showDatabaseModal} onOpenChange={setShowDatabaseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Управление базой заклинаний</DialogTitle>
          </DialogHeader>
          <SpellDatabaseManager onClose={() => setShowDatabaseModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpellBookViewer;
