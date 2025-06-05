
import { useMemo } from 'react';
import { SpellData } from '@/types/spells';

// Функция для вычисления расстояния Левенштейна
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Функция для вычисления схожести строк (от 0 до 1)
const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLength;
};

// Словарь синонимов для заклинаний
const spellSynonyms: { [key: string]: string[] } = {
  'огонь': ['пламя', 'горение', 'жар', 'fire', 'flame', 'burning'],
  'пламя': ['огонь', 'горение', 'жар', 'fire', 'flame', 'burning'],
  'лед': ['холод', 'мороз', 'заморозка', 'ice', 'cold', 'frost'],
  'холод': ['лед', 'мороз', 'заморозка', 'ice', 'cold', 'frost'],
  'молния': ['электричество', 'разряд', 'lightning', 'electricity', 'shock'],
  'электричество': ['молния', 'разряд', 'lightning', 'electricity', 'shock'],
  'лечение': ['исцеление', 'восстановление', 'heal', 'cure', 'restore'],
  'исцеление': ['лечение', 'восстановление', 'heal', 'cure', 'restore'],
  'урон': ['повреждение', 'ущерб', 'damage', 'harm'],
  'повреждение': ['урон', 'ущерб', 'damage', 'harm'],
  'защита': ['ограждение', 'щит', 'защищение', 'protection', 'shield', 'ward'],
  'щит': ['защита', 'ограждение', 'защищение', 'protection', 'shield', 'ward'],
  'телепортация': ['перемещение', 'переброска', 'teleport', 'transport'],
  'перемещение': ['телепортация', 'переброска', 'teleport', 'transport'],
  'иллюзия': ['обман', 'видение', 'мираж', 'illusion', 'deception'],
  'обман': ['иллюзия', 'видение', 'мираж', 'illusion', 'deception'],
  'невидимость': ['скрытность', 'маскировка', 'invisible', 'stealth'],
  'скрытность': ['невидимость', 'маскировка', 'invisible', 'stealth']
};

// Функция для получения синонимов слова
const getSynonyms = (word: string): string[] => {
  const lowerWord = word.toLowerCase();
  return spellSynonyms[lowerWord] || [];
};

// Функция для разбора поискового запроса
const parseSearchQuery = (query: string): string[] => {
  const words = query.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0);
  const expandedWords = new Set(words);
  
  // Добавляем синонимы для каждого слова
  words.forEach(word => {
    const synonyms = getSynonyms(word);
    synonyms.forEach(synonym => expandedWords.add(synonym));
  });
  
  return Array.from(expandedWords);
};

// Функция для подсчета релевантности заклинания
const calculateSpellRelevance = (spell: SpellData, searchWords: string[]): number => {
  let totalScore = 0;
  let maxPossibleScore = searchWords.length;
  
  searchWords.forEach(searchWord => {
    let bestScore = 0;
    
    // Проверяем название заклинания
    const nameWords = spell.name.toLowerCase().split(/\s+/);
    nameWords.forEach(nameWord => {
      const similarity = calculateSimilarity(searchWord, nameWord);
      if (similarity > 0.7) { // Порог схожести
        bestScore = Math.max(bestScore, similarity * 3); // Название важнее
      }
    });
    
    // Проверяем описание
    if (typeof spell.description === 'string') {
      const descWords = spell.description.toLowerCase().split(/\s+/);
      descWords.forEach(descWord => {
        const similarity = calculateSimilarity(searchWord, descWord);
        if (similarity > 0.8) { // Более строгий порог для описания
          bestScore = Math.max(bestScore, similarity);
        }
      });
    }
    
    // Проверяем школу магии
    if (spell.school) {
      const similarity = calculateSimilarity(searchWord, spell.school.toLowerCase());
      if (similarity > 0.7) {
        bestScore = Math.max(bestScore, similarity * 2);
      }
    }
    
    // Проверяем компоненты
    if (spell.components) {
      const similarity = calculateSimilarity(searchWord, spell.components.toLowerCase());
      if (similarity > 0.8) {
        bestScore = Math.max(bestScore, similarity);
      }
    }
    
    // Проверяем классы
    if (Array.isArray(spell.classes)) {
      spell.classes.forEach(cls => {
        const similarity = calculateSimilarity(searchWord, cls.toLowerCase());
        if (similarity > 0.7) {
          bestScore = Math.max(bestScore, similarity * 1.5);
        }
      });
    }
    
    totalScore += bestScore;
  });
  
  return totalScore / maxPossibleScore;
};

export const useFuzzySearch = (spells: SpellData[], searchQuery: string, threshold: number = 0.3) => {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return spells;
    }
    
    const searchWords = parseSearchQuery(searchQuery);
    
    // Вычисляем релевантность для каждого заклинания
    const spellesWithRelevance = spells.map(spell => ({
      spell,
      relevance: calculateSpellRelevance(spell, searchWords)
    }));
    
    // Фильтруем по порогу релевантности и сортируем
    return spellesWithRelevance
      .filter(item => item.relevance >= threshold)
      .sort((a, b) => b.relevance - a.relevance)
      .map(item => item.spell);
  }, [spells, searchQuery, threshold]);
};

export default useFuzzySearch;
