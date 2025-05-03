import { cantrips } from "./cantrips";
import { level1Spells } from "./level1";
import { level2Spells } from "./level2";
import { level3Spells } from "./level3";
import { level3CombatSpells } from "./level3_combat";
import { level3DivinationSpells } from "./level3_divination";
import { level3EnchantSpells } from "./level3_enchant";
import { level3IllusionSpells } from "./level3_illusion";
import { level3MoreSpells } from "./level3_more";
import { level3UtilitySpells } from "./level3_utility";
import { level4Spells } from "./level4";
import { level4Part2Spells } from "./level4_part2";
import { level4Part3Spells } from "./level4_part3";
import { level5Spells } from "./level5";
import { level6Spells } from "./level6";
import { level7Spells } from "./level7";
import { level8Spells } from "./level8";
import { level9Spells } from "./level9";
import { CharacterSpell } from "@/types/character";

// Combine all spells into one array
export const spells: CharacterSpell[] = [
  ...cantrips,
  ...level1Spells,
  ...level2Spells,
  ...level3Spells,
  ...level3CombatSpells,
  ...level3DivinationSpells,
  ...level3EnchantSpells,
  ...level3IllusionSpells,
  ...level3MoreSpells,
  ...level3UtilitySpells,
  ...level4Spells,
  ...level4Part2Spells,
  ...level4Part3Spells,
  ...level5Spells,
  ...level6Spells,
  ...level7Spells,
  ...level8Spells,
  ...level9Spells,
];

// Define spell levels
export const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Get spells by level
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return spells.filter((spell) => spell.level === level);
};

// Get spells by class
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  return spells.filter((spell) => {
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
    (spell) => spell.name.toLowerCase() === spellName.toLowerCase()
  );
};

// Get spells by school
export const getSpellsBySchool = (school: string): CharacterSpell[] => {
  return spells.filter(
    (spell) => spell.school.toLowerCase() === school.toLowerCase()
  );
};

// Get all spell schools
export const getAllSpellSchools = (): string[] => {
  const schools = new Set<string>();
  spells.forEach((spell) => {
    schools.add(spell.school);
  });
  return Array.from(schools).sort();
};

// Get all classes that can cast spells
export const getAllSpellcastingClasses = (): string[] => {
  const classes = new Set<string>();
  spells.forEach((spell) => {
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
