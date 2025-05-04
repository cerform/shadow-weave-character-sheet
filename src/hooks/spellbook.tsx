
// Этот файл теперь просто реэкспортирует из нового модуля для обратной совместимости
import { safeSome } from '@/utils/spellUtils';
export { safeSome };
export * from './spellbook/index';
export { useSpellbook as default } from './spellbook/index';
