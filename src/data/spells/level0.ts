
import { CharacterSpell } from '@/types/character';
import cantrips from './cantrips';

// Уровень 0 - это заговоры, поэтому здесь пусто,
// все заговоры находятся в файле cantrips.ts
export const level0: CharacterSpell[] = cantrips;

export default level0;
