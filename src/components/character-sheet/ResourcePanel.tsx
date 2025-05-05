import React, { useState } from 'react';
// Import the necessary icons from lucide-react
import { Heart, Shield, Minus, Plus, Skull } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Character } from '@/types/character';

interface ResourcePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ character, onUpdate }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const handleHPChange = (newHP: number) => {
    if (newHP >= 0 && newHP <= (character.maxHp || 1)) {
      onUpdate({ currentHp: newHP });
    }
  };
  
  const handleTempHPChange = (newTempHP: number) => {
    onUpdate({ temporaryHp: newTempHP });
  };
  
  const handleDeathSaveSuccess = () => {
    const successes = character.deathSaves?.successes || 0;
    if (successes < 3) {
      onUpdate({ deathSaves: { ...character.deathSaves, successes: successes + 1 } });
    }
  };
  
  const handleDeathSaveFailure = () => {
    const failures = character.deathSaves?.failures || 0;
    if (failures < 3) {
      onUpdate({ deathSaves: { ...character.deathSaves, failures: failures + 1 } });
    }
  };
  
  const handleResetDeathSaves = () => {
    onUpdate({ deathSaves: { successes: 0, failures: 0 } });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle style={{ color: currentTheme.textColor }}>Ресурсы</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Hit Points */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" style={{ color: currentTheme.textColor }} />
              <Label htmlFor="current-hp" style={{ color: currentTheme.textColor }}>Здоровье</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                id="current-hp"
                placeholder="Текущее"
                value={character.currentHp || 0}
                onChange={(e) => handleHPChange(parseInt(e.target.value))}
                className="w-24 text-center bg-black/60 text-white"
              />
              <span style={{ color: currentTheme.textColor }}>/</span>
              <span style={{ color: currentTheme.textColor }}>{character.maxHp || 1}</span>
            </div>
            <Progress value={((character.currentHp || 0) / (character.maxHp || 1)) * 100} style={{ backgroundColor: `${currentTheme.accent}40` }} />
          </div>
          
          {/* Temporary Hit Points */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" style={{ color: currentTheme.textColor }} />
              <Label htmlFor="temporary-hp" style={{ color: currentTheme.textColor }}>Временное здоровье</Label>
            </div>
            <Input
              type="number"
              id="temporary-hp"
              placeholder="Временное"
              value={character.temporaryHp || 0}
              onChange={(e) => handleTempHPChange(parseInt(e.target.value))}
              className="w-24 text-center bg-black/60 text-white"
            />
          </div>
          
          {/* Death Saves */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Skull className="h-4 w-4" style={{ color: currentTheme.textColor }} />
              <Label style={{ color: currentTheme.textColor }}>Спасброски от смерти</Label>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <Label style={{ color: currentTheme.textColor }}>Успехи:</Label>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={handleDeathSaveSuccess}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span style={{ color: currentTheme.textColor }}>{character.deathSaves?.successes || 0}</span>
                </div>
              </div>
              <div>
                <Label style={{ color: currentTheme.textColor }}>Провалы:</Label>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={handleDeathSaveFailure}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span style={{ color: currentTheme.textColor }}>{character.deathSaves?.failures || 0}</span>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleResetDeathSaves}>
                Сбросить
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcePanel;
