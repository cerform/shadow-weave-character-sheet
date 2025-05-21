
/**
 * Генерирует случайный уникальный идентификатор
 */
export const generateRandomId = (): string => {
  return crypto.randomUUID();
};
