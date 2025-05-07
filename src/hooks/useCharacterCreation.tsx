import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';
import {
  initialAbilityScores,
  calculateModifier,
  calculateSkillCheckBonus,
  calculateArmorClass,
  calculateMaxHP,
  calculateProficiencyBonus,
} from '@/utils/characterUtils';
import {
  availableRacesData,
  availableClassesData,
  availableBackgroundsData,
  availableAlignments,
  availableSkills,
  availableLanguages,
  availableEquipment,
} from '@/data/characterCreationData';

const defaultCharacterState: Character = {
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
  hitPoints: 0,
  maxHitPoints: 0,
  temporaryHitPoints: 0,
  proficiencyBonus: 2,
  abilities: initialAbilityScores,
  savingThrows: {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  },
  skills: {},
  equipment: [],
  proficiencies: {
    armor: [],
    weapons: [],
    tools: [],
    languages: [],
  },
  features: [],
  spells: [],
  spellSlots: {},
  resources: {},
  notes: '',
  age: 0,
  height: '',
  weight: '',
  eyes: '',
  skin: '',
  hair: '',
  personalityTraits: '',
  ideals: '',
  bonds: '',
  flaws: '',
  backstory: '',
  isNPC: false,
  isTemplate: false,
  campaignId: '',
  userId: '',
  creationDate: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
};

