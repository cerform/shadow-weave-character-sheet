
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpellData } from '@/types/spells';
import SpellDetailModal from '../spell-detail/SpellDetailModal';
import SpellList from './SpellList';
import SpellTable from './SpellTable';
import SpellFilters from './SpellFilters';
import { getAllSpells } from '@/data/spells';

const SpellBookViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Load spells on component mount
  useEffect(() => {
    const loadSpells = async () => {
      setLoading(true);
      try {
        const allSpells = getAllSpells();
        
        // Ensure we have valid spell data before setting state
        const validSpells = Array.isArray(allSpells) ? allSpells.map(spell => ({
          ...spell,
          id: spell.id || `spell-${Math.random().toString(36).substring(2, 11)}`,
          // Ensure all required properties have default values
          school: spell.school || 'Universal',
          castingTime: spell.castingTime || '1 action',
          range: spell.range || 'Self',
          components: spell.components || 'V, S',
          duration: spell.duration || 'Instantaneous',
          description: spell.description || '',
          classes: spell.classes || [],
          ritual: Boolean(spell.ritual),
          concentration: Boolean(spell.concentration),
          verbal: Boolean(spell.verbal),
          somatic: Boolean(spell.somatic),
          material: Boolean(spell.material),
          source: spell.source || 'Player\'s Handbook',
        })) : [];
        
        console.log(`Loaded ${validSpells.length} spells`);
        setSpells(validSpells);
        setFilteredSpells(validSpells);
      } catch (error) {
        console.error("Error loading spells:", error);
        // Initialize with empty array to avoid map errors
        setSpells([]);
        setFilteredSpells([]);
      } finally {
        setLoading(false);
      }
    };

    loadSpells();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    if (!spells || !Array.isArray(spells)) {
      setFilteredSpells([]);
      return;
    }
    
    const filtered = spells.filter(spell => {
      const nameMatch = spell.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch;
    });
    
    setFilteredSpells(filtered);
  }, [searchTerm, spells]);

  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
  };

  const handleCloseModal = () => {
    setSelectedSpell(null);
  };

  // Get badge color for spell level
  const getBadgeColor = (level: number): string => {
    const colors = {
      0: '#6b7280',
      1: '#3b82f6',
      2: '#8b5cf6',
      3: '#ec4899', 
      4: '#f97316',
      5: '#ef4444',
      6: '#14b8a6',
      7: '#6366f1',
      8: '#ca8a04',
      9: '#059669'
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  // Get badge color for spell school
  const getSchoolBadgeColor = (school: string): string => {
    const schoolColors = {
      'Evocation': '#ef4444',      // Red
      'Conjuration': '#14b8a6',    // Teal
      'Abjuration': '#3b82f6',     // Blue
      'Transmutation': '#f59e0b',  // Amber
      'Divination': '#8b5cf6',     // Purple
      'Enchantment': '#ec4899',    // Pink
      'Illusion': '#6366f1',       // Indigo
      'Necromancy': '#1f2937',     // Gray
      'Universal': '#6b7280',      // Gray
    };
    return schoolColors[school as keyof typeof schoolColors] || '#6b7280';
  };

  // Format classes for display
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return "—";
    if (typeof classes === 'string') return classes;
    if (Array.isArray(classes)) return classes.join(', ');
    return "—";
  };

  return (
    <Card className="w-full bg-transparent border-0 shadow-none">
      <CardContent className="p-0">
        <div className="mb-6 grid gap-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск заклинаний..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <SpellFilters setFilteredSpells={setFilteredSpells} allSpells={spells || []} />
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'table')}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  {loading ? "Загрузка заклинаний..." : `Найдено заклинаний: ${filteredSpells.length}`}
                </p>
              </div>
              <TabsList>
                <TabsTrigger value="grid">Сетка</TabsTrigger>
                <TabsTrigger value="table">Таблица</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-4">
              <SpellList
                spells={filteredSpells || []}
                getBadgeColor={getBadgeColor}
                getSchoolBadgeColor={getSchoolBadgeColor}
                currentTheme={currentTheme}
                handleOpenSpell={handleOpenSpell}
                formatClasses={formatClasses}
              />
            </TabsContent>

            <TabsContent value="table" className="mt-4">
              <SpellTable
                spells={filteredSpells || []}
                onSpellClick={handleOpenSpell}
                currentTheme={currentTheme}
              />
            </TabsContent>
          </Tabs>
        </div>

        {selectedSpell && (
          <SpellDetailModal
            spell={selectedSpell}
            open={selectedSpell !== null}
            onClose={handleCloseModal}
            currentTheme={currentTheme}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SpellBookViewer;
