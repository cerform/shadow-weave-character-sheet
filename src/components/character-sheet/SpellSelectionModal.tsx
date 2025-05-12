
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SpellData } from '@/types/spells';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';
import SpellDetailModal from '../spell-detail/SpellDetailModal';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { canPrepareMoreSpells, getPreparedSpellsLimit } from '@/utils/spellHelpers';

interface SpellSelectionModalProps {
  open: boolean;
  onClose: () => void;
  spells: SpellData[];
  character: Character;
  onAddSpell: (spell: SpellData) => void;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  open,
  onClose,
  spells,
  character,
  onAddSpell
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Filter spells based on search term
  useEffect(() => {
    if (!spells) {
      setFilteredSpells([]);
      return;
    }

    if (!searchTerm) {
      setFilteredSpells(spells);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = spells.filter(spell => {
      // Safely access string properties and convert them to lowercase for comparison
      const nameMatches = spell.name && typeof spell.name === 'string' ? 
        spell.name.toLowerCase().includes(searchTermLower) : false;
      
      const schoolMatches = spell.school && typeof spell.school === 'string' ? 
        spell.school.toLowerCase().includes(searchTermLower) : false;
      
      let descMatches = false;
      if (spell.description) {
        if (typeof spell.description === 'string') {
          descMatches = spell.description.toLowerCase().includes(searchTermLower);
        } else if (Array.isArray(spell.description)) {
          descMatches = spell.description.some(desc => 
            typeof desc === 'string' && desc.toLowerCase().includes(searchTermLower)
          );
        }
      }
      
      return nameMatches || schoolMatches || descMatches;
    });

    setFilteredSpells(filtered);
  }, [searchTerm, spells]);

  const handleSpellClick = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsDetailOpen(true);
  };

  const handleAddSpell = (spell: SpellData) => {
    if (canAddSpell(spell)) {
      onAddSpell(spell);
      toast({
        title: "Заклинание добавлено",
        description: `${spell.name} добавлено в список известных заклинаний.`
      });
      // Close the modal
      setIsDetailOpen(false);
    } else {
      toast({
        title: "Невозможно добавить заклинание",
        description: "Вы достигли максимального количества подготовленных заклинаний.",
        variant: "destructive"
      });
    }
  };

  const canAddSpell = (spell: SpellData) => {
    // Check if character can prepare more spells
    return canPrepareMoreSpells(character);
  };

  // Check if a spell is already known to the character
  const isSpellKnown = (spell: SpellData): boolean => {
    if (!character.spells) return false;
    
    return character.spells.some(s => {
      if (typeof s === 'string') {
        return s === spell.name;
      }
      return s.name === spell.name || s.id === spell.id;
    });
  };

  // Format for display
  const formatSpellLevel = (level: number): string => {
    return level === 0 ? "Заговор" : `${level}-й уровень`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]"
          style={{
            backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.8)',
            color: currentTheme.textColor || 'white',
            borderColor: currentTheme.accent
          }}
        >
          <DialogHeader>
            <DialogTitle>Выбор заклинаний</DialogTitle>
          </DialogHeader>

          <div className="flex items-center relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск заклинаний..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="font-medium mb-2">
            Лимит подготовленных заклинаний: {getPreparedSpellsLimit(character)}
          </div>

          <ScrollArea className="h-[50vh]">
            <div className="space-y-2">
              {filteredSpells.length > 0 ? (
                filteredSpells.map((spell) => {
                  const isKnown = isSpellKnown(spell);
                  
                  return (
                    <div
                      key={spell.id || spell.name}
                      className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-black/20"
                      onClick={() => handleSpellClick(spell)}
                      style={{ borderColor: currentTheme.accent + '40' }}
                    >
                      <div>
                        <div className="font-medium">{spell.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {spell.school}, {formatSpellLevel(spell.level)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {isKnown ? (
                          <Badge style={{ backgroundColor: '#6b7280' }}>
                            Уже изучено
                          </Badge>
                        ) : (
                          <Badge 
                            className="cursor-pointer"
                            style={{ backgroundColor: currentTheme.accent }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSpell(spell);
                            }}
                          >
                            Добавить
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Заклинания не найдены. Попробуйте изменить запрос.' : 'Загрузка заклинаний...'}
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={onClose}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedSpell && (
        <SpellDetailModal
          spell={selectedSpell}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          currentTheme={currentTheme}
          showAddButton={true}
          onAddSpell={handleAddSpell}
          alreadyAdded={isSpellKnown(selectedSpell)}
        />
      )}
    </>
  );
};

export default SpellSelectionModal;
