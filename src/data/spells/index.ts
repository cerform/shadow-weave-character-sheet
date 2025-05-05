
import { CharacterSpell } from "@/types/character";
import level0 from "./level0";
import level1 from "./level1";
import level2 from "./level2";
import level3 from "./level3";
import level4 from "./level4";
import level5 from "./level5";
import level6 from "./level6";
import level7 from "./level7";
import level8 from "./level8";
import level9 from "./level9";
import cantrips from "./cantrips";

// Компилируем все заклинания в единый массив для удобства
export const spells: CharacterSpell[] = [
  ...(Array.isArray(cantrips) ? cantrips : []),
  ...(Array.isArray(level1) ? level1 : []),
  ...(Array.isArray(level2) ? level2 : []),
  ...(Array.isArray(level3) ? level3 : []),
  ...(Array.isArray(level4) ? level4 : []),
  ...(Array.isArray(level5) ? level5 : []),
  ...(Array.isArray(level6) ? level6 : []),
  ...(Array.isArray(level7) ? level7 : []),
  ...(Array.isArray(level8) ? level8 : []),
  ...(Array.isArray(level9) ? level9 : []),
].map(spell => ({
  ...spell,
  // Гарантируем обязательное поле prepared
  prepared: spell.prepared !== undefined ? spell.prepared : false
})) as CharacterSpell[];

export const spellsByLevel = {
  0: level0,
  1: level1,
  2: level2,
  3: level3,
  4: level4,
  5: level5,
  6: level6,
  7: level7,
  8: level8,
  9: level9,
};

export const getSpellsByClass = (className: string): CharacterSpell[] => {
  const allClassSpells: CharacterSpell[] = [];

  for (let level = 0; level <= 9; level++) {
    const levelSpells = spellsByLevel[level as keyof typeof spellsByLevel] || [];
    
    for (const spell of (Array.isArray(levelSpells) ? levelSpells : [])) {
      // Проверяем, что spell существует и имеет свойство classes
      if (!spell || !spell.classes) {
        continue;
      }
      
      const classList = Array.isArray(spell.classes)
        ? spell.classes
        : spell.classes.split(",").map((c: string) => c.trim());
        
      if (classList.includes(className)) {
        allClassSpells.push(spell as CharacterSpell);
      }
    }
  }

  return allClassSpells;
};

export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  if (level < 0 || level > 9) return [];
  
  const levelKey = level as keyof typeof spellsByLevel;
  const levelSpells = spellsByLevel[levelKey];
  return Array.isArray(levelSpells) ? levelSpells : [];
};

export const getSpellByName = (name: string): CharacterSpell | undefined => {
  for (let level = 0; level <= 9; level++) {
    const levelSpells = spellsByLevel[level as keyof typeof spellsByLevel] || [];
    if (!Array.isArray(levelSpells)) continue;
    
    const spell = levelSpells.find((s) => s.name === name);
    if (spell) {
      return spell;
    }
  }
  return undefined;
};
