
import { CharacterSpell } from '@/types/character';

// Функция для импорта заклинаний из текста
export const importSpellsFromText = (text: string): CharacterSpell[] => {
  try {
    // Разделяем текст на строки
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Паттерн для определения заклинаний
    const spellPattern = /^(.+) \((\d)(?:st|nd|rd|th) уровень\)$/;
    const cantripsPattern = /^(.+) \(заговор\)$/;
    
    const spells: CharacterSpell[] = [];
    
    lines.forEach(line => {
      let match = line.match(spellPattern);
      
      if (match) {
        const [, name, levelStr] = match;
        const level = parseInt(levelStr);
        
        spells.push({
          name: name.trim(),
          level,
          description: '',
          school: ''
        });
      } else {
        match = line.match(cantripsPattern);
        if (match) {
          const [, name] = match;
          
          spells.push({
            name: name.trim(),
            level: 0,
            description: '',
            school: ''
          });
        }
      }
    });
    
    return spells;
  } catch (error) {
    console.error('Ошибка при импорте заклинаний из текста:', error);
    return [];
  }
};
