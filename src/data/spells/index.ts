
import { cantrips } from "./cantrips";
import { level1 } from "./level1";
import { level2 } from "./level2";
import { level3 } from "./level3";
import { level3_combat } from "./level3_combat";
import { level3_divination } from "./level3_divination";
import { level3_enchant } from "./level3_enchant";
import { level3_illusion } from "./level3_illusion";
import { level3_more } from "./level3_more";
import { level3_utility } from "./level3_utility";
import { level4 } from "./level4";
import { level4Part2 } from "./level4_part2";
import { level4Part3 } from "./level4_part3";
import { level5 } from "./level5";
import { level6 } from "./level6";
import { level7 } from "./level7";
import { level8 } from "./level8";
import { level9 } from "./level9";
import { CharacterSpell } from "@/types/character";

// Combine all spells into one array
export const spells: CharacterSpell[] = [
  ...cantrips,
  ...level1,
  ...(level2 || []),
  ...(level3 || []),
  ...(level3_combat || []),
  ...(level3_divination || []),
  ...(level3_enchant || []),
  ...(level3_illusion || []),
  ...(level3_more || []),
  ...(level3_utility || []),
  ...(level4 || []),
  ...(level4Part2 || []),
  ...(level4Part3 || []),
  ...(level5 || []),
  ...(level6 || []),
  ...(level7 || []),
  ...(level8 || []),
  ...(level9 || []),
];

// Define spell levels
export const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Get spells by level
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return spells.filter((spell) => spell && spell.level === level);
};

// Get spells by class
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  return spells.filter((spell) => {
    if (!spell || !spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(
        (c) => typeof c === 'string' && c.toLowerCase() === className.toLowerCase()
      );
    } else if (typeof spell.classes === 'string') {
      return spell.classes.toLowerCase() === className.toLowerCase();
    }
    return false;
  });
};

// Get spell details by name
export const getSpellDetails = (spellName: string): CharacterSpell | undefined => {
  return spells.find(
    (spell) => spell && spell.name && spell.name.toLowerCase() === spellName.toLowerCase()
  );
};

// Get spells by school
export const getSpellsBySchool = (school: string): CharacterSpell[] => {
  return spells.filter(
    (spell) => spell && spell.school && spell.school.toLowerCase() === school.toLowerCase()
  );
};

// Get all spell schools
export const getAllSpellSchools = (): string[] => {
  const schools = new Set<string>();
  spells.forEach((spell) => {
    if (spell && spell.school) {
      schools.add(spell.school);
    }
  });
  return Array.from(schools).sort();
};

// Get all classes that can cast spells
export const getAllSpellcastingClasses = (): string[] => {
  const classes = new Set<string>();
  spells.forEach((spell) => {
    if (!spell || !spell.classes) return;
    
    if (Array.isArray(spell.classes)) {
      spell.classes.forEach((c) => {
        if (typeof c === 'string') {
          classes.add(c);
        }
      });
    } else if (typeof spell.classes === 'string') {
      classes.add(spell.classes);
    }
  });
  return Array.from(classes).sort();
};

// Экспорт всех заклинаний для совместимости с существующим кодом
export const getAllSpells = (): CharacterSpell[] => {
  return spells;
};
