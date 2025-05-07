
import React, { useState } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import SpellDialog from './SpellDialog'; // Correct import

export interface SpellPanelProps {
  character: Character;
  spells: (string | CharacterSpell)[];
  onUpdate: (newSpells: any) => void;
  level: number;
}

const SpellPanel: React.FC<SpellPanelProps> = ({ character, spells, onUpdate, level }) => {
  const [openSpellId, setOpenSpellId] = useState<string | null>(null);
  
  const handleRemoveSpell = (spellId: string) => {
    const updatedSpells = spells.filter(spell => {
      if (typeof spell === 'string') {
        return spell !== spellId;
      }
      return spell.id !== spellId;
    });
    
    onUpdate(updatedSpells);
  };
  
  const handleOpenSpell = (spellId: string) => {
    setOpenSpellId(spellId);
  };
  
  const handleCloseDialog = () => {
    setOpenSpellId(null);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {level === 0 ? 'Заговоры' : `Заклинания ${level} уровня`}
          <Badge variant="outline" className="ml-2">{spells.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {spells.length > 0 ? (
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {spells.map((spell, index) => {
                const spellId = typeof spell === 'string' ? spell : spell.id || '';
                const spellName = typeof spell === 'string' ? spell : spell.name || spellId;
                
                return (
                  <div key={spellId || index} className="flex items-center justify-between p-2 rounded-md bg-secondary/10">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleOpenSpell(spellId.toString())}
                      className="flex-1 justify-start px-2 hover:bg-transparent hover:underline"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span className="truncate">{spellName}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSpell(spellId.toString())}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            {level === 0 ? 'Нет заговоров' : 'Нет заклинаний этого уровня'}
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div className="flex justify-center">
          <Button variant="outline" className="w-full" onClick={() => {/* Здесь добавление заклинаний */}}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить {level === 0 ? 'заговор' : 'заклинание'}
          </Button>
        </div>
      </CardContent>
      
      {/* Диалог для отображения деталей заклинания */}
      {openSpellId && (
        <SpellDialog 
          open={!!openSpellId}
          onOpenChange={handleCloseDialog}
          spell={{
            id: openSpellId,
            name: spells.find(s => 
              (typeof s === 'string' ? s : s.id) === openSpellId
            ) ? 
              (typeof spells.find(s => 
                (typeof s === 'string' ? s : s.id) === openSpellId
              ) === 'string' ? 
                openSpellId : 
                (spells.find(s => 
                  (typeof s === 'string' ? s : s.id) === openSpellId
                ) as CharacterSpell).name || ''
              ) : '',
            level: level,
            school: '',
            castingTime: '',
            range: '',
            components: '',
            duration: '',
            description: '',
          }}
          character={character}
        />
      )}
    </Card>
  );
};

export default SpellPanel;
