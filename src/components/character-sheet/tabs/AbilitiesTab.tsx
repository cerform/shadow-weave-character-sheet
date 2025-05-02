
import React from 'react';
import { useCharacter } from '@/contexts/CharacterContext';

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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Характеристики персонажа</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Сила</div>
          <div className="text-3xl font-bold">{abilities.STR}</div>
          <div className="text-md">{getModifier(abilities.STR)}</div>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Ловкость</div>
          <div className="text-3xl font-bold">{abilities.DEX}</div>
          <div className="text-md">{getModifier(abilities.DEX)}</div>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Телосложение</div>
          <div className="text-3xl font-bold">{abilities.CON}</div>
          <div className="text-md">{getModifier(abilities.CON)}</div>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Интеллект</div>
          <div className="text-3xl font-bold">{abilities.INT}</div>
          <div className="text-md">{getModifier(abilities.INT)}</div>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Мудрость</div>
          <div className="text-3xl font-bold">{abilities.WIS}</div>
          <div className="text-md">{getModifier(abilities.WIS)}</div>
        </div>
        
        <div className="p-3 bg-primary/5 rounded-lg text-center">
          <div className="text-lg font-medium">Харизма</div>
          <div className="text-3xl font-bold">{abilities.CHA}</div>
          <div className="text-md">{getModifier(abilities.CHA)}</div>
        </div>
      </div>
      
      <div className="bg-primary/5 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Спасброски</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between">
            <span>Сила</span>
            <span>{getModifier(getSavingThrowMod('STR', abilities.STR))}</span>
          </div>
          <div className="flex justify-between">
            <span>Ловкость</span>
            <span>{getModifier(getSavingThrowMod('DEX', abilities.DEX))}</span>
          </div>
          <div className="flex justify-between">
            <span>Телосложение</span>
            <span>{getModifier(getSavingThrowMod('CON', abilities.CON))}</span>
          </div>
          <div className="flex justify-between">
            <span>Интеллект</span>
            <span>{getModifier(getSavingThrowMod('INT', abilities.INT))}</span>
          </div>
          <div className="flex justify-between">
            <span>Мудрость</span>
            <span>{getModifier(getSavingThrowMod('WIS', abilities.WIS))}</span>
          </div>
          <div className="flex justify-between">
            <span>Харизма</span>
            <span>{getModifier(getSavingThrowMod('CHA', abilities.CHA))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
