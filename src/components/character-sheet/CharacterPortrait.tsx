import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Character } from '@/types/character';
import { 
  Crown, 
  Star, 
  Shield, 
  Zap,
  Edit3
} from 'lucide-react';

interface CharacterPortraitProps {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({ 
  character, 
  onUpdate 
}) => {
  const getClassIcon = (className: string) => {
    const icons: Record<string, typeof Crown> = {
      'Паладин': Crown,
      'Клирик': Star,
      'Воин': Shield,
      'Маг': Zap,
      'Колдун': Zap,
      'Волшебник': Zap,
      'Чародей': Zap,
    };
    return icons[className] || Shield;
  };

  const ClassIcon = getClassIcon(character.class || '');

  const getRarityColor = (level: number) => {
    if (level >= 17) return 'hsl(var(--rpg-legendary))'; // Legendary (Orange)
    if (level >= 11) return 'hsl(var(--rpg-epic))'; // Epic (Purple) 
    if (level >= 5) return 'hsl(var(--rpg-rare))'; // Rare (Blue)
    return 'hsl(var(--primary))'; // Common (Default)
  };

  const level = character.level || 1;
  const rarityColor = getRarityColor(level);

  return (
    <Card className="rpg-panel-elevated p-6">
      <div className="flex items-center space-x-4">
        {/* Character Avatar */}
        <div className="relative">
          <Avatar className="character-portrait h-20 w-20">
            <AvatarImage 
              src={`/character-portraits/${character.race?.toLowerCase()}-${character.class?.toLowerCase()}.jpg`} 
              alt={character.name}
            />
            <AvatarFallback className="font-fantasy-header text-2xl">
              {character.name?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          
          {/* Level Badge */}
          <Badge 
            className="absolute -bottom-2 -right-2 font-fantasy-header font-bold px-2 py-1"
            style={{ 
              backgroundColor: `${rarityColor}20`,
              color: rarityColor,
              border: `2px solid ${rarityColor}`,
              boxShadow: `0 0 10px ${rarityColor}60`
            }}
          >
            {level}
          </Badge>
        </div>

        {/* Character Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-fantasy-title text-2xl text-glow">
              {character.name || 'Безымянный герой'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-primary"
              onClick={() => {
                const newName = prompt('Введите новое имя персонажа:', character.name);
                if (newName && onUpdate) {
                  onUpdate({ name: newName });
                }
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <ClassIcon className="h-4 w-4 text-primary" />
            <span className="font-fantasy-header text-lg">
              {character.race} {character.class}
            </span>
            {character.subrace && (
              <Badge variant="outline" className="text-xs">
                {character.subrace}
              </Badge>
            )}
          </div>
          
          {character.background && (
            <div className="text-sm text-muted-foreground font-fantasy-body">
              📜 {character.background}
            </div>
          )}

          {/* XP Progress Bar (if applicable) */}
          {character.experience !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Опыт</span>
                <span>{character.experience} XP</span>
              </div>
              <div className="resource-bar h-2">
                <div 
                  className="resource-bar-fill h-full transition-all duration-500"
                  style={{ 
                    width: '65%', // Можно вычислить на основе XP
                    background: `linear-gradient(90deg, ${rarityColor}, ${rarityColor}80)`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};