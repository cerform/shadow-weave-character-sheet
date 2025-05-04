
import React, { useState, useEffect } from 'react';
import { ResourcePanel } from './ResourcePanel';
import { useCharacterContext } from '@/contexts/CharacterContext';
import { getNumericModifier } from '@/utils/characterUtils';
import { useHealthSystem } from '@/hooks/useHealthSystem'; 
import { CharacterSheet } from '@/types/character';

/**
 * Enhanced Resource Panel that manages health state internally
 * with context awareness for character data
 */
export const EnhancedResourcePanel = () => {
  const { character, updateCharacter } = useCharacterContext();
  
  // Состояния для хранения HP
  const [maxHitPoints, setMaxHitPoints] = useState<number>(character?.maxHp || 10);
  const [currentHitPoints, setCurrentHitPoints] = useState<number>(
    character?.currentHp !== undefined ? character.currentHp : maxHitPoints
  );
  
  // Обновляем maxHitPoints при изменении уровня или модификатора телосложения
  useEffect(() => {
    if (character) {
      // Базовая формула для расчета Max HP
      const conMod = character.abilities?.constitution 
        ? getNumericModifier(character.abilities.constitution)
        : (character.abilities?.CON ? getNumericModifier(character.abilities.CON) : 0);
      
      const level = character.level || 1;
      const calculatedMaxHP = Math.max(1, 10 + (level - 1) * 6 + level * conMod);
      
      // Обновляем максимальное HP только если оно не было установлено вручную
      if (!character.maxHp) {
        setMaxHitPoints(calculatedMaxHP);
        
        // Обновляем персонажа
        updateCharacter({
          maxHp: calculatedMaxHP
        } as Partial<CharacterSheet>);
      } else {
        setMaxHitPoints(character.maxHp);
      }
    }
  }, [character?.level, character?.abilities, updateCharacter, character?.maxHp, character]);
  
  // Используем хук для управления здоровьем
  const {
    currentHp,
    maxHp,
    tempHp,
    events,
    setHp,
    setMaxHitPoints: setSystemMaxHP,
    setTempHp,
    applyDamage,
    applyHealing,
    addTempHp,
    undoLastEvent
  } = useHealthSystem({
    initialCurrentHp: currentHitPoints,
    initialMaxHp: maxHitPoints,
    initialTempHp: character?.temporaryHp || 0,
    constitutionModifier: character?.abilities?.constitution 
      ? getNumericModifier(character.abilities.constitution)
      : (character?.abilities?.CON ? getNumericModifier(character.abilities.CON) : 0),
    onHealthChange: (hp, maxHp, tempHp) => {
      // Обновляем локальное состояние
      setCurrentHitPoints(hp);
      
      // Обновляем персонажа в контексте
      updateCharacter({
        currentHp: hp,
        maxHp: maxHp,
        temporaryHp: tempHp
      } as Partial<CharacterSheet>);
    }
  });
  
  // Обработчик изменения текущих хитов
  const handleHpChange = (newHp: number) => {
    setHp(newHp);
  };
  
  // Эффект для синхронизации с персонажем при его изменении извне
  useEffect(() => {
    // Обновляем текущие хиты, если они изменились извне
    if (character?.currentHp !== undefined && character.currentHp !== currentHp) {
      setHp(character.currentHp);
    }
    
    // Обновляем максимальные хиты, если они изменились извне
    if (character?.maxHp !== undefined && character.maxHp !== maxHp) {
      setSystemMaxHP(character.maxHp);
      setMaxHitPoints(character.maxHp);
    }
    
    // Обновляем временные хиты, если они изменились извне
    if (character?.temporaryHp !== undefined && character.temporaryHp !== tempHp) {
      setTempHp(character.temporaryHp);
    }
  }, [character?.currentHp, character?.maxHp, character?.temporaryHp, currentHp, maxHp, tempHp, setHp, setSystemMaxHP, setTempHp]);
  
  return (
    <ResourcePanel 
      currentHp={currentHp}
      maxHp={maxHp}
      onHpChange={handleHpChange}
    />
  );
};
