
import { CharacterSpell } from '@/types/character';
import { cantrips } from './cantrips';
import { level1 } from './level1';
import { level0 } from './level0';

// Временно добавим мок данные для других уровней
const level2: CharacterSpell[] = [];
const level3: CharacterSpell[] = [];
const level4: CharacterSpell[] = [];
const level5: CharacterSpell[] = [];
const level6: CharacterSpell[] = [];
const level7: CharacterSpell[] = [];
const level8: CharacterSpell[] = [];
const level9: CharacterSpell[] = [];

// Экспорт заклинаний по уровням
export { level0, cantrips, level1, level2, level3, level4, level5, level6, level7, level8, level9 };

// Объединенный массив всех заклинаний
export const spells: CharacterSpell[] = [
  ...cantrips,
  ...level1,
  ...level2,
  ...level3,
  ...level4,
  ...level5,
  ...level6,
  ...level7,
  ...level8,
  ...level9
];
