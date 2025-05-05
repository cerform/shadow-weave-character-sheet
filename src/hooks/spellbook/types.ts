
import { CharacterSpell } from '@/types/character';

export interface SpellData {
  id?: string | number; // Обновлено: теперь id может быть строкой или числом
  name: string;
  level: number;
  school: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
  prepared?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  ritual?: boolean;
  concentration?: boolean;
  higherLevels?: string;
  classes?: string[] | string;
}

// Вспомогательная функция для проверки и коррекции полей SpellData
export const validateSpellData = (data: Partial<SpellData>): SpellData => {
  return {
    id: data.id,
    name: data.name || 'Неизвестное заклинание',
    level: typeof data.level === 'number' ? data.level : 0,
    school: data.school || 'Универсальная',
    castingTime: data.castingTime || '1 действие',
    range: data.range || 'На себя',
    components: data.components || '',
    duration: data.duration || 'Мгновенная',
    description: data.description || 'Нет описания',
    prepared: data.prepared ?? false,
    verbal: data.verbal ?? false,
    somatic: data.somatic ?? false,
    material: data.material ?? false,
    materialComponents: data.materialComponents,
    ritual: data.ritual ?? false,
    concentration: data.concentration ?? false,
    higherLevels: data.higherLevels,
    classes: data.classes || []
  };
};

export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    ...spell,
    prepared: spell.prepared ?? false
  };
};

export const convertToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    ...spellData,
    prepared: spellData.prepared ?? false,
    castingTime: spellData.castingTime || '1 действие',
    range: spellData.range || 'На себя',
    components: spellData.components || '',
    duration: spellData.duration || 'Мгновенная',
    description: spellData.description || 'Нет описания'
  } as CharacterSpell;
};
