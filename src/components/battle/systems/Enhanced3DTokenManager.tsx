// Система управления токенами в 3D пространстве
import React, { useCallback, useEffect } from 'react';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { useMonstersStore } from '@/stores/monstersStore';
import type { EnhancedToken } from '@/stores/enhancedBattleStore';
import type { Monster } from '@/types/monsters';

interface Enhanced3DTokenManagerProps {
  onSpawnMonster?: (monster: Monster, position: [number, number, number]) => void;
  onTokenClick?: (tokenId: string) => void;
}

export const Enhanced3DTokenManager: React.FC<Enhanced3DTokenManagerProps> = ({
  onSpawnMonster,
  onTokenClick
}) => {
  const { 
    tokens, 
    addToken, 
    updateToken, 
    removeToken,
    selectedTokenId,
    activeId,
    addCombatEvent
  } = useUnifiedBattleStore();
  
  const { updatePlayerVision } = useFogOfWarStore();
  const { getAllMonsters } = useMonstersStore();

  // Функция для создания токена из монстра
  const createTokenFromMonster = useCallback((monster: Monster, position: [number, number, number]): EnhancedToken => {
    // Парсим HP из строки или используем как число
    let hp = 20; // значение по умолчанию
    const hitPoints = (monster as any).hitPoints;
    if (typeof hitPoints === 'string') {
      const hpMatch = hitPoints.match(/\d+/);
      hp = hpMatch ? parseInt(hpMatch[0]) : 20;
    } else if (typeof hitPoints === 'number') {
      hp = hitPoints;
    }

    // Определяем размер токена
    let tokenSize = 1;
    const size = monster.size as string;
    if (size === 'Large') tokenSize = 2;
    else if (size === 'Huge') tokenSize = 3;
    else if (size === 'Gargantuan') tokenSize = 4;

    return {
      id: crypto.randomUUID(),
      name: monster.name,
      hp: hp,
      maxHp: hp,
      ac: monster.armorClass || 10,
      position: position,
      conditions: [],
      isEnemy: true,
      isVisible: true,
      size: tokenSize,
      speed: (monster.speed as any)?.walk || 6,
      hasMovedThisTurn: false,
      class: `${monster.type} CR ${monster.challengeRating}`,
      color: '#dc2626', // Красный для врагов
      initiative: Math.floor(Math.random() * 20) + 1
    };
  }, []);

  // Функция для создания токена игрока
  const createPlayerToken = useCallback((name: string, position: [number, number, number], playerClass: string = 'Авантюрист'): EnhancedToken => {
    return {
      id: crypto.randomUUID(),
      name: name,
      hp: 30,
      maxHp: 30,
      ac: 15,
      position: position,
      conditions: [],
      isEnemy: false,
      isVisible: true,
      size: 1,
      speed: 6,
      hasMovedThisTurn: false,
      class: playerClass,
      color: '#3b82f6', // Синий для игроков
      initiative: Math.floor(Math.random() * 20) + 1
    };
  }, []);

  // Спавн монстра в указанной позиции
  const spawnMonster = useCallback((monsterId: string, position: [number, number, number]) => {
    const monsters = getAllMonsters();
    const monster = monsters.find(m => m.id === monsterId);
    
    if (!monster) {
      console.error('Monster not found:', monsterId);
      return;
    }

    const token = createTokenFromMonster(monster, position);
    addToken(token);
    
    addCombatEvent({
      actor: 'ДМ',
      action: 'Спавн',
      description: `Создан ${monster.name} (CR ${monster.challengeRating})`,
      playerName: 'Мастер'
    });

    console.log('🐲 Создан токен монстра:', token.name, 'в позиции:', position);
    
    if (onSpawnMonster) {
      onSpawnMonster(monster, position);
    }
  }, [getAllMonsters, createTokenFromMonster, addToken, addCombatEvent, onSpawnMonster]);

  // Спавн игрока
  const spawnPlayer = useCallback((name: string, position: [number, number, number], playerClass?: string) => {
    const token = createPlayerToken(name, position, playerClass);
    addToken(token);
    
    addCombatEvent({
      actor: 'ДМ',
      action: 'Добавление игрока',
      description: `Добавлен игрок ${name}`,
      playerName: 'Мастер'
    });

    console.log('👤 Создан токен игрока:', token.name, 'в позиции:', position);
  }, [createPlayerToken, addToken, addCombatEvent]);

  // Перемещение токена с обновлением тумана войны
  const moveToken = useCallback((tokenId: string, newPosition: [number, number, number]) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    updateToken(tokenId, { 
      position: newPosition,
      hasMovedThisTurn: true
    });

    // Обновляем туман войны для игроков
    if (!token.isEnemy) {
      const [x, y, z] = newPosition;
      const gridX = Math.floor(x + 12);
      const gridY = 23 - Math.floor(z + 12);
      updatePlayerVision(tokenId, gridX, gridY);
    }

    addCombatEvent({
      actor: token.name,
      action: 'Перемещение',
      description: `${token.name} переместился`,
      playerName: token.name
    });
  }, [tokens, updateToken, updatePlayerVision, addCombatEvent]);

  // Атака между токенами
  const performAttack = useCallback((attackerId: string, targetId: string, damage: number) => {
    const attacker = tokens.find(t => t.id === attackerId);
    const target = tokens.find(t => t.id === targetId);
    
    if (!attacker || !target) return;

    const newHp = Math.max(0, target.hp - damage);
    updateToken(targetId, { hp: newHp });

    const isKilled = newHp === 0;
    
    addCombatEvent({
      actor: attacker.name,
      action: isKilled ? 'Убийство' : 'Атака',
      description: `${attacker.name} ${isKilled ? 'убил' : 'атаковал'} ${target.name} на ${damage} урона`,
      playerName: attacker.name
    });

    if (isKilled) {
      console.log('💀 Токен убит:', target.name);
      // Можно добавить анимацию смерти или удаление токена
    }
  }, [tokens, updateToken, addCombatEvent]);

  // Лечение токена
  const healToken = useCallback((tokenId: string, healAmount: number) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    const newHp = Math.min(token.maxHp, token.hp + healAmount);
    updateToken(tokenId, { hp: newHp });

    addCombatEvent({
      actor: 'Лечение',
      action: 'Исцеление',
      description: `${token.name} восстановил ${healAmount} HP`,
      playerName: token.name
    });
  }, [tokens, updateToken, addCombatEvent]);

  // Добавление/удаление состояний
  const addCondition = useCallback((tokenId: string, condition: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token || token.conditions.includes(condition)) return;

    updateToken(tokenId, { 
      conditions: [...token.conditions, condition] 
    });

    addCombatEvent({
      actor: token.name,
      action: 'Состояние',
      description: `${token.name} получил состояние: ${condition}`,
      playerName: token.name
    });
  }, [tokens, updateToken, addCombatEvent]);

  const removeCondition = useCallback((tokenId: string, condition: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    updateToken(tokenId, { 
      conditions: token.conditions.filter(c => c !== condition) 
    });

    addCombatEvent({
      actor: token.name,
      action: 'Состояние',
      description: `${token.name} избавился от состояния: ${condition}`,
      playerName: token.name
    });
  }, [tokens, updateToken, addCombatEvent]);

  // Сброс ходов для нового раунда
  const resetTurnFlags = useCallback(() => {
    tokens.forEach(token => {
      if (token.hasMovedThisTurn) {
        updateToken(token.id, { hasMovedThisTurn: false });
      }
    });

    addCombatEvent({
      actor: 'Система',
      action: 'Новый раунд',
      description: 'Начался новый раунд боя',
      playerName: 'Система'
    });
  }, [tokens, updateToken, addCombatEvent]);

  // Обработка клика по токену
  const handleTokenClick = useCallback((tokenId: string) => {
    console.log('🎯 Клик по токену:', tokenId);
    if (onTokenClick) {
      onTokenClick(tokenId);
    }
  }, [onTokenClick]);

  // Возвращаем функции для использования в других компонентах
  return {
    // Функции управления токенами
    spawnMonster,
    spawnPlayer,
    moveToken,
    performAttack,
    healToken,
    addCondition,
    removeCondition,
    resetTurnFlags,
    handleTokenClick,
    
    // Данные
    tokens,
    selectedTokenId,
    activeId
  } as any; // Компонент-утилита, не рендерит ничего
};