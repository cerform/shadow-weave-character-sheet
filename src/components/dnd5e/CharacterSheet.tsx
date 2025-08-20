// src/components/dnd5e/CharacterSheet.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { Character, AbilityScore } from '@/types/dnd5e';
import { getModifier } from '@/systems/dnd5e/abilities';

interface CharacterSheetProps {
  character: Character;
}

const abilityNames: Record<AbilityScore, string> = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма'
};

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ character }) => {
  const hpPercentage = (character.hitPoints / character.maxHitPoints) * 100;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {character.name}
          <Badge variant="outline">Уровень {character.level}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Здоровье */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Здоровье</span>
            <span>{character.hitPoints}/{character.maxHitPoints}</span>
          </div>
          <Progress value={hpPercentage} className="h-3" />
        </div>

        {/* Основные характеристики */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Класс Брони</span>
            <Badge>{character.armorClass}</Badge>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Скорость</span>
            <Badge variant="outline">{character.speed} фт.</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Бонус мастерства</span>
            <Badge variant="outline">+{character.proficiencyBonus}</Badge>
          </div>
        </div>

        <Separator />

        {/* Характеристики */}
        <div>
          <h4 className="font-medium mb-3">Характеристики</h4>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(character.abilities) as AbilityScore[]).map(ability => {
              const score = character.abilities[ability];
              const modifier = getModifier(character.abilities, ability);
              
              return (
                <div key={ability} className="text-center p-2 border rounded">
                  <div className="text-xs text-muted-foreground mb-1">
                    {abilityNames[ability]}
                  </div>
                  <div className="font-bold text-lg">{score}</div>
                  <div className="text-sm text-muted-foreground">
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Условия */}
        {character.conditions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Условия</h4>
            <div className="flex flex-wrap gap-1">
              {character.conditions.map((condition, index) => (
                <Badge key={index} variant="destructive">
                  {condition.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Ресурсы (если бой активен) */}
        {character.resources && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Ресурсы хода</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Действие</span>
                  <Badge variant={character.resources.actionUsed ? 'destructive' : 'secondary'}>
                    {character.resources.actionUsed ? 'Использовано' : 'Доступно'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Бонусное действие</span>
                  <Badge variant={character.resources.bonusActionUsed ? 'destructive' : 'secondary'}>
                    {character.resources.bonusActionUsed ? 'Использовано' : 'Доступно'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Реакция</span>
                  <Badge variant={character.resources.reactionUsed ? 'destructive' : 'secondary'}>
                    {character.resources.reactionUsed ? 'Использована' : 'Доступна'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Движение</span>
                  <Badge variant="outline">
                    {character.resources.movement}/{character.speed} фт.
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};