
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

// Компилируем все заклинания в единый массив для удобства
export const spells: CharacterSpell[] = [
  ...(Object.values(level0) || []),
  ...(Object.values(level1) || []),
  ...(Object.values(level2) || []),
  ...(Object.values(level3) || []),
  ...(Object.values(level4) || []),
  ...(Object.values(level5) || []),
  ...(Object.values(level6) || []),
  ...(Object.values(level7) || []),
  ...(Object.values(level8) || []),
  ...(Object.values(level9) || []),
].map(spell => ({
  ...spell,
  // Гарантируем обязательное поле prepared
  prepared: false
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
    const levelSpells = Object.values(spellsByLevel[level as keyof typeof spellsByLevel] || {}) as any[];
    
    for (const spell of levelSpells) {
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
  return Object.values(spellsByLevel[levelKey] || {}) as CharacterSpell[];
};

export const getSpellByName = (name: string): CharacterSpell | undefined => {
  for (let level = 0; level <= 9; level++) {
    const levelSpells = Object.values(spellsByLevel[level as keyof typeof spellsByLevel] || {}) as CharacterSpell[];
    const spell = levelSpells.find((s: any) => s.name === name);
    if (spell) {
      return spell;
    }
  }
  return undefined;
};
