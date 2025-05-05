import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Character } from '@/types/character.d';
import { useToast } from '@/hooks/use-toast';
import { Edit, ShieldCheck, Flame } from 'lucide-react';

interface ResourcePanelProps {
  character: Character | null;
  onUpdate: (updates: Partial<Character>) => void;
  isDM?: boolean;
}

const ResourcePanel = ({ character, onUpdate, isDM }: ResourcePanelProps) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { toast } = useToast();
  
  const handleHpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!character) return;
    
    const newHp = parseInt(event.target.value);
    
    if (isNaN(newHp)) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректное число.",
      });
      return;
    }
    
    onUpdate({ currentHp: newHp });
  };
  
  const handleTempHpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!character) return;
    
    const newTempHp = parseInt(event.target.value);
    
    if (isNaN(newTempHp)) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректное число.",
      });
      return;
    }
    
    onUpdate({ temporaryHp: newTempHp });
  };
  
  const handleInspirationToggle = () => {
    if (!character) return;
    onUpdate({ inspiration: !character.inspiration });
  };
  
  return (
    <Card className={`bg-card/30 backdrop-blur-sm border-primary/20 theme-${theme}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <ShieldCheck className="h-5 w-5 mr-2 text-green-400" />
          Ресурсы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-1/2">
              <Label htmlFor="currentHp" className="text-sm">
                Текущее здоровье
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  id="currentHp"
                  value={character?.currentHp || 0}
                  onChange={handleHpChange}
                  disabled={!isDM}
                  className="pr-8"
                />
                {isDM && (
                  <Edit className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
            
            <div className="w-1/2">
              <Label htmlFor="temporaryHp" className="text-sm">
                Временное здоровье
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  id="temporaryHp"
                  value={character?.temporaryHp || 0}
                  onChange={handleTempHpChange}
                  disabled={!isDM}
                  className="pr-8"
                />
                {isDM && (
                  <Edit className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
          
          <Label className="text-sm">
            Прогресс здоровья
          </Label>
          <Progress 
            value={((character?.currentHp || 0) / (character?.maxHp || 1)) * 100} 
            className="h-2 mt-1"
          />
          
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              Вдохновение
            </Label>
            <Button 
              variant={character?.inspiration ? "default" : "outline"}
              onClick={handleInspirationToggle}
            >
              <Flame className="h-4 w-4 mr-2" />
              {character?.inspiration ? "Есть" : "Нет"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcePanel;
