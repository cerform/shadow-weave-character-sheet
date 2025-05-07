
import { SpellData, SpellFilter } from "@/types/spells";

// Функция для фильтрации заклинаний
export function filterSpells(spells: SpellData[], filter: SpellFilter): SpellData[] {
  return spells.filter(spell => {
    // Фильтр по уровню
    if (filter.level !== undefined) {
      if (Array.isArray(filter.level)) {
        if (!filter.level.includes(spell.level)) return false;
      } else {
        if (spell.level !== filter.level) return false;
      }
    }
    
    // Фильтр по школе
    if (filter.school !== undefined) {
      if (Array.isArray(filter.school)) {
        if (!filter.school.includes(spell.school)) return false;
      } else {
        if (spell.school !== filter.school) return false;
      }
    }
    
    // Фильтр по классу
    if (filter.class !== undefined) {
      const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      if (Array.isArray(filter.class)) {
        if (!filter.class.some(c => spellClasses.includes(c))) return false;
      } else {
        if (!spellClasses.includes(filter.class)) return false;
      }
    }
    
    // Фильтр по названию
    if (filter.name !== undefined && filter.name !== '') {
      const searchName = filter.name.toLowerCase();
      if (!spell.name.toLowerCase().includes(searchName)) return false;
    }
    
    // Фильтр по ритуалу
    if (filter.ritual !== undefined) {
      if (spell.ritual !== filter.ritual) return false;
    }
    
    // Фильтр по концентрации
    if (filter.concentration !== undefined) {
      if (spell.concentration !== filter.concentration) return false;
    }
    
    // Все фильтры прошли успешно
    return true;
  });
}

// Функция для сортировки заклинаний
export function sortSpells(spells: SpellData[], sortBy: string = 'name', sortDirection: 'asc' | 'desc' = 'asc'): SpellData[] {
  return [...spells].sort((a, b) => {
    let valA: string | number = '';
    let valB: string | number = '';
    
    // Определяем значения для сравнения в зависимости от поля сортировки
    switch(sortBy) {
      case 'name':
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case 'level':
        valA = a.level;
        valB = b.level;
        break;
      case 'school':
        valA = a.school.toLowerCase();
        valB = b.school.toLowerCase();
        break;
      default:
        valA = a[sortBy as keyof SpellData]?.toString() || '';
        valB = b[sortBy as keyof SpellData]?.toString() || '';
    }
    
    // Преобразуем значения к строке для корректного сравнения
    const strA = valA.toString();
    const strB = valB.toString();
    
    // Сравниваем значения с учетом направления сортировки
    if (sortDirection === 'asc') {
      return strA.localeCompare(strB);
    } else {
      return strB.localeCompare(strA);
    }
  });
}
