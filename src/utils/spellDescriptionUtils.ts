
/**
 * Утилиты для обработки описаний заклинаний
 */

/**
 * Функция форматирует описание заклинания для отображения
 * @param description Описание заклинания (строка или массив строк)
 * @returns Отформатированное описание
 */
export const formatSpellDescription = (description: string | string[] | undefined): string => {
  if (!description) {
    return '';
  }
  
  // Если описание - массив строк, объединяем их с переносом строки
  if (Array.isArray(description)) {
    return description.join('\n\n');
  }
  
  // Возвращаем строку как есть
  return description;
};

/**
 * Функция преобразует описание заклинания в React-элементы с форматированием
 * @param description Описание заклинания
 * @returns Отформатированное описание с переносами строк
 */
export const renderSpellDescription = (description: string | string[] | undefined): React.ReactNode => {
  const formatted = formatSpellDescription(description);
  
  if (!formatted) {
    return null;
  }
  
  // Разбиваем на параграфы и создаем элементы
  return formatted.split('\n\n').map((paragraph, index) => (
    <p key={`p-${index}`} className="mb-2">{paragraph}</p>
  ));
};

/**
 * Преобразует текст описания для поиска и сравнения
 * @param text Исходный текст
 * @returns Нормализованный текст
 */
export const normalizeText = (text: string | undefined): string => {
  if (!text) {
    return '';
  }
  
  return text.toLowerCase().trim();
};
