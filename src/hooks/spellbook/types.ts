
import { CharacterSpell } from "@/types/character.d";

export interface SpellData {
  id?: number;
  name: string;
  level: number;
  school: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
  higherLevels?: string;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  concentration?: boolean;
  ritual?: boolean;
  classes?: string[] | string;
  prepared?: boolean;
}

// Convert between SpellData and CharacterSpell
export const convertToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    ...spellData,
    prepared: spellData.prepared || false
  };
};

export const convertToSpellData = (characterSpell: CharacterSpell): SpellData => {
  return {
    ...characterSpell,
    // Ensure school is always defined
    school: characterSpell.school || "Unknown"
  };
};
