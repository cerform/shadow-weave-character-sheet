
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellsPanelProps {
  character: any;
  isDM?: boolean;
}

const SpellsPanel: React.FC<SpellsPanelProps> = ({ character, isDM = false }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const [activeSpellTab, setActiveSpellTab] = useState('cantrips');
  
  // Get character spells
  const spells = character?.spells || [];
  
  // Group spells by level
  const cantrips = spells.filter((spell: string) => spell.toLowerCase().includes('фокус') || spell.toLowerCase().includes('заговор'));
  const level1Spells = spells.filter((spell: string) => !cantrips.includes(spell));

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.textColor }}>
          Заклинания
        </h3>
        
        <Tabs value={activeSpellTab} onValueChange={setActiveSpellTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
            <TabsTrigger value="level1">Уровень 1</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cantrips">
            {cantrips.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground text-sm">
                Заговоры не добавлены
              </div>
            ) : (
              <div className="space-y-1">
                {cantrips.map((spell: string, index: number) => (
                  <div key={index} className="p-2 bg-secondary/50 rounded-md">
                    <span>{spell}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="level1">
            {level1Spells.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground text-sm">
                Заклинания не добавлены
              </div>
            ) : (
              <div className="space-y-1">
                {level1Spells.map((spell: string, index: number) => (
                  <div key={index} className="p-2 bg-secondary/50 rounded-md">
                    <span>{spell}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SpellsPanel;
