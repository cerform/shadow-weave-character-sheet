// src/components/bestiary/MonsterDetailsDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Monster } from '@/types/monsters';
import { getModifier } from '@/systems/dnd5e/abilities';
import { Heart, Shield, Zap, Eye, Users, Plus, Crown } from 'lucide-react';

interface MonsterDetailsDialogProps {
  monster: Monster;
  isOpen: boolean;
  onClose: () => void;
  onAddToMap?: (monster: Monster) => void;
}

export const MonsterDetailsDialog: React.FC<MonsterDetailsDialogProps> = ({
  monster,
  isOpen,
  onClose,
  onAddToMap
}) => {
  const getSizeColor = (size: string) => {
    switch (size) {
      case 'Крошечный': return 'bg-blue-100 text-blue-800';
      case 'Маленький': return 'bg-green-100 text-green-800';
      case 'Средний': return 'bg-yellow-100 text-yellow-800';
      case 'Большой': return 'bg-orange-100 text-orange-800';
      case 'Огромный': return 'bg-red-100 text-red-800';
      case 'Гигантский': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSpeed = (speed: Monster['speed']) => {
    const parts = [];
    if (speed.walk) parts.push(`${speed.walk} фт.`);
    if (speed.fly) parts.push(`полёт ${speed.fly} фт.`);
    if (speed.swim) parts.push(`плавание ${speed.swim} фт.`);
    if (speed.climb) parts.push(`лазание ${speed.climb} фт.`);
    if (speed.burrow) parts.push(`копание ${speed.burrow} фт.`);
    return parts.join(', ');
  };

  const formatSenses = (senses: Monster['senses']) => {
    const parts = [];
    if (senses.blindsight) parts.push(`слепое зрение ${senses.blindsight} фт.`);
    if (senses.darkvision) parts.push(`тёмное зрение ${senses.darkvision} фт.`);
    if (senses.tremorsense) parts.push(`чувство вибрации ${senses.tremorsense} фт.`);
    if (senses.truesight) parts.push(`истинное зрение ${senses.truesight} фт.`);
    parts.push(`пассивное Внимательность ${senses.passivePerception}`);
    return parts.join(', ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">{monster.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">
                {monster.size} {monster.type}, {monster.alignment}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={getSizeColor(monster.size)} variant="secondary">
                {monster.size}
              </Badge>
              <Badge variant="outline">
                <Crown className="w-3 h-3 mr-1" />
                CR {monster.challengeRating}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Основные характеристики */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">Класс Доспеха</div>
                  <div className="text-lg">{monster.armorClass}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <div className="font-medium">Хит-поинты</div>
                  <div className="text-lg">{monster.hitPoints} ({monster.hitDice})</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium">Скорость</div>
                  <div className="text-sm">{formatSpeed(monster.speed)}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Характеристики */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Характеристики</h3>
              <div className="grid grid-cols-6 gap-4">
                {Object.entries(monster.abilities).map(([ability, score]) => {
                  const modifier = getModifier({ ...monster.abilities }, ability as any);
                  const abilityNames = {
                    strength: 'СИЛА',
                    dexterity: 'ЛОВКОСТЬ',
                    constitution: 'ТЕЛОСЛОЖЕНИЕ',
                    intelligence: 'ИНТЕЛЛЕКТ',
                    wisdom: 'МУДРОСТЬ',
                    charisma: 'ХАРИЗМА'
                  };
                  
                  return (
                    <div key={ability} className="text-center p-3 border rounded">
                      <div className="font-medium text-sm">
                        {abilityNames[ability as keyof typeof abilityNames]}
                      </div>
                      <div className="text-xl font-bold">{score}</div>
                      <div className="text-sm text-muted-foreground">
                        ({modifier >= 0 ? '+' : ''}{modifier})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Дополнительные характеристики */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Спасброски */}
              {monster.savingThrows && Object.keys(monster.savingThrows).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Спасительные броски</h4>
                  <div className="text-sm">
                    {Object.entries(monster.savingThrows).map(([ability, bonus]) => (
                      <span key={ability} className="mr-3">
                        {ability.charAt(0).toUpperCase() + ability.slice(1)} +{bonus}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Навыки */}
              {monster.skills && Object.keys(monster.skills).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Навыки</h4>
                  <div className="text-sm">
                    {Object.entries(monster.skills).map(([skill, bonus]) => (
                      <span key={skill} className="mr-3">
                        {skill.charAt(0).toUpperCase() + skill.slice(1)} +{bonus}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Сопротивления урону */}
              {monster.damageResistances && monster.damageResistances.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Сопротивление урону</h4>
                  <div className="text-sm">{monster.damageResistances.join(', ')}</div>
                </div>
              )}

              {/* Иммунитеты к урону */}
              {monster.damageImmunities && monster.damageImmunities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Иммунитет к урону</h4>
                  <div className="text-sm">{monster.damageImmunities.join(', ')}</div>
                </div>
              )}

              {/* Иммунитеты к состояниям */}
              {monster.conditionImmunities && monster.conditionImmunities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Иммунитет к состояниям</h4>
                  <div className="text-sm">{monster.conditionImmunities.join(', ')}</div>
                </div>
              )}

              {/* Чувства */}
              <div>
                <h4 className="font-medium mb-2">Чувства</h4>
                <div className="text-sm">{formatSenses(monster.senses)}</div>
              </div>

              {/* Языки */}
              <div>
                <h4 className="font-medium mb-2">Языки</h4>
                <div className="text-sm">
                  {monster.languages.length > 0 ? monster.languages.join(', ') : '—'}
                </div>
              </div>

              {/* Уровень опасности и опыт */}
              <div>
                <h4 className="font-medium mb-2">Уровень опасности</h4>
                <div className="text-sm">
                  {monster.challengeRating} ({monster.experiencePoints} опыта)
                </div>
              </div>
            </div>

            <Separator />

            {/* Особые способности */}
            {monster.traits && monster.traits.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Особые способности</h3>
                <div className="space-y-3">
                  {monster.traits.map((trait, index) => (
                    <div key={index}>
                      <h4 className="font-medium">{trait.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {trait.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Действия */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Действия</h3>
              <div className="space-y-3">
                {monster.actions.map((action, index) => (
                  <div key={index}>
                    <h4 className="font-medium">{action.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Легендарные действия */}
            {monster.legendaryActions && monster.legendaryActions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Легендарные действия</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {monster.name} может совершить {monster.legendaryActionsPerTurn || 3} легендарных действия, 
                  выбирая из представленных ниже вариантов. За раз можно использовать только одно 
                  легендарное действие, и только в конце хода другого существа. {monster.name} 
                  восстанавливает потраченные легендарные действия в начале своего хода.
                </p>
                <div className="space-y-3">
                  {monster.legendaryActions.map((action, index) => (
                    <div key={index}>
                      <h4 className="font-medium">
                        {action.name} {action.cost > 1 && `(${action.cost} действия)`}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Среда обитания */}
            {monster.environment && monster.environment.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Среда обитания</h3>
                <div className="flex flex-wrap gap-2">
                  {monster.environment.map((env, index) => (
                    <Badge key={index} variant="outline">
                      {env}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Действия */}
        {onAddToMap && (
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => onAddToMap(monster)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить на карту
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};