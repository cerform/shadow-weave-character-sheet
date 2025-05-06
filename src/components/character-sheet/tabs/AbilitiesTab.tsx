
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { ArrowDown, ArrowUp, Star } from 'lucide-react';

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Получение модификатора характеристики
  const getModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  // Обработчики увеличения/уменьшения характеристик
  const handleIncreaseAbility = (ability: keyof Character) => {
    if (character[ability] && typeof character[ability] === 'number' && character[ability] < 20) {
      onUpdate({ [ability]: character[ability] as number + 1 });
    }
  };

  const handleDecreaseAbility = (ability: keyof Character) => {
    if (character[ability] && typeof character[ability] === 'number' && character[ability] > 1) {
      onUpdate({ [ability]: character[ability] as number - 1 });
    }
  };

  // Расчет бонуса мастерства
  const proficiencyBonus = character.proficiencyBonus || Math.ceil(1 + (character.level / 4));

  // Окраска модификатора
  const getModifierColor = (mod: string): string => {
    if (mod.includes('+')) return 'text-green-500';
    if (mod.includes('-')) return 'text-red-500';
    return '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Характеристики персонажа</h2>
      
      {/* Основные характеристики */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Сила */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-center">Сила (STR)</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold mb-2">{character.strength}</div>
            <Badge 
              variant="outline" 
              className={`text-lg ${getModifierColor(getModifier(character.strength))}`}
            >
              {getModifier(character.strength)}
            </Badge>
            <Progress 
              value={character.strength * 5} 
              className="mt-2" 
              style={{backgroundColor: `${currentTheme.background}`, color: `${currentTheme.accent}`}}
            />
            <div className="flex justify-center mt-2 space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDecreaseAbility('strength')}
                disabled={character.strength <= 1}
              >
                <ArrowDown size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleIncreaseAbility('strength')}
                disabled={character.strength >= 20}
              >
                <ArrowUp size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Ловкость */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-center">Ловкость (DEX)</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold mb-2">{character.dexterity}</div>
            <Badge 
              variant="outline" 
              className={`text-lg ${getModifierColor(getModifier(character.dexterity))}`}
            >
              {getModifier(character.dexterity)}
            </Badge>
            <Progress 
              value={character.dexterity * 5} 
              className="mt-2" 
              style={{backgroundColor: `${currentTheme.background}`, color: `${currentTheme.accent}`}}
            />
            <div className="flex justify-center mt-2 space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDecreaseAbility('dexterity')}
                disabled={character.dexterity <= 1}
              >
                <ArrowDown size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleIncreaseAbility('dexterity')}
                disabled={character.dexterity >= 20}
              >
                <ArrowUp size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Телосложение */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-center">Телосложение (CON)</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold mb-2">{character.constitution}</div>
            <Badge 
              variant="outline" 
              className={`text-lg ${getModifierColor(getModifier(character.constitution))}`}
            >
              {getModifier(character.constitution)}
            </Badge>
            <Progress 
              value={character.constitution * 5} 
              className="mt-2" 
              style={{backgroundColor: `${currentTheme.background}`, color: `${currentTheme.accent}`}}
            />
            <div className="flex justify-center mt-2 space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDecreaseAbility('constitution')}
                disabled={character.constitution <= 1}
              >
                <ArrowDown size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleIncreaseAbility('constitution')}
                disabled={character.constitution >= 20}
              >
                <ArrowUp size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Интеллект */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-center">Интеллект (INT)</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold mb-2">{character.intelligence}</div>
            <Badge 
              variant="outline" 
              className={`text-lg ${getModifierColor(getModifier(character.intelligence))}`}
            >
              {getModifier(character.intelligence)}
            </Badge>
            <Progress 
              value={character.intelligence * 5} 
              className="mt-2" 
              style={{backgroundColor: `${currentTheme.background}`, color: `${currentTheme.accent}`}}
            />
            <div className="flex justify-center mt-2 space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDecreaseAbility('intelligence')}
                disabled={character.intelligence <= 1}
              >
                <ArrowDown size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleIncreaseAbility('intelligence')}
                disabled={character.intelligence >= 20}
              >
                <ArrowUp size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Мудрость */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-center">Мудрость (WIS)</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold mb-2">{character.wisdom}</div>
            <Badge 
              variant="outline" 
              className={`text-lg ${getModifierColor(getModifier(character.wisdom))}`}
            >
              {getModifier(character.wisdom)}
            </Badge>
            <Progress 
              value={character.wisdom * 5} 
              className="mt-2" 
              style={{backgroundColor: `${currentTheme.background}`, color: `${currentTheme.accent}`}}
            />
            <div className="flex justify-center mt-2 space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDecreaseAbility('wisdom')}
                disabled={character.wisdom <= 1}
              >
                <ArrowDown size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleIncreaseAbility('wisdom')}
                disabled={character.wisdom >= 20}
              >
                <ArrowUp size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Харизма */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-center">Харизма (CHA)</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold mb-2">{character.charisma}</div>
            <Badge 
              variant="outline" 
              className={`text-lg ${getModifierColor(getModifier(character.charisma))}`}
            >
              {getModifier(character.charisma)}
            </Badge>
            <Progress 
              value={character.charisma * 5} 
              className="mt-2" 
              style={{backgroundColor: `${currentTheme.background}`, color: `${currentTheme.accent}`}}
            />
            <div className="flex justify-center mt-2 space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDecreaseAbility('charisma')}
                disabled={character.charisma <= 1}
              >
                <ArrowDown size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleIncreaseAbility('charisma')}
                disabled={character.charisma >= 20}
              >
                <ArrowUp size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Дополнительная информация */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Бонус мастерства</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">+{proficiencyBonus}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Класс брони</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{character.armorClass || 10}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Инициатива</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{getModifier(character.dexterity)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Особенности персонажа */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5" />
            Особенности и умения
          </CardTitle>
        </CardHeader>
        <CardContent>
          {character.features && character.features.length > 0 ? (
            <ul className="space-y-2">
              {Array.isArray(character.features) && character.features.map((feature, index) => (
                <li key={index} className="border-b border-gray-700 pb-2">
                  {typeof feature === 'string' ? feature : feature.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Нет особенностей</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AbilitiesTab;
