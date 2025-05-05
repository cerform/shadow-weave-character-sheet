
import { useState, useEffect } from 'react';
import { SpellData } from './types';
import { spells } from '@/data/spells'; // Теперь импортируем из правильного места

/**
 * Хук для загрузки заклинаний из источника данных
 */
const usePreloadSpells = (): SpellData[] => {
  const [loadedSpells, setLoadedSpells] = useState<SpellData[]>([]);
  
  useEffect(() => {
    // Загружаем заклинания из источника данных
    setLoadedSpells(spells.map(spell => ({
      ...spell,
      // Устанавливаем значения по умолчанию для обязательных полей, если они отсутствуют
      prepared: spell.prepared !== undefined ? spell.prepared : false,
      material: spell.material ?? false,
      somatic: spell.somatic ?? false,
      verbal: spell.verbal ?? false,
    })));
  }, []);
  
  return loadedSpells;
};

export default usePreloadSpells;
