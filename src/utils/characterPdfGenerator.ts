import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CharacterSheet } from '@/types/character';

const FONT = 'Roboto-Regular';
const FONT_BOLD = 'Roboto-Bold';

const addHeader = (doc, text) => {
  doc.setFont(FONT_BOLD, 'normal');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(text, 14, doc.y + 10);
  doc.y += 12;
};

const addSubHeader = (doc, text) => {
  doc.setFont(FONT_BOLD, 'normal');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(text, 14, doc.y + 8);
  doc.y += 10;
};

const addParagraph = (doc, text) => {
  doc.setFont(FONT, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const lines = doc.splitTextToSize(text, 180);
  lines.forEach(line => {
    doc.text(line, 14, doc.y + 6);
    doc.y += 5;
  });
  doc.y += 5;
};

const addKeyValuePair = (doc, key, value) => {
  doc.setFont(FONT_BOLD, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`${key}:`, 14, doc.y + 6);

  doc.setFont(FONT, 'normal');
  doc.setFontSize(10);
  doc.text(value, 40, doc.y + 6);
  doc.y += 6;
};

const addSectionTitle = (doc, title) => {
  doc.setFont(FONT_BOLD, 'normal');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(220, 220, 220);
  doc.rect(14, doc.y + 4, 186, 8, 'F');
  doc.text(title, 16, doc.y + 10);
  doc.y += 12;
};

const getSkillBonus = (character, skillName) => {
  if (!character.skills || !character.skills[skillName]) return 0;
  const skill = character.skills[skillName];
  if (typeof skill === 'object' && skill.bonus !== undefined) {
    return skill.bonus;
  }
  return 0;
};

const isProficientInSkill = (character, skillName) => {
  if (!character.skills || !character.skills[skillName]) return false;
  const skill = character.skills[skillName];
  if (typeof skill === 'object' && skill.proficient !== undefined) {
    return skill.proficient;
  }
  return false;
};

const countProficienciesOfType = (character, type) => {
  if (!character.proficiencies) return 0;
  const proficiencies = character.proficiencies;
  
  if (Array.isArray(proficiencies)) {
    return proficiencies.length;
  }
  
  if (typeof proficiencies === 'object' && proficiencies[type] && Array.isArray(proficiencies[type])) {
    return proficiencies[type].length;
  }
  
  return 0;
};

const getProficienciesOfType = (character, type) => {
  if (!character.proficiencies) return [];
  const proficiencies = character.proficiencies;
  
  if (Array.isArray(proficiencies)) {
    return proficiencies;
  }
  
  if (typeof proficiencies === 'object' && proficiencies[type] && Array.isArray(proficiencies[type])) {
    return proficiencies[type];
  }
  
  return [];
};

const drawAbilities = (doc, character, startX, startY) => {
  doc.y = startY;
  doc.x = startX;
  addSectionTitle(doc, 'Характеристики');

  const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  abilities.forEach(ability => {
    const value = character.abilities[ability];
    const modifier = Math.floor((value - 10) / 2);
    addKeyValuePair(doc, ability, `${value} (${modifier > 0 ? '+' : ''}${modifier})`);
  });
};

const drawSkills = (doc, character, startX, startY) => {
  doc.y = startY;
  doc.x = startX;
  addSectionTitle(doc, 'Навыки');

  const skills = {
    'Акробатика': 'DEX',
    'Анализ': 'INT',
    'Атлетика': 'STR',
    'Внимательность': 'WIS',
    'Выживание': 'WIS',
    'Выступление': 'CHA',
    'Запугивание': 'CHA',
    'История': 'INT',
    'Ловкость рук': 'DEX',
    'Медицина': 'WIS',
    'Магия': 'INT',
    'Обман': 'CHA',
    'Природа': 'INT',
    'Проницательность': 'WIS',
    'Религия': 'INT',
    'Скрытность': 'DEX',
    'Убеждение': 'CHA',
    'Уход за животными': 'WIS'
  };

  Object.keys(skills).forEach(skillName => {
    const ability = skills[skillName];
    let value = character.abilities[ability] ? Math.floor((character.abilities[ability] - 10) / 2) : 0;
    
    if (isProficientInSkill(character, skillName)) {
      value += 2;
    }
    
    if (getSkillBonus(character, skillName) > value) {
      value = getSkillBonus(character, skillName);
    }

    doc.setFont(FONT_BOLD, 'normal');
    doc.setFontSize(10);
    doc.text(`${skillName} (${ability}):`, 14, doc.y + 6);

    doc.setFont(FONT, 'normal');
    doc.setFontSize(10);
    doc.text(`${value > 0 ? '+' : ''}${value}`, 60, doc.y + 6);
    doc.y += 6;
  });
};

const drawProficiencies = (doc, character, startX, startY) => {
  doc.y = startY;
  doc.x = startX;
  addSectionTitle(doc, 'Владения');

  addSubHeader(doc, 'Доспехи');
  let armorText = '';
  if (countProficienciesOfType(character, 'armor') > 0) {
    armorText = getProficienciesOfType(character, 'armor').join(', ');
  } else {
    armorText = 'Нет';
  }
  addParagraph(doc, armorText);

  addSubHeader(doc, 'Оружие');
  let weaponText = '';
  if (countProficienciesOfType(character, 'weapons') > 0) {
    weaponText = getProficienciesOfType(character, 'weapons').join(', ');
  } else {
    weaponText = 'Нет';
  }
  addParagraph(doc, weaponText);

  addSubHeader(doc, 'Инструменты');
  let toolText = '';
  if (countProficienciesOfType(character, 'tools') > 0) {
    toolText = getProficienciesOfType(character, 'tools').join(', ');
  } else {
    toolText = 'Нет';
  }
  addParagraph(doc, toolText);

  addSubHeader(doc, 'Языки');
  let languageText = '';
  if (getProficienciesOfType(character, 'languages').length > 0) {
    languageText = getProficienciesOfType(character, 'languages').map(lang => lang).join(', ');
  } else {
    languageText = 'Нет';
  }
  addParagraph(doc, languageText);
};

const drawEquipment = (doc, character, startX, startY) => {
  doc.y = startY;
  doc.x = startX;
  addSectionTitle(doc, 'Снаряжение');

  if (character.equipment && character.equipment.length > 0) {
    character.equipment.forEach(item => {
      addParagraph(doc, item);
    });
  } else {
    addParagraph(doc, 'Нет снаряжения');
  }
};

const drawFeatures = (doc, character, startX, startY) => {
  doc.y = startY;
  doc.x = startX;
  addSectionTitle(doc, 'Умения и особенности');

  if (character.features && character.features.length > 0) {
    character.features.forEach(feature => {
      addParagraph(doc, feature);
    });
  } else {
    addParagraph(doc, 'Нет умений и особенностей');
  }
};

const drawSpells = (doc, character, startX, startY) => {
  doc.y = startY;
  doc.x = startX;
  addSectionTitle(doc, 'Заклинания');

  if (character.spells && character.spells.length > 0) {
    character.spells.forEach(spell => {
      addParagraph(doc, spell);
    });
  } else {
    addParagraph(doc, 'Нет заклинаний');
  }
};

const generateCharacterPdf = (character: CharacterSheet) => {
  const doc = new jsPDF();
  doc.addFont(FONT, 'Roboto-Regular', 'normal');
  doc.addFont(FONT_BOLD, 'Roboto-Bold', 'normal');

  doc.setFillColor(240, 240, 240);
  doc.rect(0, 0, 210, 297, 'F');

  doc.y = 14;

  addHeader(doc, character.name);
  addKeyValuePair(doc, 'Класс', character.class || 'Не указано');
  addKeyValuePair(doc, 'Уровень', character.level ? character.level.toString() : '1');
  addKeyValuePair(doc, 'Раса', character.race || 'Не указана');
  addKeyValuePair(doc, 'Предыстория', character.background || 'Не указана');
  addKeyValuePair(doc, 'Мировоззрение', character.alignment || 'Не указано');

  let startAbilitiesY = doc.y;
  drawAbilities(doc, character, 14, startAbilitiesY);

  let startSkillsY = startAbilitiesY;
  drawSkills(doc, character, 105, startSkillsY);

  doc.addPage();
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 0, 210, 297, 'F');
  doc.y = 14;

  let startProficienciesY = doc.y;
  drawProficiencies(doc, character, 14, startProficienciesY);

  let startEquipmentY = startProficienciesY;
  drawEquipment(doc, character, 105, startEquipmentY);

  doc.addPage();
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 0, 210, 297, 'F');
  doc.y = 14;

  let startFeaturesY = doc.y;
  drawFeatures(doc, character, 14, startFeaturesY);

  let startSpellsY = startFeaturesY;
  drawSpells(doc, character, 105, startSpellsY);

  return doc.output('datauristring');
};

export default generateCharacterPdf;
