
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
  hitPoints: {
    current: 0,
    maximum: 0,
    temporary: 0
  },
  proficiencyBonus: 2,
  abilities: initialAbilityScores,
  savingThrows: {
    strength: false,
    dexterity: false,
    constitution: false,
    intelligence: false,
    wisdom: false,
    charisma: false,
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

export const useCharacterCreation = () => {
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
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
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

      // Создадим безопасную версию объекта proficiencies для доступа к tools
      const safeProficiencies = prevForm.proficiencies || { tools: [], weapons: [], armor: [], languages: [] };
      const tools = Array.isArray(safeProficiencies.tools) ? safeProficiencies.tools : [];

      const updatedSavingThrows = {
        strength: false,
        dexterity: false,
        constitution: false,
        intelligence: false,
        wisdom: false,
        charisma: false,
      };

      // Обновляем безопасно, предполагая что skills может быть объектом
      const updatedSkills = {
        ...prevForm.skills,
        // Безопасно проверяем наличие навыка в списке владений
        acrobatics: tools.includes('acrobatics'),
        animalHandling: tools.includes('animalHandling'),
        arcana: tools.includes('arcana'),
        athletics: tools.includes('athletics'),
        deception: tools.includes('deception'),
        history: tools.includes('history'),
        insight: tools.includes('insight'),
        intimidation: tools.includes('intimidation'),
        investigation: tools.includes('investigation'),
        medicine: tools.includes('medicine'),
        nature: tools.includes('nature'),
        perception: tools.includes('perception'),
        performance: tools.includes('performance'),
        persuasion: tools.includes('persuasion'),
        religion: tools.includes('religion'),
        sleightOfHand: tools.includes('sleightOfHand'),
        stealth: tools.includes('stealth'),
        survival: tools.includes('survival'),
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

    const additionalClass = availableClasses.find(
      c => c.name.toLowerCase() === classValue.toLowerCase()
    );

    if (additionalClass) {
      // Преобразуем строковый уровень в число
      const classLevel = parseInt(additionalClass.level || '1', 10);
      const proficiencyBonus = calculateProficiencyBonus(classLevel);
      const hitDice = additionalClass.hitDice;
      
      // Обеспечиваем безопасный доступ к abilities prevForm
      const constitutionMod = calculateModifier(prevForm.abilities?.constitution || 10);
      const hitPoints = calculateMaxHP(hitDice, constitutionMod, classLevel);

      // Обновляем персонажа с учетом новых типов данных
      return {
        ...prevForm,
        class: classValue,
        level: classLevel,
        proficiencyBonus: proficiencyBonus,
        hitDice: hitDice,
        hitPoints: {
          current: hitPoints,
          maximum: hitPoints,
          temporary: 0
        },
        // Оставшиеся поля добавляем при наличии соответствующих данных у класса
        // ...(additionalClasses.savingThrows ? { savingThrows: additionalClasses.savingThrows } : {}),
        // ...(additionalClasses.skills ? { skills: additionalClasses.skills } : {}),
        // ...(additionalClasses.equipment ? { equipment: additionalClasses.equipment } : {}),
        // ...(additionalClasses.proficiencies ? { proficiencies: additionalClasses.proficiencies } : {}),
        // ...(additionalClasses.features ? { features: additionalClasses.features } : {})
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
      // Безопасно обновляем персонажа, только если данные доступны
      return {
        ...prevForm,
        background: backgroundValue,
        // ...(additionalBackground.skills ? { skills: { ...prevForm.skills, ...additionalBackground.skills } } : {}),
        // ...(additionalBackground.equipment ? { 
        //   equipment: [...(prevForm.equipment || []), ...(additionalBackground.equipment || [])] 
        // } : {}),
        // proficiencies: {
        //   ...prevForm.proficiencies,
        //   ...(additionalBackground.languages ? { languages: additionalBackground.languages } : {})
        // },
        // ...(additionalBackground.features ? { 
        //   features: [...(prevForm.features || []), ...(additionalBackground.features || [])]
        // } : {})
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

    if (additionalRace && additionalRace.id) {
      return additionalRace.id;
    }

    return null;
  };

  const resetForm = () => {
    setForm(prevForm => ({
      ...defaultCharacterState,
      id: uuidv4(),
      level: selectedLevel,
    }));
  };
  
  // Add isMagicClass functionality
  const isMagicClass = () => {
    const magicClasses = ["волшебник", "жрец", "бард", "чародей", "колдун", "друид", "паладин", "следопыт"];
    return magicClasses.some(c => form.class.toLowerCase().includes(c.toLowerCase()));
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
    isMagicClass,
  };
};

export default useCharacterCreation;
