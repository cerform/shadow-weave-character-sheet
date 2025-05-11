
export interface Step {
  id: string;
  title: string;
  description?: string;
  requiresSubraces?: boolean;
  requiresMagicClass?: boolean;
  completed?: boolean;
}

export interface UseCreationStepConfig {
  steps: Step[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  hasSubraces?: boolean;
  isMagicClass?: boolean;
}

// Добавляем тип для особенностей, получаемых на определенном уровне
export interface LevelFeature {
  id: string;
  level: number;
  name: string;
  description: string;
  type: 'subclass' | 'ability_increase' | 'extra_attack' | 'spell_level' | 'feature';
  class?: string;
  required?: boolean;
}

// Добавляем структуру для автоматического заполнения особенностей при создании персонажа
export interface AutoFeatures {
  racial?: { [key: string]: string[] };
  class?: { [key: string]: string[] };
  background?: { [key: string]: string[] };
}

// Добавляем интерфейс для CharacterSheet, который может содержать дополнительные поля
export interface CharacterSheet extends Partial<Character> {
  abilityPointsUsed?: number;
  gender?: string;
  subrace?: string;
  maxHp?: number;
  currentHp?: number;
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

// Интерфейс хука useLevelFeatures
export interface UseLevelFeaturesResult {
  availableFeatures: LevelFeature[];
  selectedFeatures: { [key: string]: string };
  selectFeature: (featureType: string, value: string) => void;
  getHitDiceInfo: (className: string) => { dieType: string; value: string };
  getSubclassLevel: (className: string) => number;
  availableLanguages: string[];
  availableSkills: string[];
  availableTools: string[];
  availableWeaponTypes: string[];
  availableArmorTypes: string[];
  handleLanguageSelection: (language: string, selected: boolean) => void;
  handleSkillSelection: (skill: string, selected: boolean) => void;
  handleToolSelection: (tool: string, selected: boolean) => void;
  handleWeaponTypeSelection: (weaponType: string, selected: boolean) => void;
  handleArmorTypeSelection: (armorType: string, selected: boolean) => void;
}

// Импортируем необходимые типы
import { Character, Item } from './character';
