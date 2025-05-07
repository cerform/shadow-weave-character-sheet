
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { Character, RaceDetails } from '@/types/character';
import { AbilityName, abilityNames } from '@/utils/abilityUtils';

interface AbilityBonusSelectorProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  raceDetails?: RaceDetails;
  abilityBonuses?: {
    amount: number;
    options?: string[];
    fixed?: Record<string, number>;
  };
}

const AbilityBonusSelector: React.FC<AbilityBonusSelectorProps> = ({
  character,
  updateCharacter,
  raceDetails,
  abilityBonuses: propAbilityBonuses
}) => {
  const [selectedAbilities, setSelectedAbilities] = useState<AbilityName[]>([]);
  const [remainingPoints, setRemainingPoints] = useState<number>(0);

  // Get ability bonuses from race details or from props
  const abilityBonuses = propAbilityBonuses || 
    (raceDetails?.abilityBonuses || { fixed: {}, choice: { count: 0, options: [] } });

  // Calculate fixed bonuses for each ability
  const fixedBonuses: Record<string, number> = 
    propAbilityBonuses?.fixed || raceDetails?.abilityBonuses?.fixed || {};
    
  const choiceCount = propAbilityBonuses?.amount || 
    raceDetails?.abilityBonuses?.choice?.count || 0;
    
  const choiceOptions = propAbilityBonuses?.options || 
    raceDetails?.abilityBonuses?.choice?.options || [];

  useEffect(() => {
    // Reset selections when race changes
    setSelectedAbilities([]);
    setRemainingPoints(choiceCount);
    
    // Apply fixed bonuses
    if ((raceDetails && raceDetails.abilityBonuses?.fixed) || 
        (propAbilityBonuses && propAbilityBonuses.fixed)) {
      const fixedAbilityUpdates: Partial<Character['abilities']> = {};
      
      Object.entries(fixedBonuses).forEach(([ability, bonus]) => {
        const abilityKey = ability as AbilityName;
        const currentAbilityValue = character.abilities?.[abilityKey] || 0;
        fixedAbilityUpdates[abilityKey] = currentAbilityValue + bonus;
      });
      
      if (Object.keys(fixedAbilityUpdates).length > 0) {
        updateCharacter({ 
          abilities: { 
            ...(character.abilities || {}), 
            ...fixedAbilityUpdates 
          } 
        });
      }
    }
  }, [raceDetails, choiceCount, propAbilityBonuses]);

  // Handle ability selection
  const toggleAbility = (ability: AbilityName) => {
    if (selectedAbilities.includes(ability)) {
      // Deselect ability
      setSelectedAbilities(prev => prev.filter(a => a !== ability));
      setRemainingPoints(prev => prev + 1);
      
      // Update character ability
      if (character.abilities) {
        const currentAbilityValue = character.abilities[ability] || 0;
        const updatedAbilities = {
          ...character.abilities,
          [ability]: currentAbilityValue - 1 // Subtract bonus
        };
        
        updateCharacter({
          abilities: updatedAbilities
        });
      }
    } else if (remainingPoints > 0) {
      // Select ability
      setSelectedAbilities(prev => [...prev, ability]);
      setRemainingPoints(prev => prev - 1);
      
      // Update character ability
      if (character.abilities) {
        const currentAbilityValue = character.abilities[ability] || 0;
        const updatedAbilities = {
          ...character.abilities,
          [ability]: currentAbilityValue + 1 // Add bonus
        };
        
        updateCharacter({
          abilities: updatedAbilities
        });
      }
    }
  };

  // Fixed bonuses display
  const renderFixedBonuses = () => {
    const fixedBonusExists = 
      (propAbilityBonuses?.fixed && Object.keys(propAbilityBonuses.fixed).length > 0) ||
      (raceDetails?.abilityBonuses?.fixed && Object.keys(raceDetails.abilityBonuses.fixed).length > 0);
    
    if (!fixedBonusExists) {
      return null;
    }
    
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Фиксированные бонусы:</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(fixedBonuses).map(([ability, bonus]) => (
            <Badge key={ability} variant="secondary">
              {ability}: +{bonus}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  // No choice bonuses available
  if (choiceCount === 0 || choiceOptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          {renderFixedBonuses()}
          {(!raceDetails || Object.keys(fixedBonuses).length === 0) && (
            <p className="text-sm text-muted-foreground">
              У этой расы нет бонусов к характеристикам, которые нужно распределять.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render ability choice options
  return (
    <Card>
      <CardContent className="p-4">
        {renderFixedBonuses()}
        
        <div>
          <h3 className="text-sm font-medium mb-2">
            Выберите бонусы к характеристикам: {remainingPoints} из {choiceCount}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {choiceOptions.map((ability) => {
              const abilityName = ability as AbilityName;
              const isSelected = selectedAbilities.includes(abilityName);
              const isDisabled = !isSelected && remainingPoints === 0;
              
              return (
                <div
                  key={ability}
                  className={`p-2 rounded-md border cursor-pointer flex items-center justify-between
                    ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-accent/20'} 
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => !isDisabled && toggleAbility(abilityName)}
                >
                  <span>{ability} +1</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </div>
              );
            })}
          </div>
          
          {remainingPoints > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Осталось выбрать бонусы: {remainingPoints}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AbilityBonusSelector;
