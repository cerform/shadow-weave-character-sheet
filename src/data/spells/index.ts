
import { CharacterSpell } from "@/types/character";
import level0Spells from "./level0";
import level1Spells from "./level1";
import level2Spells from "./level2";
import level3Spells from "./level3";
import level4Spells from "./level4";
import level5Spells from "./level5";
import level6Spells from "./level6";
import level7Spells from "./level7";
import level8Spells from "./level8";
import level9Spells from "./level9";

// Компилируем все заклинания в единый массив для удобства
export const spells: CharacterSpell[] = [
  ...Object.values(level0Spells),
  ...Object.values(level1Spells),
  ...Object.values(level2Spells),
  ...Object.values(level3Spells),
  ...Object.values(level4Spells),
  ...Object.values(level5Spells),
  ...Object.values(level6Spells),
  ...Object.values(level7Spells),
  ...Object.values(level8Spells),
  ...Object.values(level9Spells),
].map(spell => ({
  ...spell,
  // Гарантируем обязательное поле prepared
  prepared: false
})) as CharacterSpell[];

export const spellsByLevel = {
  0: level0Spells,
  1: level1Spells,
  2: level2Spells,
  3: level3Spells,
  4: level4Spells,
  5: level5Spells,
  6: level6Spells,
  7: level7Spells,
  8: level8Spells,
  9: level9Spells,
};

export const getSpellsByClass = (className: string): CharacterSpell[] => {
  let spells: CharacterSpell[] = [];

  for (let level = 0; level <= 9; level++) {
    const levelSpells = Object.values(spellsByLevel[level as keyof typeof spellsByLevel]);
    
    const filteredSpells = levelSpells.filter((spell: any) => {
      if (!spell || !spell.classes) {
        return false;
      }
      const classList = Array.isArray(spell.classes)
        ? spell.classes
        : spell.classes.split(",").map((c: string) => c.trim());
      return classList.includes(className);
    }) as CharacterSpell[];
    
    spells = [...spells, ...filteredSpells];
  }

  return spells;
};

export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  switch (level) {
    case 0:
      return Object.values(level0Spells) as CharacterSpell[];
    case 1:
      return Object.values(level1Spells) as CharacterSpell[];
    case 2:
      return Object.values(level2Spells) as CharacterSpell[];
    case 3:
      return Object.values(level3Spells) as CharacterSpell[];
    case 4:
      return Object.values(level4Spells) as CharacterSpell[];
    case 5:
      return Object.values(level5Spells) as CharacterSpell[];
    case 6:
      return Object.values(level6Spells) as CharacterSpell[];
    case 7:
      return Object.values(level7Spells) as CharacterSpell[];
    case 8:
      return Object.values(level8Spells) as CharacterSpell[];
    case 9:
      return Object.values(level9Spells) as CharacterSpell[];
  }
  return [];
};

export const getSpellByName = (name: string): CharacterSpell | undefined => {
  for (let level = 0; level <= 9; level++) {
    const levelSpells = Object.values(spellsByLevel[level as keyof typeof spellsByLevel]) as CharacterSpell[];
    const spell = levelSpells.find((s: any) => s.name === name);
    if (spell) {
      return spell;
    }
  }
  return undefined;
};
