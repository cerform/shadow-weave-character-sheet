
import { CharacterSpell } from "@/types/character";

// Функция для импорта заклинаний из текста
export const importSpellsFromText = (text: string, existingSpells: CharacterSpell[] = []): CharacterSpell[] => {
  // Проверка на пустой текст
  if (!text || text.trim() === '') {
    return [];
  }

  try {
    // Попытка парсинга JSON строки
    const parsedData = JSON.parse(text);
    
    // Проверяем, является ли результат массивом
    if (Array.isArray(parsedData)) {
      return parsedData.map(spell => {
        // Добавляем toString метод для отображения
        return {
          ...spell,
          toString: function() { return this.name }
        };
      });
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      // Если получен одиночный объект, оборачиваем его в массив
      const spellWithToString = {
        ...parsedData,
        toString: function() { return this.name }
      };
      return [spellWithToString];
    }
  } catch (error) {
    // Если не удалось распарсить как JSON, попробуем разбор текста
    console.log("Не удалось распарсить как JSON, пробуем разбор текста");
    
    // Простая эвристика для разбора текста на строки и поиска заклинаний
    const lines = text.split('\n');
    const newSpells: CharacterSpell[] = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Пропускаем пустые строки
      if (!trimmedLine) return;
      
      // Ищем существующее заклинание по имени
      const existingSpell = existingSpells.find(spell => 
        spell.name.toLowerCase() === trimmedLine.toLowerCase()
      );
      
      if (existingSpell) {
        // Копируем найденное заклинание
        const spellCopy = { 
          ...existingSpell,
          toString: function() { return this.name }
        };
        newSpells.push(spellCopy);
      } else {
        // Создаем новое заклинание с минимальной информацией
        newSpells.push({
          name: trimmedLine,
          level: 0, // По умолчанию заговор
          school: "Преобразование", // По умолчанию
          description: "Описание отсутствует",
          toString: function() { return this.name }
        });
      }
    });
    
    return newSpells;
  }
  
  return [];
};