const useCharacterCreation = () => {
  const [form, setForm] = useState<Character>(defaultCharacterState);
  const [availableRaces, setAvailableRaces] = useState(availableRacesData);
  const [availableClasses, setAvailableClasses] = useState(availableClassesData);
  const [availableBackgrounds, setAvailableBackgrounds] = useState(availableBackgroundsData);
  const [availableSkillsList, setAvailableSkillsList] = useState(availableSkills);
  const [availableLanguagesList, setAvailableLanguagesList] = useState(availableLanguages);
  const [availableEquipmentList, setAvailableEquipmentList] = useState(availableEquipment);
  const [availableAlignmentsList, setAvailableAlignmentsList] = useState(availableAlignments);
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [selectedAlignment, setSelectedAlignment] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>('1');
  const { toast } = useToast();

  useEffect(() => {
    resetForm();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleAbilityChange = (ability: string, value: number) => {
    setForm(prevForm => {
      const updatedAbilities = {
        ...prevForm.abilities,
        [ability]: value,
      };

      const strModifier = calculateModifier(updatedAbilities.strength);
      const dexModifier = calculateModifier(updatedAbilities.dexterity);
      const conModifier = calculateModifier(updatedAbilities.constitution);
      const intModifier = calculateModifier(updatedAbilities.intelligence);
      const wisModifier = calculateModifier(updatedAbilities.wisdom);
      const chaModifier = calculateModifier(updatedAbilities.charisma);

      const updatedSavingThrows = {
        strength: strModifier,
        dexterity: dexModifier,
        constitution: conModifier,
        intelligence: intModifier,
        wisdom: wisModifier,
        charisma: chaModifier,
      };

      const updatedSkills = {
        ...prevForm.skills,
        acrobatics: calculateSkillCheckBonus(dexModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('acrobatics')),
        animalHandling: calculateSkillCheckBonus(wisModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('animalHandling')),
        arcana: calculateSkillCheckBonus(intModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('arcana')),
        athletics: calculateSkillCheckBonus(strModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('athletics')),
        deception: calculateSkillCheckBonus(chaModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('deception')),
        history: calculateSkillCheckBonus(intModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('history')),
        insight: calculateSkillCheckBonus(wisModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('insight')),
        intimidation: calculateSkillCheckBonus(chaModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('intimidation')),
        investigation: calculateSkillCheckBonus(intModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('investigation')),
        medicine: calculateSkillCheckBonus(wisModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('medicine')),
        nature: calculateSkillCheckBonus(intModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('nature')),
        perception: calculateSkillCheckBonus(wisModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('perception')),
        performance: calculateSkillCheckBonus(chaModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('performance')),
        persuasion: calculateSkillCheckBonus(chaModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('persuasion')),
        religion: calculateSkillCheckBonus(intModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('religion')),
        sleightOfHand: calculateSkillCheckBonus(dexModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('sleightOfHand')),
        stealth: calculateSkillCheckBonus(dexModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('stealth')),
        survival: calculateSkillCheckBonus(wisModifier, prevForm.proficiencyBonus, prevForm.proficiencies.tools.includes('survival')),
      };

      return {
        ...prevForm,
        abilities: updatedAbilities,
        savingThrows: updatedSavingThrows,
        skills: updatedSkills,
      };
    });
  };

  const updateRace = (raceValue: string) => {
    setSelectedRace(raceValue);
    setForm(prevForm => ({
      ...prevForm,
      race: raceValue,
    }));
  };

  const updateClassAndSubclass = (classValue: string) => {
    setSelectedClass(classValue);
    setForm(prevForm => ({
      ...prevForm,
      class: classValue,
    }));

    const levelNum = parseInt(selectedLevel || '1', 10);

    const additionalClasses = availableClasses.find(
      c => c.name.toLowerCase() === classValue.toLowerCase()
    );

    if (additionalClasses) {
      const classLevel = parseInt(additionalClasses.level, 10) || 1;
      const proficiencyBonus = calculateProficiencyBonus(classLevel);
      const hitDice = additionalClasses.hitDice;
      const hitPoints = calculateMaxHP(hitDice, calculateModifier(prevForm.abilities.constitution), classLevel);
      const savingThrows = additionalClasses.savingThrows;
      const skills = additionalClasses.skills;
      const equipment = additionalClasses.equipment;
      const proficiencies = additionalClasses.proficiencies;
      const features = additionalClasses.features;

      return {
        ...prevForm,
        class: classValue,
        level: classLevel,
        proficiencyBonus: proficiencyBonus,
        hitDice: hitDice,
        hitPoints: hitPoints,
        maxHitPoints: hitPoints,
        savingThrows: savingThrows,
        skills: skills,
        equipment: equipment,
        proficiencies: proficiencies,
        features: features,
      };
    }

    return prevForm;
  };

  const updateBackground = (backgroundValue: string) => {
    setSelectedBackground(backgroundValue);
    setForm(prevForm => ({
      ...prevForm,
      background: backgroundValue,
    }));

    const additionalBackground = availableBackgrounds.find(
      b => b.name.toLowerCase() === backgroundValue.toLowerCase()
    );

    if (additionalBackground) {
      const skills = additionalBackground.skills;
      const equipment = additionalBackground.equipment;
      const languages = additionalBackground.languages;
      const features = additionalBackground.features;

      return {
        ...prevForm,
        skills: skills,
        equipment: equipment,
        proficiencies: {
          ...prevForm.proficiencies,
          languages: languages,
        },
        features: features,
      };
    }

    return prevForm;
  };

  const updateAlignment = (alignmentValue: string) => {
    setSelectedAlignment(alignmentValue);
    setForm(prevForm => ({
      ...prevForm,
      alignment: alignmentValue,
    }));
  };

  const getAdditionalRace = (race: string) => {
    const additionalRace = availableRaces.find(
      r => r.name.toLowerCase() === race.toLowerCase()
    );

    if (additionalRace && additionalRace.class) {
      const classStr = String(additionalRace.class) || '';
      return classStr;
    }

    return null;
  };

  const resetForm = () => {
    const currentLevel = parseInt(selectedLevel || '1', 10);
    setForm(prevForm => ({
      ...defaultCharacterState,
      id: uuidv4(),
      level: currentLevel,
    }));
  };

  return {
    form,
    availableRaces,
    availableClasses,
    availableBackgrounds,
    availableSkillsList,
    availableLanguagesList,
    availableEquipmentList,
    availableAlignmentsList,
    selectedRace,
    selectedClass,
    selectedBackground,
    selectedAlignment,
    selectedLevel,
    handleChange,
    handleAbilityChange,
    updateRace,
    updateClassAndSubclass,
    updateBackground,
    updateAlignment,
    getAdditionalRace,
    resetForm,
    setSelectedLevel,
  };
};

export default useCharacterCreation;
