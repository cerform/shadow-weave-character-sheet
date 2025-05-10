
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Нормализация списка заклинаний
export const normalizeSpells = (character: any): CharacterSpell[] => {
  if (!character || !character.spells) return [];

  return character.spells.map((spell: any) => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'На себя',
        components: '',
        duration: 'Мгновенная',
        description: '',
        prepared: false,
      };
    }
    
    // Убедимся, что у заклинания есть id
    return {
      ...spell,
      id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`
    };
  });
};

// Конвертирование CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
  };
};

// Проверка возможности подготовить ещё заклинания
export const canPrepareMoreSpells = (
  character: any,
  currentPreparedCount: number
): boolean => {
  if (!character || !character.spellcasting) return false;
  
  const preparedLimit = character.spellcasting.preparedSpellsLimit || 0;
  if (preparedLimit <= 0) return true; // Если лимита нет, можно готовить сколько угодно
  
  return currentPreparedCount < preparedLimit;
};

// Конвертация списка заклинаний для состояния компонента
export const convertSpellsForState = (spells: CharacterSpell[]): CharacterSpell[] => {
  return spells.map(spell => ({
    ...spell,
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`
  }));
};

// Проверка, добавлено ли заклинание
export const isSpellAdded = (spellId: string, spells: CharacterSpell[]): boolean => {
  return spells.some(spell => spell.id === spellId);
};

// Получение активной школы магии
export const getActiveSchool = (school: string): string => {
  const schoolsMap: Record<string, string> = {
    'вызов': 'conjuration',
    'воплощение': 'evocation',
    'иллюзия': 'illusion',
    'некромантия': 'necromancy',
    'ограждение': 'abjuration',
    'очарование': 'enchantment',
    'преобразование': 'transmutation',
    'прорицание': 'divination',
    'универсальная': 'universal'
  };
  
  return schoolsMap[school.toLowerCase()] || 'universal';
};

// Получение перевода школы магии
export const getSchoolTranslation = (school: string): string => {
  const schoolsMap: Record<string, string> = {
    'conjuration': 'Вызов',
    'evocation': 'Воплощение',
    'illusion': 'Иллюзия',
    'necromancy': 'Некромантия',
    'abjuration': 'Ограждение',
    'enchantment': 'Очарование',
    'transmutation': 'Преобразование',
    'divination': 'Прорицание',
    'universal': 'Универсальная'
  };
  
  return schoolsMap[school.toLowerCase()] || school;
};
