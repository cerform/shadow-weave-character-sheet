
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, MinusCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpellsPanelProps {
  character: any;
  isDM: boolean;
}

const SpellsPanel: React.FC<SpellsPanelProps> = ({ character, isDM }) => {
  const [newSpell, setNewSpell] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('0');
  const { toast } = useToast();

  const spells = character?.spells || [];

  // Группировка заклинаний по уровням (упрощенная реализация)
  const spellsByLevel = {
    '0': spells.filter((spell: string) => spell.includes('(заговор)')),
    '1': spells.filter((spell: string) => spell.includes('(1 уровень)')),
    '2': spells.filter((spell: string) => spell.includes('(2 уровень)')),
    '3': spells.filter((spell: string) => spell.includes('(3 уровень)')),
    '4': spells.filter((spell: string) => spell.includes('(4 уровень)')),
    '5': spells.filter((spell: string) => spell.includes('(5 уровень)')),
    '6': spells.filter((spell: string) => spell.includes('(6 уровень)')),
    '7': spells.filter((spell: string) => spell.includes('(7 уровень)')),
    '8': spells.filter((spell: string) => spell.includes('(8 уровень)')),
    '9': spells.filter((spell: string) => spell.includes('(9 уровень)')),
  };

  const handleAddSpell = () => {
    if (!newSpell.trim()) {
      toast({
        title: 'Поле не может быть пустым',
        variant: 'destructive',
      });
      return;
    }

    // В реальном приложении здесь должен быть код для сохранения нового заклинания
    toast({
      title: 'Заклинание добавлено',
      description: 'Новое заклинание успешно добавлено',
    });

    setNewSpell('');
  };

  const handleRemoveSpell = (spell: string) => {
    // В реальном приложении здесь должен быть код для удаления заклинания
    toast({
      title: 'Заклинание удалено',
      variant: 'destructive',
    });
  };

  const getLevelName = (level: string) => {
    if (level === '0') return 'Заговоры';
    return `Уровень ${level}`;
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Заклинания
        </h3>

        <Tabs defaultValue="0" onValueChange={setSelectedLevel}>
          <TabsList className="mb-4">
            {Object.keys(spellsByLevel).map((level) => (
              <TabsTrigger key={level} value={level}>
                {getLevelName(level)}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(spellsByLevel).map(([level, levelSpells]) => (
            <TabsContent key={level} value={level} className="space-y-2">
              {(levelSpells as string[]).length === 0 ? (
                <p className="text-muted-foreground italic">Нет заклинаний {level === '0' ? 'заговоров' : `${level} уровня`}.</p>
              ) : (
                <div className="space-y-2">
                  {(levelSpells as string[]).map((spell, index) => (
                    <div key={index} className="p-3 bg-primary/5 rounded-md flex justify-between items-start">
                      <div>
                        <p>{spell.split('(')[0].trim()}</p>
                      </div>
                      {isDM && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveSpell(spell)}
                          className="h-7 w-7 p-0"
                        >
                          <MinusCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isDM && (
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder={`Добавить ${level === '0' ? 'заговор' : `заклинание ${level} уровня`}`}
                    value={newSpell}
                    onChange={(e) => setNewSpell(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSpell()}
                  />
                  <Button onClick={handleAddSpell}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SpellsPanel;
