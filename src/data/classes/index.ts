
// Import only the class files that exist already
import rangerClassData from './ranger';
import sorcererClassData from './sorcerer';
import monkClassData from './monk';
import artificerClassData from './artificer';
import barbarianClassData from './barbarian';

// Define placeholder data for missing class files
const bardClassData = {
  name: "Бард",
  englishName: "Bard",
  // Add basic placeholder data
  hitDice: "1d8",
  primaryAbility: "CHA"
};

const clericClassData = {
  name: "Жрец",
  englishName: "Cleric",
  // Add basic placeholder data
  hitDice: "1d8",
  primaryAbility: "WIS"
};

const druidClassData = {
  name: "Друид",
  englishName: "Druid",
  // Add basic placeholder data
  hitDice: "1d8",
  primaryAbility: "WIS"
};

const fighterClassData = {
  name: "Воин",
  englishName: "Fighter",
  // Add basic placeholder data
  hitDice: "1d10",
  primaryAbility: "STR"
};

const paladinClassData = {
  name: "Паладин",
  englishName: "Paladin",
  // Add basic placeholder data
  hitDice: "1d10",
  primaryAbility: "STR"
};

const rogueClassData = {
  name: "Плут",
  englishName: "Rogue",
  // Add basic placeholder data
  hitDice: "1d8",
  primaryAbility: "DEX"
};

const warlockClassData = {
  name: "Колдун",
  englishName: "Warlock",
  // Add basic placeholder data
  hitDice: "1d8",
  primaryAbility: "CHA"
};

const wizardClassData = {
  name: "Волшебник",
  englishName: "Wizard",
  // Add basic placeholder data
  hitDice: "1d6",
  primaryAbility: "INT"
};

export const classData = {
  "Бард": bardClassData,
  "Жрец": clericClassData,
  "Друид": druidClassData,
  "Воин": fighterClassData,
  "Паладин": paladinClassData,
  "Следопыт": rangerClassData,
  "Плут": rogueClassData,
  "Чародей": sorcererClassData,
  "Колдун": warlockClassData,
  "Волшебник": wizardClassData,
  "Монах": monkClassData,
  "Изобретатель": artificerClassData,
  "Варвар": barbarianClassData,
  // Английские названия для совместимости
  "Bard": bardClassData,
  "Cleric": clericClassData,
  "Druid": druidClassData,
  "Fighter": fighterClassData,
  "Paladin": paladinClassData,
  "Ranger": rangerClassData,
  "Rogue": rogueClassData,
  "Sorcerer": sorcererClassData,
  "Warlock": warlockClassData,
  "Wizard": wizardClassData,
  "Monk": monkClassData,
  "Artificer": artificerClassData,
  "Barbarian": barbarianClassData
};

export default classData;

export {
  bardClassData,
  clericClassData,
  druidClassData,
  fighterClassData,
  paladinClassData,
  rangerClassData,
  rogueClassData,
  sorcererClassData,
  warlockClassData,
  wizardClassData,
  monkClassData,
  artificerClassData,
  barbarianClassData
};
