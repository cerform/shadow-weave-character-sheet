import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SpellDialog from './SpellDialog';
import { normalizeSpells, convertToSpellData } from '@/utils/spellHelpers';
import { Book, CheckCircle, Circle } from 'lucide-react';

interface SpellPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  selectedSpell?: SpellData | null;
  onSelectSpell?: (spell: SpellData | null) => void;
}

const SpellPanel: React.FC<SpellPanelProps> = ({
  character,
  onUpdate,
  selectedSpell,
  onSelectSpell
}) => {
  const [isSpellDialogOpen, setIsSpellDialogOpen] = useState(false);
  const [currentSpell, setCurrentSpell] = useState<SpellData | null>(null);
  const { toast } = useToast();

  // Get normalized character spells
  const characterSpells = React.useMemo(() => {
    if (!character.spells) return [];
    return normalizeSpells(character.spells);
  }, [character.spells]);

  // Group spells by level
  const spellsByLevel = React.useMemo(() => {
    const grouped: Record<number, CharacterSpell[]> = {};
    
    characterSpells.forEach(spell => {
      const level = spell.level || 0;
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push(spell);
    });
    
    return grouped;
  }, [characterSpells]);

  // Handler for opening spell details
  const handleOpenSpell = (spell: CharacterSpell) => {
    // Convert to SpellData format if needed
    const spellData = convertToSpellData(spell); // Исправляем вызов функции, чтобы она принимала один объект заклинания
    
    // Set the current spell and open dialog
    setCurrentSpell(spellData);
    setIsSpellDialogOpen(true);
    
    // Call the onSelectSpell prop if provided
    if (onSelectSpell) {
      onSelectSpell(spellData);
    }
  };

  // Handler for toggling prepared status
  const handleTogglePrepared = (spell: CharacterSpell) => {
    if (!character.spells) return;
    
    const updatedSpells = character.spells.map(s => {
      if (typeof s === 'string') return s; // Keep strings as is
      
      if (s.name === spell.name) {
        // Toggle prepared status
        return {
          ...s,
          prepared: !s.prepared
        };
      }
      
      return s;
    });
    
    // Update character
    onUpdate({ spells: updatedSpells });
    
    // Show toast message
    toast({
      title: spell.prepared ? "Заклинание не подготовлено" : "Заклинание подготовлено",
      description: `${spell.name} ${spell.prepared ? "убрано из" : "добавлено в"} список подготовленных`,
    });
  };

  // Handler for closing spell dialog
  const handleCloseSpellDialog = () => {
    setIsSpellDialogOpen(false);
    if (onSelectSpell) {
      onSelectSpell(null);
    }
  };

  // Utility function to get badge color based on spell level
  const getSpellLevelColor = (level: number) => {
    const colors = [
      '#9e9e9e', // Level 0 (cantrips)
      '#4caf50', // Level 1
      '#2196f3', // Level 2
      '#ff9800', // Level 3
      '#9c27b0', // Level 4
      '#f44336', // Level 5
      '#795548', // Level 6
      '#607d8b', // Level 7
      '#ff5722', // Level 8
      '#e91e63', // Level 9
    ];
    return colors[Math.min(level, 9)];
  };

  return (
    <div>
      {Object.entries(spellsByLevel).sort(([a, b]) => Number(a) - Number(b)).map(([level, spells]) => (
        <Card key={`spell-level-${level}`} className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {parseInt(level) === 0 ? "Заговоры" : `Заклинания ${level} уровня`}
              </h3>
              <Badge variant="outline">
                {spells.length} {spells.length === 1 ? "заклинание" : "заклинаний"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {spells.map((spell, idx) => (
                <div 
                  key={`spell-${spell.name}-${idx}`}
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-background/10 cursor-pointer"
                  style={{ borderColor: spell.prepared ? getSpellLevelColor(parseInt(level)) : 'inherit' }}
                >
                  <span 
                    className="truncate flex-1"
                    onClick={() => handleOpenSpell(spell)}
                  >
                    {spell.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenSpell(spell)}
                    >
                      <Book className="h-4 w-4" />
                    </Button>
                    
                    {parseInt(level) > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTogglePrepared(spell)}
                      >
                        {spell.prepared ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {spells.length === 0 && (
                <div className="col-span-2 text-center py-4 text-muted-foreground">
                  Нет доступных заклинаний этого уровня
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Dialog for spell details */}
      {currentSpell && (
        <SpellDialog 
          spell={currentSpell} 
          open={isSpellDialogOpen} 
          onClose={handleCloseSpellDialog}
        />
      )}
    </div>
  );
};

export default SpellPanel;
