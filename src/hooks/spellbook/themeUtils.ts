
import { SpellData } from '@/types/character';

// Валидация данных заклинания для обеспечения совместимости с типом SpellData
export const validateSpellData = (spell: Partial<SpellData>): SpellData => {
  // Обязательные поля
  const validated: SpellData = {
    name: spell.name || 'Неизвестное заклинание',
    level: spell.level !== undefined ? spell.level : 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || 'В, С',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Нет описания',
    prepared: spell.prepared || false
  };

  // Необязательные поля
  if (spell.id !== undefined) validated.id = spell.id;
  if (spell.verbal !== undefined) validated.verbal = spell.verbal;
  if (spell.somatic !== undefined) validated.somatic = spell.somatic;
  if (spell.material !== undefined) validated.material = spell.material;
  if (spell.materialComponents) validated.materialComponents = spell.materialComponents;
  if (spell.concentration !== undefined) validated.concentration = spell.concentration;
  if (spell.ritual !== undefined) validated.ritual = spell.ritual;
  if (spell.higherLevels) validated.higherLevels = spell.higherLevels;
  if (spell.classes) validated.classes = spell.classes;

  return validated;
};
