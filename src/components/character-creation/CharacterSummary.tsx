import React from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { getModifier, getAbilityScore } from '@/utils/abilityUtils';

interface CharacterSummaryProps {
  character: Character;
}

const CharacterSummary: React.FC<CharacterSummaryProps> = ({ character }) => {
  // Функция форматирования списков для отображения
  const formatList = (list: string[] | undefined | null): string => {
    if (!list || list.length === 0) return 'Нет';
    return list.join(', ');
  };

  // Форматирование экипировки для отображения
  const formatEquipment = () => {
    if (!character.equipment) return 'Нет экипировки';
    
    // Обрабатываем оба возможных типа equipment
    if (Array.isArray(character.equipment)) {
      // Массив Item объектов
      const names = character.equipment.map(item => item.name);
      return names.length ? names.join(', ') : 'Нет экипировки';
    } else {
      // Объект с weapons, armor, items
      const equipParts = [];
      const equip = character.equipment as { weapons?: string[], armor?: string, items?: string[] };
      
      if (equip.weapons && equip.weapons.length > 0) {
        equipParts.push(`Оружие: ${equip.weapons.join(', ')}`);
      }
      
      if (equip.armor) {
        equipParts.push(`Доспех: ${equip.armor}`);
      }
      
      if (equip.items && equip.items.length > 0) {
        equipParts.push(`Предметы: ${equip.items.join(', ')}`);
      }
      
      return equipParts.length ? equipParts.join('; ') : 'Нет экипировки';
    }
  };

  // Форматирование особенностей для отображения
  const formatFeatures = () => {
    if (!character.features) return 'Нет особенностей';
    
    if (Array.isArray(character.features)) {
      if (typeof character.features[0] === 'string') {
        // Массив строк
        return character.features.length ? character.features.join(', ') : 'Нет особенностей';
      } else {
        // Массив Feature объектов
        const featureNames = character.features.map((feature: any) => feature.name);
        return featureNames.length ? featureNames.join(', ') : 'Нет особенностей';
      }
    }
    
    return 'Нет особенностей';
  };
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{character.name}</h3>
            <p className="text-sm text-muted-foreground">
              {character.race} {character.subrace && `(${character.subrace})`}, {character.class || character.className}, {character.background}, {character.alignment}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Характеристики:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Сила (STR)</span>
                  <span className="font-semibold">{character.abilities?.STR || 10} ({getModifier(getAbilityScore(character, 'STR'))})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ловкость (DEX)</span>
                  <span className="font-semibold">{character.abilities?.DEX || 10} ({getModifier(getAbilityScore(character, 'DEX'))})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Телосложение (CON)</span>
                  <span className="font-semibold">{character.abilities?.CON || 10} ({getModifier(getAbilityScore(character, 'CON'))})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Интеллект (INT)</span>
                  <span className="font-semibold">{character.abilities?.INT || 10} ({getModifier(getAbilityScore(character, 'INT'))})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Мудрость (WIS)</span>
                  <span className="font-semibold">{character.abilities?.WIS || 10} ({getModifier(getAbilityScore(character, 'WIS'))})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Харизма (CHA)</span>
                  <span className="font-semibold">{character.abilities?.CHA || 10} ({getModifier(getAbilityScore(character, 'CHA'))})</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Базовые параметры:</h4>
              <div className="space-y-1 text-sm">
                <div>КД: {character.armorClass || '–'}</div>
                <div>Инициатива: {character.initiative !== undefined ? character.initiative : '–'}</div>
                <div>Скорость: {character.speed || '–'}</div>
                <div>Максимум ХП: {character.maxHp || character.hitPoints?.maximum || '–'}</div>
                <div>Бонус мастерства: +{character.proficiencyBonus || '–'}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Владения и навыки:</h4>
            <p className="text-sm">
              {character.proficiencies && typeof character.proficiencies === 'object' && !Array.isArray(character.proficiencies) && 
                'skills' in character.proficiencies && character.proficiencies.skills ? 
                formatList(character.proficiencies.skills) : 
                'Нет навыков'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Экипировка:</h4>
            <p className="text-sm">{formatEquipment()}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Особенности:</h4>
            <p className="text-sm">{formatFeatures()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterSummary;
