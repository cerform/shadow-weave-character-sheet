
import { CharacterSpell } from '@/types/character';

// Функция для импорта заклинаний из текста
export function importSpellsFromText(text: string, existingSpells: CharacterSpell[]): CharacterSpell[] {
  if (!text || !text.trim()) {
    return existingSpells;
  }

  // Базовый разбор: предполагаем, что каждая строка - это одно заклинание
  const lines = text.split('\n').filter(line => line.trim());
  
  // Создаем новые заклинания из строк
  const newSpells = lines.map(line => {
    const trimmedLine = line.trim();
    // Пытаемся извлечь уровень заклинания из строки, если он указан в формате "Название (уровень X)"
    const levelMatch = trimmedLine.match(/\((?:уровень|level)\s*(\d+)\)/i);
    const level = levelMatch ? parseInt(levelMatch[1], 10) : 0;
    
    // Удаляем информацию об уровне из названия
    const name = trimmedLine.replace(/\s*\((?:уровень|level)\s*\d+\)\s*/i, '');
    
    return {
      name,
      level,
      prepared: true // По умолчанию помечаем как подготовленное
    } as CharacterSpell;
  });
  
  // Объединяем с существующими заклинаниями, избегая дубликатов
  const combinedSpells = [...existingSpells];
  
  newSpells.forEach(newSpell => {
    const existingIndex = combinedSpells.findIndex(spell => 
      (typeof spell === 'string' && spell === newSpell.name) || 
      (typeof spell === 'object' && spell !== null && spell.name === newSpell.name)
    );
    
    if (existingIndex === -1) {
      combinedSpells.push(newSpell);
    }
  });
  
  return combinedSpells;
}
