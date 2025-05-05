
import { CharacterSpell } from '@/types/character';

// Обрабатывает строку компонентов (например, "ВСМ") и возвращает объект с флагами
export const parseComponents = (componentStr: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} => {
  const verbal = componentStr.includes('В');
  const somatic = componentStr.includes('С');
  const material = componentStr.includes('М');
  const ritual = componentStr.includes('Р');
  const concentration = componentStr.includes('К');
  
  return { verbal, somatic, material, ritual, concentration };
};

// Обновляет заклинание компонентами
export const updateSpellWithComponents = (
  spell: CharacterSpell, 
  components: { verbal: boolean; somatic: boolean; material: boolean; ritual: boolean; concentration: boolean }
): CharacterSpell => {
  return {
    ...spell,
    verbal: components.verbal,
    somatic: components.somatic,
    material: components.material,
    ritual: components.ritual,
    concentration: components.concentration
  };
};

// Форматирует список классов
export const formatClasses = (classes: string[] | string | undefined): string => {
  if (!classes) return '';
  if (Array.isArray(classes)) {
    return classes.join(', ');
  }
  return classes;
};

// Генерирует строку компонентов (например, "ВСМ") из флагов
export const generateComponentsString = (
  verbal: boolean | undefined, 
  somatic: boolean | undefined, 
  material: boolean | undefined
): string => {
  let componentStr = '';
  if (verbal) componentStr += 'В';
  if (somatic) componentStr += 'С';
  if (material) componentStr += 'М';
  return componentStr;
};
