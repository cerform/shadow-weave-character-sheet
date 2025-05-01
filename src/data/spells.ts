
// Этот файл теперь просто реэкспортирует из организованного модуля
export * from './spells/index';

// Для совместимости с существующим кодом
export const getSpellDetails = (spellName: string) => {
  // Импортируем все заклинания
  const { spells } = require('./spells/index');
  
  // Найти заклинание по имени
  return spells.find((spell: any) => spell.name === spellName) || null;
};
