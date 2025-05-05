
import { CharacterSpell } from './character';

// Интерфейс для данных о заклинании
export interface SpellData {
  id?: string | number;
  name: string;
  name_en?: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes?: string[] | string;
  source?: string;
  isRitual?: boolean;
  isConcentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  higherLevel?: string;
  higherLevels?: string;
  prepared?: boolean;
}

// Конвертация CharacterSpell в SpellData
export const convertCharacterSpellToSpellData = (characterSpell: CharacterSpell | string): SpellData => {
  if (typeof characterSpell === 'string') {
    return {
      name: characterSpell,
      level: 0,
      school: "Неизвестная",
      castingTime: "1 действие",
      range: "Неизвестная",
      components: "",
      duration: "Мгновенная",
      description: ""
    };
  }
  
  return {
    ...characterSpell,
    school: characterSpell.school || "Неизвестная",
    castingTime: characterSpell.castingTime || "1 действие",
    range: characterSpell.range || "Неизвестная",
    components: characterSpell.components || "",
    duration: characterSpell.duration || "Мгновенная",
    description: characterSpell.description || "",
    isRitual: characterSpell.ritual,
    isConcentration: characterSpell.concentration,
    higherLevel: characterSpell.higherLevels
  };
};

// Конвертация SpellData в CharacterSpell
export const convertSpellDataToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    ...spellData,
    ritual: spellData.isRitual || spellData.ritual,
    concentration: spellData.isConcentration || spellData.concentration,
    higherLevels: spellData.higherLevel || spellData.higherLevels,
    description: typeof spellData.description === 'string' ? 
                spellData.description : 
                Array.isArray(spellData.description) ?
                spellData.description.join('\n') : ''
  };
};
