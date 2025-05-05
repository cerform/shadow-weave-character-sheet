
import { CharacterSpell } from '@/types/character';

export interface SpellData {
  id?: number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
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

export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    ...spell,
    prepared: spell.prepared || false
  };
};

export const validateSpellData = (data: any): SpellData => {
  return {
    name: data.name || 'Неизвестное заклинание',
    level: data.level !== undefined ? data.level : 0,
    school: data.school || 'Универсальная',
    castingTime: data.castingTime || '1 действие',
    range: data.range || 'На себя',
    components: data.components || '',
    duration: data.duration || 'Мгновенная',
    description: data.description || 'Нет описания',
    prepared: data.prepared || false,
    verbal: data.verbal,
    somatic: data.somatic,
    material: data.material,
    materialComponents: data.materialComponents,
    ritual: data.ritual,
    concentration: data.concentration,
    higherLevels: data.higherLevels,
    classes: data.classes
  };
};
