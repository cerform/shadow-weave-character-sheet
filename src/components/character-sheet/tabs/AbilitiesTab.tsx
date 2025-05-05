import React from 'react';
import { CharacterContext, useCharacter } from '@/contexts/CharacterContext';
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Badge } from "@/components/ui/badge";

export const AbilitiesTab: React.FC = () => {
  const { character, updateCharacter } = useCharacter();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Расчет модификатора из значения характеристики
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Получение значений способностей из персонажа или использование значений по умолчанию
  const abilities = {
    STR: character?.abilities?.STR || 10,
    DEX: character?.abilities?.DEX || 10,
    CON: character?.abilities?.CON || 10,
    INT: character?.abilities?.INT || 10,
    WIS: character?.abilities?.WIS || 10,
    CHA: character?.abilities?.CHA || 10
  };
  
  // Получение бонуса мастерства на основе уровня
  const proficiencyBonus = character?.level ? Math.ceil(1 + (character.level / 4)) : 2;
  
  // Расчет модификатора спасброска с учетом владения
  const getSavingThrowMod = (ability: string, value: number) => {
    const baseModifier = Math.floor((value - 10) / 2);
    const isProficient = character?.savingThrowProficiencies?.[ability] || false;
    return isProficient ? baseModifier + proficiencyBonus : baseModifier;
  };

  // Словарь русских названий характеристик
  const abilityNames = {
    STR: "Сила",
    DEX: "Ловкость",
    CON: "Телосложение",
    INT: "Интеллект",
    WIS: "Мудрость",
    CHA: "Харизма"
  };

  // Словарь спас бросков на русском
  const savingThrowNames = {
    STR: "Сила",
    DEX: "Ловкость", 
    CON: "Телосложение",
    INT: "Интеллект",
    WIS: "Мудрость", 
    CHA: "Харизма"
  };

  // Бонус мастерства и описание его расчета
  const renderProficiencyBonusCard = () => (
    <Card 
      className="border border-primary/30 mb-6" 
      style={{
        backgroundColor: `${currentTheme.cardBackground || 'rgba(20, 20, 30, 0.7)'}`,
        boxShadow: `0 0 10px ${currentTheme.accent}40`
      }}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 
              className="text-xl font-semibold"
              style={{ 
                color: currentTheme.textColor || '#FFFFFF',
                textShadow: `0 0 2px rgba(0,0,0,0.8), 0 0 3px ${currentTheme.accent}70`
              }}
            >
              Бонус мастерства
            </h4>
            <p className="text-sm opacity-80 mt-1" style={{ color: currentTheme.textColor }}>
              1 + (уровень / 4) = +{proficiencyBonus}
            </p>
          </div>
          <div 
            className="text-4xl font-bold py-4 px-6 rounded-full"
            style={{ 
              backgroundColor: `${currentTheme.accent}20`,
              color: currentTheme.textColor,
              textShadow: `0 0 3px rgba(0,0,0,0.8), 0 0 5px ${currentTheme.accent}80`,
              boxShadow: `inset 0 0 15px ${currentTheme.accent}40`
            }}
          >
            +{proficiencyBonus}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Внутри render компонента:
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Характеристики</h2>
      {renderProficiencyBonusCard()}
      
      <Card 
        className="border border-primary/30" 
        style={{
          backgroundColor: `${currentTheme.cardBackground || 'rgba(20, 20, 30, 0.7)'}`,
          boxShadow: `0 0 10px ${currentTheme.accent}40`
        }}
      >
        <CardContent className="p-6">
          <h4 
            className="text-xl font-semibold mb-4"
            style={{ 
              color: currentTheme.textColor || '#FFFFFF',
              textShadow: `0 0 2px rgba(0,0,0,0.8), 0 0 3px ${currentTheme.accent}70`
            }}
          >
            Спасброски
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(abilities).map(([key, value]) => {
              const abilityKey = key as keyof typeof abilityNames;
              const modValue = getSavingThrowMod(key, value);
              const modifier = modValue >= 0 ? `+${modValue}` : `${modValue}`;
              const isProficient = character?.savingThrowProficiencies?.[key] || false;
              
              return (
                <div 
                  key={key} 
                  className="flex justify-between items-center p-3 border-b"
                  style={{ borderColor: `${currentTheme.accent}30` }}
                >
                  <span 
                    className={`font-medium flex items-center ${isProficient ? 'font-bold' : ''}`}
                    style={{ 
                      color: currentTheme.textColor,
                      textShadow: `0 0 2px rgba(0,0,0,0.8)${isProficient ? `, 0 0 5px ${currentTheme.accent}80` : ''}`
                    }}
                  >
                    {savingThrowNames[abilityKey]}
                    {isProficient && (
                      <Badge 
                        variant="outline" 
                        className="ml-2 px-1 py-0 text-xs" 
                        style={{ 
                          borderColor: `${currentTheme.accent}60`,
                          backgroundColor: `${currentTheme.accent}20`
                        }}
                      >
                        владение
                      </Badge>
                    )}
                  </span>
                  <span 
                    className="text-lg font-bold"
                    style={{ 
                      color: modValue < 0 ? '#f87171' : '#4ade80',
                      textShadow: `0 0 2px rgba(0,0,0,0.8), 0 0 5px ${modValue < 0 ? '#f8717160' : '#4ade8060'}`
                    }}
                  >
                    {modifier}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
