
import React from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { getAbilityModifierString } from '@/utils/abilityUtils';

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
      
      // Нам нужно проверить, что character.equipment - это объект с weapons, armor, items
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

  // Безопасно отображаем инициативу
  const displayInitiative = () => {
    if (character.initiative !== undefined) {
      if (typeof character.initiative === 'number') {
        return character.initiative >= 0 ? `+${character.initiative}` : `${character.initiative}`;
      }
      return character.initiative;
    }
    return '–';
  };
  
  // Безопасное отображение навыков
  const displaySkills = () => {
    if (!character.proficiencies || typeof character.proficiencies !== 'object') {
      return 'Нет навыков';
    }
    
    // Если proficiencies - массив строк
    if (Array.isArray(character.proficiencies)) {
      return character.proficiencies.length > 0 ? character.proficiencies.join(', ') : 'Нет навыков';
    }
    
    // Если proficiencies - объект с полем skills
    const skills = character.proficiencies.skills;
    if (skills && Array.isArray(skills)) {
      return skills.length > 0 ? skills.join(', ') : 'Нет навыков';
    }
    
    return 'Нет навыков';
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
                <div>СИЛ: {character.abilities?.strength || character.strength || '–'} ({getAbilityModifierString(character.abilities?.strength || character.strength)})</div>
                <div>ЛОВ: {character.abilities?.dexterity || character.dexterity || '–'} ({getAbilityModifierString(character.abilities?.dexterity || character.dexterity)})</div>
                <div>ТЕЛ: {character.abilities?.constitution || character.constitution || '–'} ({getAbilityModifierString(character.abilities?.constitution || character.constitution)})</div>
                <div>ИНТ: {character.abilities?.intelligence || character.intelligence || '–'} ({getAbilityModifierString(character.abilities?.intelligence || character.intelligence)})</div>
                <div>МДР: {character.abilities?.wisdom || character.wisdom || '–'} ({getAbilityModifierString(character.abilities?.wisdom || character.wisdom)})</div>
                <div>ХАР: {character.abilities?.charisma || character.charisma || '–'} ({getAbilityModifierString(character.abilities?.charisma || character.charisma)})</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Базовые параметры:</h4>
              <div className="space-y-1 text-sm">
                <div>КД: {character.armorClass || '–'}</div>
                <div>Инициатива: {displayInitiative()}</div>
                <div>Скорость: {character.speed || '–'}</div>
                <div>Максимум ХП: {character.maxHp || character.hitPoints?.maximum || '–'}</div>
                <div>Бонус мастерства: +{character.proficiencyBonus || '–'}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Владения и навыки:</h4>
            <p className="text-sm">
              {displaySkills()}
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
