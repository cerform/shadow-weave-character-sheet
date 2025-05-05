import React from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, TrendingUp } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const LevelUpPanel = () => {
  const { character, updateCharacter } = useCharacter();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const handleLevelUp = () => {
    if (!character) return;
    
    // Basic level up logic
    const newLevel = character.level ? character.level + 1 : 1;
    
    // Update character with new level
    updateCharacter({
      level: newLevel,
    });
  };

  return (
    <Card className={`bg-card/30 backdrop-blur-sm border-primary/20 theme-${theme}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
          Повышение уровня
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Текущий уровень:</span>
            <Badge variant="secondary">{character?.level || 1}</Badge>
          </div>
          <Button 
            variant="outline"
            className="w-full justify-center"
            onClick={handleLevelUp}
            style={{ backgroundColor: currentTheme.accent }}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Повысить уровень
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelUpPanel;
