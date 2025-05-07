
/**
 * Утилиты для работы с описаниями заклинаний
 */

/**
 * Преобразует описание заклинания в формат HTML
 * 
 * @param description Текстовое описание
 * @returns Отформатированный HTML
 */
export const formatSpellDescription = (description: string): string => {
  if (!description) return '';
  
  // Заменяем переносы строк на HTML параграфы
  let formattedText = description.replace(/\n\n/g, '</p><p>');
  formattedText = `<p>${formattedText}</p>`;
  
  // Форматируем списки
  formattedText = formattedText.replace(/• (.*?)(?=<\/p>|• |$)/g, '<li>$1</li>');
  formattedText = formattedText.replace(/<p>(<li>.*?<\/li>)<\/p>/g, '<ul>$1</ul>');
  
  // Выделяем заголовки
  formattedText = formattedText.replace(/<p>([^<]+?):<\/p>/g, '<h4>$1:</h4>');
  
  return formattedText;
};

/**
 * Нормализует текст для поиска
 * 
 * @param text Исходный текст
 * @returns Нормализованный текст для поиска
 */
export const normalizeText = (text: string): string => {
  if (!text) return '';
  
  // Удаляем диакритические знаки
  return text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};
