// src/components/bestiary/MonsterCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ModelViewer from '../assets/ModelViewer';
import type { Monster } from '@/types/monsters';
import { getModifier } from '@/systems/dnd5e/abilities';
import { 
  Heart, 
  Shield, 
  Zap, 
  Eye, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Box, 
  Image 
} from 'lucide-react';

interface MonsterCardProps {
  monster: Monster;
  onAddToMap?: (monster: Monster) => void;
  onViewDetails?: (monster: Monster) => void;
  showActions?: boolean;
}

export const MonsterCard: React.FC<MonsterCardProps> = ({ 
  monster, 
  onAddToMap, 
  onViewDetails, 
  showActions = true 
}) => {
  const [isModelExpanded, setIsModelExpanded] = useState(false);

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

  const getCRColor = (cr: string) => {
    const numCR = parseFloat(cr) || 0;
    if (numCR === 0) return 'bg-gray-100 text-gray-800';
    if (numCR < 1) return 'bg-green-100 text-green-800';
    if (numCR < 5) return 'bg-yellow-100 text-yellow-800';
    if (numCR < 10) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const hasModel = Boolean(monster.modelUrl);
  const hasIcon = Boolean(monster.iconUrl);

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{monster.name}</CardTitle>
          <div className="flex gap-1">
            {hasModel && (
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center mr-1">
                <Box className="w-3 h-3 text-primary" />
              </div>
            )}
            {hasIcon && (
              <div className="w-6 h-6 rounded bg-secondary/10 flex items-center justify-center mr-1">
                <Image className="w-3 h-3 text-secondary" />
              </div>
            )}
            <Badge className={getSizeColor(monster.size)} variant="secondary">
              {monster.size}
            </Badge>
            <Badge className={getCRColor(monster.challengeRating)} variant="secondary">
              CR {monster.challengeRating}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {monster.type}, {monster.alignment}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Основные характеристики */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-medium">AC {monster.armorClass}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="font-medium">{monster.hitPoints} HP</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{monster.speed.walk || 0} фт.</span>
          </div>
        </div>

        {/* 3D модель */}
        {hasModel && (
          <>
            <Separator />
            <Collapsible open={isModelExpanded} onOpenChange={setIsModelExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between" size="sm">
                  <span className="flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    3D Модель
                  </span>
                  {isModelExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <ModelViewer 
                  modelUrl={monster.modelUrl!}
                  modelName={monster.name}
                  height={180}
                />
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        <Separator />

        {/* Характеристики */}
        <div className="grid grid-cols-6 gap-1 text-xs">
          {Object.entries(monster.abilities).map(([ability, score]) => {
            const modifier = getModifier({ ...monster.abilities }, ability as any);
            const abilityNames = {
              strength: 'СИЛ',
              dexterity: 'ЛОВ',
              constitution: 'ТЕЛ',
              intelligence: 'ИНТ',
              wisdom: 'МДР',
              charisma: 'ХАР'
            };
            
            return (
              <div key={ability} className="text-center p-1 border rounded">
                <div className="font-medium">{abilityNames[ability as keyof typeof abilityNames]}</div>
                <div className="text-xs">{score}</div>
                <div className="text-xs text-muted-foreground">
                  {modifier >= 0 ? '+' : ''}{modifier}
                </div>
              </div>
            );
          })}
        </div>

        {/* Особые способности */}
        {monster.traits && monster.traits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Особые способности</h4>
            <div className="space-y-1">
              {monster.traits.slice(0, 2).map((trait, index) => (
                <div key={index} className="text-xs">
                  <span className="font-medium">{trait.name}:</span>{' '}
                  <span className="text-muted-foreground">
                    {trait.description.length > 80 
                      ? `${trait.description.substring(0, 80)}...` 
                      : trait.description
                    }
                  </span>
                </div>
              ))}
              {monster.traits.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  и ещё {monster.traits.length - 2} способность(ей)...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Основные атаки */}
        {monster.actions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Действия</h4>
            <div className="space-y-1">
              {monster.actions.slice(0, 2).map((action, index) => (
                <div key={index} className="text-xs">
                  <span className="font-medium">{action.name}:</span>{' '}
                  {action.attackBonus && (
                    <span className="text-muted-foreground">
                      +{action.attackBonus} к попаданию
                      {action.damage && `, ${action.damage} урона`}
                    </span>
                  )}
                </div>
              ))}
              {monster.actions.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  и ещё {monster.actions.length - 2} действие(й)...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Среда обитания */}
        {monster.environment && monster.environment.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {monster.environment.map((env, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {env}
              </Badge>
            ))}
          </div>
        )}

        {/* Действия */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {onAddToMap && (
              <Button 
                size="sm" 
                onClick={() => onAddToMap(monster)}
                className="flex-1"
              >
                <Plus className="w-3 h-3 mr-1" />
                На карту
              </Button>
            )}
            {onViewDetails && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onViewDetails(monster)}
                className="flex-1"
              >
                <Eye className="w-3 h-3 mr-1" />
                Подробно
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};