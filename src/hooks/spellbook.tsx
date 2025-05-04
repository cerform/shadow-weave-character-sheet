
// Этот файл теперь просто реэкспортирует из нового модуля для обратной совместимости
import { safeSome, safeFilter } from '@/utils/spellUtils';
export { safeSome, safeFilter };
export * from './spellbook/index';
export { useSpellbook as default } from './spellbook/index';
