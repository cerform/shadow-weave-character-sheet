
import { Character } from '@/types/character';

/**
 * Обновляет владения спасбросками
 */
export function updateSavingThrowProficiencies(
  character: Character, 
  savingThrows: Record<string, boolean>
): Partial<Character> {
  return {
    savingThrows: savingThrows
  };
}

/**
 * Обновляет владения навыками
 */
export function updateSkillProficiencies(
  character: Character, 
  skillProficiencies: string[]
): Partial<Character> {
  // Обновляем профессии навыков через структуру proficiencies
  const currentProficiencies = character.proficiencies || {};
  
  if (typeof currentProficiencies === 'object' && !Array.isArray(currentProficiencies)) {
    return {
      proficiencies: {
        ...currentProficiencies,
        skills: skillProficiencies
      }
    };
  } else {
    // Если proficiencies - массив, создаем новый объект
    return {
      proficiencies: {
        skills: skillProficiencies
      }
    };
  }
}

/**
 * Обновляет навыки с экспертизой
 */
export function updateExpertise(
  character: Character, 
  expertise: string[]
): Partial<Character> {
  // Обновляем existing skills с expertise = true
  const skills = character.skills || {};
  const updatedSkills = { ...skills };
  
  // Сначала сбрасываем все expertise
  Object.keys(updatedSkills).forEach(skillKey => {
    if (updatedSkills[skillKey].expertise) {
      updatedSkills[skillKey] = {
        ...updatedSkills[skillKey],
        expertise: false
      };
    }
  });
  
  // Устанавливаем expertise для выбранных навыков
  expertise.forEach(skillKey => {
    if (updatedSkills[skillKey]) {
      updatedSkills[skillKey] = {
        ...updatedSkills[skillKey],
        expertise: true
      };
    } else {
      updatedSkills[skillKey] = {
        proficient: true,
        expertise: true
      };
    }
  });
  
  return { skills: updatedSkills };
}

/**
 * Обновляет бонусы навыков
 */
export function updateSkillBonuses(
  character: Character, 
  skillBonuses: Record<string, number>
): Partial<Character> {
  // Обновляем existing skills с bonus values
  const skills = character.skills || {};
  const updatedSkills = { ...skills };
  
  Object.entries(skillBonuses).forEach(([skillKey, bonus]) => {
    if (updatedSkills[skillKey]) {
      updatedSkills[skillKey] = {
        ...updatedSkills[skillKey],
        bonus
      };
    } else {
      updatedSkills[skillKey] = {
        proficient: false,
        bonus
      };
    }
  });
  
  return { skills: updatedSkills };
}
