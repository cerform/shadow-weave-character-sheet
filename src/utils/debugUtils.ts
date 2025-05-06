
import { Character } from '@/types/character';

/**
 * Анализирует данные персонажа для поиска проблем
 * @param character Объект персонажа
 * @returns Объект с результатами анализа
 */
export const analyzeCharacter = (character: Character) => {
  if (!character) {
    return {
      valid: false,
      issues: ['Персонаж не определен']
    };
  }

  const issues = [];
  
  // Проверка обязательных полей
  if (!character.id) issues.push('Отсутствует ID');
  if (!character.userId) issues.push('Отсутствует userId');
  
  // Проверка основных атрибутов
  const basicProperties = ['name', 'race', 'level'];
  for (const prop of basicProperties) {
    if (character[prop] === undefined) {
      issues.push(`Отсутствует обязательное свойство: ${prop}`);
    }
  }
  
  // Проверка класса (может быть в разных полях)
  if (!character.class && !character.className) {
    issues.push('Отсутствует класс персонажа');
  }
  
  // Проверка дублирующихся полей
  const keys = Object.keys(character);
  const lowercaseKeys = keys.map(k => k.toLowerCase());
  const duplicateFields = keys.filter(key => {
    const lowercaseKey = key.toLowerCase();
    return key !== lowercaseKey && lowercaseKeys.includes(lowercaseKey);
  });
  
  if (duplicateFields.length > 0) {
    issues.push(`Дублирующиеся поля: ${duplicateFields.join(', ')}`);
  }
  
  // Проверка несогласованных данных
  // Например, способности могут быть в разных форматах
  if (character.abilities && character.stats) {
    const abilityFields = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    for (const field of abilityFields) {
      if (character[field] !== undefined && 
          character.stats[field] !== undefined && 
          character[field] !== character.stats[field]) {
        issues.push(`Несогласованные значения для ${field}: ${character[field]} vs ${character.stats[field]}`);
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues: issues.length > 0 ? issues : []
  };
};

/**
 * Проверяет список персонажей на наличие проблем
 */
export const validateCharacters = (characters?: Character[]) => {
  if (!characters || !Array.isArray(characters)) {
    return {
      valid: false,
      issues: ['Список персонажей отсутствует или не является массивом'],
      charactersWithIssues: 0,
      totalCharacters: 0,
      detailedIssues: []
    };
  }
  
  if (characters.length === 0) {
    return {
      valid: true,
      issues: [],
      charactersWithIssues: 0,
      totalCharacters: 0,
      detailedIssues: []
    };
  }
  
  const detailedIssues = characters.map((character, index) => {
    const analysis = analyzeCharacter(character);
    return {
      index,
      id: character.id || 'unknown',
      name: character.name || 'Безымянный',
      valid: analysis.valid,
      issues: analysis.issues
    };
  });
  
  const charactersWithIssues = detailedIssues.filter(char => !char.valid).length;
  
  return {
    valid: charactersWithIssues === 0,
    issues: charactersWithIssues > 0 ? 
      [`Обнаружены проблемы в ${charactersWithIssues} из ${characters.length} персонажей`] : [],
    charactersWithIssues,
    totalCharacters: characters.length,
    detailedIssues: detailedIssues.filter(char => !char.valid)
  };
};
