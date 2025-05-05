
import { CharacterSpell, SpellData } from '@/types/character';

// Адаптер для преобразования нестандартных объектов к формату SpellData
export function normalizeSpellData(spell: any): SpellData {
  return {
    name: spell.name || 'Неизвестное заклинание',
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    prepared: spell.prepared || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    materialComponents: spell.materialComponents || '',
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    higherLevels: spell.higherLevels || '',
    classes: Array.isArray(spell.classes) ? spell.classes : 
             (typeof spell.classes === 'string' ? [spell.classes] : [])
  };
}

// Функция для проверки обязательных полей SpellData
export function validateSpellData(spell: Partial<SpellData>): SpellData {
  return {
    name: spell.name || 'Неизвестное заклинание',
    level: spell.level ?? 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    prepared: spell.prepared || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    materialComponents: spell.materialComponents || '',
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    higherLevels: spell.higherLevels || '',
    classes: Array.isArray(spell.classes) ? spell.classes : 
             (typeof spell.classes === 'string' ? [spell.classes] : [])
  };
}
