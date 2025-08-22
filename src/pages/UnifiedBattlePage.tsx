import React from 'react';
import { BattleMap3D } from '@/features/BattleMap/BattleMap3D';
import { HUD } from '@/features/BattleMap/HUD';
import { SidePanel } from '@/features/BattleMap/SidePanel';
import { useBattleController } from '@/features/BattleMap/hooks/useBattleController';

export default function UnifiedBattlePage() {
  const { addToken, isLoading } = useBattleController();
  
  // Инициализируем демо токены при загрузке
  React.useEffect(() => {
    const initializeDemo = async () => {
      console.log('🎯 Инициализация демо токенов...');
      
      // Добавляем демо персонажей
      const warrior = await addToken({
        name: 'Эльдан Воин',
        hp: 45,
        maxHp: 45,
        ac: 18,
        speed: 6,
        position: [-6, 0, -4],
        conditions: [],
        isEnemy: false,
        isPlayer: true,
        dexterityModifier: 3,
        attackBonus: 5,
        damageRoll: '1d8+3',
      });
      console.log('✅ Добавлен воин:', warrior?.name);

      const mage = await addToken({
        name: 'Мирена Волшебница',
        hp: 22,
        maxHp: 22,
        ac: 14,
        speed: 6,
        position: [-8, 0, -2],
        conditions: [],
        isEnemy: false,
        isPlayer: true,
        dexterityModifier: 2,
        attackBonus: 4,
        damageRoll: '1d6+1',
      });
      console.log('✅ Добавлена волшебница:', mage?.name);

      const orc = await addToken({
        name: 'Орк Вожак',
        hp: 65,
        maxHp: 65,
        ac: 17,
        speed: 6,
        position: [6, 0, 2],
        conditions: [],
        isEnemy: true,
        isPlayer: false,
        dexterityModifier: 1,
        attackBonus: 6,
        damageRoll: '1d12+4',
      });
      console.log('✅ Добавлен орк:', orc?.name);

      const goblin = await addToken({
        name: 'Гоблин Лучник',
        hp: 18,
        maxHp: 18,
        ac: 14,
        speed: 6,
        position: [8, 0, 0],
        conditions: [],
        isEnemy: true,
        isPlayer: false,
        dexterityModifier: 2,
        attackBonus: 4,
        damageRoll: '1d6+2',
      });
      console.log('✅ Добавлен гоблин:', goblin?.name);
      console.log('🎯 Демо токены успешно инициализированы!');
    };

    if (!isLoading) {
      initializeDemo();
    }
  }, [addToken, isLoading]);
  
  const isDM = true; // Пока что всегда DM режим
  
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="text-lg">Загрузка боевых систем...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background flex">
      {/* Боковая панель */}
      <SidePanel isDM={isDM} className="flex-shrink-0" />
      
      {/* Основная область */}
      <div className="flex-1 flex flex-col">
        {/* HUD */}
        <HUD isDM={isDM} className="flex-shrink-0" />
        
        {/* 3D сцена */}
        <div className="flex-1">
          <BattleMap3D />
        </div>
      </div>
    </div>
  );
}