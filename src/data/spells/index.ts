import { CharacterSpell } from "@/types/character";
import { level0Spells } from "./level0";
import { level1Spells } from "./level1";
import { level2Spells } from "./level2";
import { level3Spells } from "./level3";
import { level4Spells } from "./level4";
import { level5Spells } from "./level5";
import { level6Spells } from "./level6";
import { level7Spells } from "./level7";
import { level8Spells } from "./level8";
import { level9Spells } from "./level9";

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
    spells = [
      ...spells,
      ...Object.values(spellsByLevel[level as keyof typeof spellsByLevel]).filter(
        (spell: any) => {
          if (!spell || !spell.classes) {
            return false;
          }
          const classList = Array.isArray(spell.classes)
            ? spell.classes
            : spell.classes.split(",").map((c: string) => c.trim());
          return classList.includes(className);
        }
      ),
    ];
  }

  return spells;
};

export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  switch (level) {
    case 0:
      return Object.values(level0Spells);
    case 1:
      return Object.values(level1Spells);
    case 2:
      return Object.values(level2Spells);
    case 4:
      // Преобразуем объект в массив перед итерацией
      return Object.values(level4Spells);
    case 3:
      // Преобразуем объект в массив перед итерацией
      return Object.values(level3Spells);
    case 5:
      return Object.values(level5Spells);
    case 6:
      return Object.values(level6Spells);
    case 7:
      return Object.values(level7Spells);
    case 8:
      return Object.values(level8Spells);
    case 9:
      return Object.values(level9Spells);
  }
  return [];
};

export const getSpellByName = (name: string): CharacterSpell | undefined => {
  for (let level = 0; level <= 9; level++) {
    const spells = Object.values(spellsByLevel[level as keyof typeof spellsByLevel]);
    const spell = spells.find((s: any) => s.name === name);
    if (spell) {
      return spell;
    }
  }
  return undefined;
};
