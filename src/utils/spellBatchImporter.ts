
import { CharacterSpell } from '@/types/character';
import { parseComponents, processSpellBatch } from './spellProcessors';

export interface SpellBatchItem {
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
  };
}

export const importSpellsFromText = (
  rawText: string,
  existingSpells: CharacterSpell[]
): CharacterSpell[] => {
  const batchItems = processSpellBatch(rawText);
  const result = [...existingSpells];
  
  batchItems.forEach(item => {
    // Проверяем, существует ли уже заклинание с таким именем
    const existingIndex = result.findIndex(spell => spell.name === item.name);
    
    if (existingIndex === -1) {
      // Добавляем новое заклинание
      result.push({
        id: `spell_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: item.name,
        level: item.level,
        school: 'Неизвестная', // Можно заменить на более точное определение
        castingTime: '1 действие',
        range: 'На себя',
        components: `${item.components.verbal ? 'В' : ''}${item.components.somatic ? 'С' : ''}${item.components.material ? 'М' : ''}`,
        duration: 'Мгновенная',
        description: 'Описание отсутствует',
        prepared: false,
        verbal: item.components.verbal,
        somatic: item.components.somatic,
        material: item.components.material,
        ritual: item.components.ritual,
        concentration: false,
        classes: []
      });
    }
  });
  
  return result;
};

// Make sure this function is explicitly exported
export { importSpellsFromText as importSpellsFromText };
