/**
 * Генерирует случайный уникальный идентификатор (UUID)
 * Использует стандартный Web Crypto API для совместимости с базой данных
 */
export const generateRandomId = (): string => {
  return crypto.randomUUID();
};
