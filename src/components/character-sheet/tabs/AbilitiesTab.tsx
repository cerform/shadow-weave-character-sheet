
import React from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Card, CardContent } from "@/components/ui/card";

export const AbilitiesTab = () => {
  const { character } = useCharacter();
  
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

  return (
    <div className="space-y-8 pb-6 mt-8">
      <Card className="border border-primary/30 bg-card/20">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6">Характеристики персонажа</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="p-4 bg-primary/10 rounded-lg text-center border border-primary/20">
              <div className="text-lg font-medium">Сила</div>
              <div className="text-4xl font-bold my-1">{abilities.STR}</div>
              <div className="text-md text-primary">{getModifier(abilities.STR)}</div>
            </div>
            
            <div className="p-4 bg-primary/10 rounded-lg text-center border border-primary/20">
              <div className="text-lg font-medium">Ловкость</div>
              <div className="text-4xl font-bold my-1">{abilities.DEX}</div>
              <div className="text-md text-primary">{getModifier(abilities.DEX)}</div>
            </div>
            
            <div className="p-4 bg-primary/10 rounded-lg text-center border border-primary/20">
              <div className="text-lg font-medium">Телосложение</div>
              <div className="text-4xl font-bold my-1">{abilities.CON}</div>
              <div className="text-md text-primary">{getModifier(abilities.CON)}</div>
            </div>
            
            <div className="p-4 bg-primary/10 rounded-lg text-center border border-primary/20">
              <div className="text-lg font-medium">Интеллект</div>
              <div className="text-4xl font-bold my-1">{abilities.INT}</div>
              <div className="text-md text-primary">{getModifier(abilities.INT)}</div>
            </div>
            
            <div className="p-4 bg-primary/10 rounded-lg text-center border border-primary/20">
              <div className="text-lg font-medium">Мудрость</div>
              <div className="text-4xl font-bold my-1">{abilities.WIS}</div>
              <div className="text-md text-primary">{getModifier(abilities.WIS)}</div>
            </div>
            
            <div className="p-4 bg-primary/10 rounded-lg text-center border border-primary/20">
              <div className="text-lg font-medium">Харизма</div>
              <div className="text-4xl font-bold my-1">{abilities.CHA}</div>
              <div className="text-md text-primary">{getModifier(abilities.CHA)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-primary/30 bg-card/20 mt-8">
        <CardContent className="p-6">
          <h4 className="text-xl font-semibold mb-4">Спасброски</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-2 border-b border-primary/20">
              <span className="font-medium">Сила</span>
              <span className="text-lg">{getModifier(getSavingThrowMod('STR', abilities.STR))}</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-primary/20">
              <span className="font-medium">Ловкость</span>
              <span className="text-lg">{getModifier(getSavingThrowMod('DEX', abilities.DEX))}</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-primary/20">
              <span className="font-medium">Телосложение</span>
              <span className="text-lg">{getModifier(getSavingThrowMod('CON', abilities.CON))}</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-primary/20">
              <span className="font-medium">Интеллект</span>
              <span className="text-lg">{getModifier(getSavingThrowMod('INT', abilities.INT))}</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-primary/20">
              <span className="font-medium">Мудрость</span>
              <span className="text-lg">{getModifier(getSavingThrowMod('WIS', abilities.WIS))}</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-primary/20">
              <span className="font-medium">Харизма</span>
              <span className="text-lg">{getModifier(getSavingThrowMod('CHA', abilities.CHA))}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

