/**
 * Преобразует строку в slug-формат (для URL или ID)
 * @param text Текст для преобразования
 * @returns Преобразованная строка в формате slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Безопасно преобразует значение в строку
 * @param value Значение для преобразования
 * @returns Строковое представление значения или пустая строка
 */
export function safeToString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}
