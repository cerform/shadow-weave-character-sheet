
import { useState, useCallback } from 'react';
import { Character } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';
import * as characterCreationData from '@/data/characterCreationData';
import { 
  calculateModifier, 
  calculateSkillCheckBonus,
  calculateArmorClass,
  calculateMaxHP,
  getAbilityModifier,
  initialAbilityScores
} from '@/utils/characterUtils';

// Types for character creation form
export interface CharacterCreationForm extends Character {
  subrace?: string;
  background?: string;
  customBackground?: string;
  // Add any other specific fields for the creation form
}

export const useCharacterCreation = () => {
  const [form, setForm] = useState<Character>({
    id: uuidv4(),
    name: '',
    race: '',
    class: '',
    background: '',
    alignment: '',
    level: 1,
    experience: 0,
    armorClass: 10,
    initiative: 0,
    speed: 30,
    hitPoints: {
      current: 8,
      maximum: 8,
      temporary: 0
    },
    hitDice: {
      total: 1,
      used: 0,
      dieType: 'd8',
      value: '1d8',
      remaining: 1
    },
    deathSaves: {
      successes: 0,
      failures: 0
    },
    proficiencyBonus: 2,
    abilities: {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false, 
      charisma: false
    },
    skills: {},
    equipment: [],
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: []
    },
    features: [],
    spells: [],
    spellSlots: {},
    resources: {},
    notes: '',
    creationDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  });

  // Fetch all available races, classes and backgrounds
  const availableRaces = characterCreationData.races || [];
  const availableClasses = characterCreationData.classes || [];
  const availableBackgrounds = characterCreationData.backgrounds || [];

  // Update character form data
  const updateCharacter = useCallback((updates: Partial<Character>) => {
    setForm(prevForm => {
      // Handle class change which affects hitDice
      if (updates.class && updates.class !== prevForm.class) {
        const classInfo = availableClasses.find(c => c.name === updates.class);
        if (classInfo) {
          const hitDiceType = classInfo.hitDice || 'd8';
          const level = updates.level || prevForm.level || 1;
          const conModifier = getAbilityModifier(prevForm.abilities?.constitution || 10);
          const maxHp = calculateMaxHP(hitDiceType, conModifier, level);
          
          // Update hitDice and hitPoints
          updates.hitDice = {
            total: level,
            used: 0,
            dieType: hitDiceType,
            value: `${level}${hitDiceType}`,
            remaining: level
          };
          
          updates.hitPoints = {
            current: maxHp,
            maximum: maxHp,
            temporary: 0
          };
          
          // Update proficiency bonus based on level
          updates.proficiencyBonus = Math.ceil(1 + (level / 4));
        }
      }
      
      // Process skill proficiencies from class or background
      if (updates.proficiencies) {
        const updatedProficiencies = { 
          ...prevForm.proficiencies as any, 
          ...updates.proficiencies as any 
        };
        
        // Проверяем структуру данных и нормализуем
        if (typeof updatedProficiencies === 'object') {
          // Если структура - массив, преобразуем в объект
          if (Array.isArray(updatedProficiencies)) {
            updates.proficiencies = {
              armor: [],
              weapons: [],
              tools: [],
              languages: updatedProficiencies
            };
          } else {
            // Если структура - объект, проверяем все необходимые свойства
            const armor = Array.isArray(updatedProficiencies.armor) 
              ? updatedProficiencies.armor 
              : [];
            
            const weapons = Array.isArray(updatedProficiencies.weapons) 
              ? updatedProficiencies.weapons 
              : [];
            
            const tools = Array.isArray(updatedProficiencies.tools) 
              ? updatedProficiencies.tools 
              : [];
              
            const languages = Array.isArray(updatedProficiencies.languages) 
              ? updatedProficiencies.languages 
              : [];
            
            updates.proficiencies = {
              armor, 
              weapons,
              tools,
              languages
            };
          }
        }
      }

      // Обработка abilities для добавления алиасов
      if (updates.abilities) {
        const updatedAbilities = { ...updates.abilities };
        
        // Копируем значения из STR -> strength и наоборот
        if (updatedAbilities.STR !== undefined && updatedAbilities.strength === undefined) {
          updatedAbilities.strength = updatedAbilities.STR;
        } else if (updatedAbilities.strength !== undefined && updatedAbilities.STR === undefined) {
          updatedAbilities.STR = updatedAbilities.strength;
        }
        
        // DEX -> dexterity
        if (updatedAbilities.DEX !== undefined && updatedAbilities.dexterity === undefined) {
          updatedAbilities.dexterity = updatedAbilities.DEX;
        } else if (updatedAbilities.dexterity !== undefined && updatedAbilities.DEX === undefined) {
          updatedAbilities.DEX = updatedAbilities.dexterity;
        }
        
        // CON -> constitution
        if (updatedAbilities.CON !== undefined && updatedAbilities.constitution === undefined) {
          updatedAbilities.constitution = updatedAbilities.CON;
        } else if (updatedAbilities.constitution !== undefined && updatedAbilities.CON === undefined) {
          updatedAbilities.CON = updatedAbilities.constitution;
        }
        
        // INT -> intelligence
        if (updatedAbilities.INT !== undefined && updatedAbilities.intelligence === undefined) {
          updatedAbilities.intelligence = updatedAbilities.INT;
        } else if (updatedAbilities.intelligence !== undefined && updatedAbilities.INT === undefined) {
          updatedAbilities.INT = updatedAbilities.intelligence;
        }
        
        // WIS -> wisdom
        if (updatedAbilities.WIS !== undefined && updatedAbilities.wisdom === undefined) {
          updatedAbilities.wisdom = updatedAbilities.WIS;
        } else if (updatedAbilities.wisdom !== undefined && updatedAbilities.WIS === undefined) {
          updatedAbilities.WIS = updatedAbilities.wisdom;
        }
        
        // CHA -> charisma
        if (updatedAbilities.CHA !== undefined && updatedAbilities.charisma === undefined) {
          updatedAbilities.charisma = updatedAbilities.CHA;
        } else if (updatedAbilities.charisma !== undefined && updatedAbilities.CHA === undefined) {
          updatedAbilities.CHA = updatedAbilities.charisma;
        }
        
        updates.abilities = updatedAbilities;
      }
      
      return { ...prevForm, ...updates, lastUpdated: new Date().toISOString() };
    });
  }, [availableClasses]);

  // Check if the selected class can cast spells
  const isMagicClass = useCallback(() => {
    const magicClasses = [
      'Бард', 'Жрец', 'Друид', 'Волшебник', 'Колдун', 
      'Чародей', 'Паладин', 'Следопыт', 
      'Bard', 'Cleric', 'Druid', 'Wizard', 'Warlock', 
      'Sorcerer', 'Paladin', 'Ranger'
    ];
    return magicClasses.some(c => form.class?.toLowerCase().includes(c.toLowerCase()));
  }, [form.class]);

  // Convert the form into a full Character
  const convertToCharacter = useCallback((formData: Character): Character => {
    return {
      ...formData,
      id: formData.id || uuidv4(),
      creationDate: formData.creationDate || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      level: formData.level || 1,
      hitPoints: formData.hitPoints || { 
        current: 10, 
        maximum: 10,
        temporary: 0
      },
      hitDice: formData.hitDice || {
        total: 1,
        used: 0,
        dieType: 'd8',
        value: '1d8',
        remaining: 1
      },
      proficiencyBonus: formData.proficiencyBonus || 2
    };
  }, []);

  return {
    form,
    availableRaces,
    availableClasses,
    availableBackgrounds,
    updateCharacter,
    isMagicClass,
    convertToCharacter
  };
};

export default useCharacterCreation;
