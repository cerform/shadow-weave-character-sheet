
import { useState, useEffect } from 'react';
import { SpellData } from './types';
import { spells as allSpells } from '@/data/spells';

/**
 * Хук для загрузки заклинаний из источника данных
 */
const usePreloadSpells = (): SpellData[] => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  
  useEffect(() => {
    // Загружаем заклинания из источника данных
    setSpells(allSpells.map(spell => ({
      ...spell,
      // Устанавливаем значения по умолчанию для обязательных полей, если они отсутствуют
      prepared: spell.prepared ?? false,
      material: spell.material ?? false,
      somatic: spell.somatic ?? false,
      verbal: spell.verbal ?? false,
    })));
  }, []);
  
  return spells;
};

export default usePreloadSpells;
