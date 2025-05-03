
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
import { level4_part2 } from "./level4_part2";
import { level4_part3 } from "./level4_part3";
import { level5 } from "./level5";
import { level6 } from "./level6";
import { level7 } from "./level7";
import { level8 } from "./level8";
import { level9 } from "./level9";
import { CharacterSpell } from "@/types/character";

// Combine all spell levels into a single array
export const spells: CharacterSpell[] = [
  ...cantrips,
  ...level1,
  ...level2,
  ...level3,
  ...level3_combat,
  ...level3_divination,
  ...level3_enchant,
  ...level3_illusion,
  ...level3_more,
  ...level3_utility,
  ...level4,
  ...level4_part2,
  ...level4_part3,
  ...level5,
  ...level6,
  ...level7,
  ...level8,
  ...level9
];

// Get spells by level
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return spells.filter(spell => spell.level === level);
};

// Convert spell level to text
export const spellLevelToText = (level: number): string => {
  if (level === 0) return "Заговор";
  return `${level}-й уровень`;
};

// Get spells by class
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  if (!className) return [];
  
  const normalizedClassName = className ? className.toLowerCase() : '';
  
  return spells.filter((spell) => {
    if (!spell.classes) return false;
    
    // Safely handle potentially undefined classes array
    return spell.classes.some(
      (spellClass) => 
        spellClass && 
        typeof spellClass === 'string' && 
        spellClass.toLowerCase() === normalizedClassName
    );
  });
};

// Get spell details by name
export const getSpellDetails = (spellName: string): CharacterSpell | undefined => {
  if (!spellName) return undefined;
  
  return spells.find(
    (spell) => spell && spell.name && spell.name.toLowerCase() === (spellName?.toLowerCase() || '')
  );
};

// Get spells by school
export const getSpellsBySchool = (school: string): CharacterSpell[] => {
  if (!school) return [];
  
  return spells.filter(
    (spell) => spell && spell.school && spell.school.toLowerCase() === school.toLowerCase()
  );
};

// Get available spell schools
export const getSpellSchools = (): string[] => {
  const schools = new Set<string>();
  
  spells.forEach(spell => {
    if (spell.school) {
      schools.add(spell.school);
    }
  });
  
  return Array.from(schools);
};
