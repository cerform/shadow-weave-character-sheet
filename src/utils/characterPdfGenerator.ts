import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Character } from '@/types/character';

const FONT = 'Roboto-Regular';
const FONT_BOLD = 'Roboto-Bold';

const addHeader = (doc: jsPDF, text: string, y: number) => {
  doc.setFont(FONT_BOLD, 'normal');
  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text(text, 15, y);
  return y + 10;
};

const addSubHeader = (doc: jsPDF, text: string, y: number) => {
  doc.setFont(FONT_BOLD, 'normal');
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text(text, 15, y);
  return y + 8;
};

const addText = (doc: jsPDF, text: string, x: number, y: number) => {
  doc.setFont(FONT, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text(text, x, y);
};

const addSkill = (doc: jsPDF, skill: any, y: number) => {
  doc.setFont(FONT, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40);
  let skillText = `${skill.name} (${skill.ability}): `;

  if (skill.proficient && skill.bonus > 0) {
    skillText += `+${skill.bonus}`;
  } else {
    skillText += 'Не владеет';
  }

  doc.text(skillText, 15, y);
  return y + 6;
};

const addSavingThrow = (doc: jsPDF, savingThrow: any, y: number) => {
  doc.setFont(FONT, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40);
  let savingThrowText = `${savingThrow.ability}: `;

  if (savingThrow.proficient && savingThrow.bonus > 0) {
    savingThrowText += `+${savingThrow.bonus}`;
  } else {
    savingThrowText += 'Не владеет';
  }

  doc.text(savingThrowText, 115, y);
  return y + 6;
};

const generateCharacterPdf = (character: Character) => {
  const doc = new jsPDF();

  // Register fonts
  doc.addFont('Roboto-Regular.ttf', FONT, 'normal');
  doc.addFont('Roboto-Bold.ttf', FONT_BOLD, 'normal');

  let y = 20;

  // Character Info
  doc.setFont(FONT_BOLD, 'normal');
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text(character.name, 15, y);
  y += 12;

  addText(doc, `Класс: ${character.class}`, 15, y);
  addText(doc, `Уровень: ${character.level}`, 65, y);
  addText(doc, `Раса: ${character.race}`, 115, y);
  y += 8;

  // Abilities
  y = addHeader(doc, 'Характеристики', y);
  addText(doc, `Сила: ${character.abilities?.strength}`, 15, y);
  addText(doc, `Ловкость: ${character.abilities?.dexterity}`, 65, y);
  addText(doc, `Телосложение: ${character.abilities?.constitution}`, 115, y);
  y += 8;
  addText(doc, `Интеллект: ${character.abilities?.intelligence}`, 15, y);
  addText(doc, `Мудрость: ${character.abilities?.wisdom}`, 65, y);
  addText(doc, `Харизма: ${character.abilities?.charisma}`, 115, y);
  y += 10;

  // Skills
  y = addHeader(doc, 'Навыки', y);
  let skillY = y;
  let savingThrowY = y;

  if (character.skills) {
    character.skills.forEach((skill, index) => {
      if (index < 9) {
        skillY = addSkill(doc, skill, skillY);
      }
    });
  }

  if (character.savingThrows) {
    character.savingThrows.forEach((savingThrow, index) => {
      if (index < 6) {
        savingThrowY = addSavingThrow(doc, savingThrow, savingThrowY);
      }
    });
  }

  y = Math.max(skillY, savingThrowY) + 5;

  // Proficiencies
  y = addHeader(doc, 'Владения', y);
  let proficienciesText = '';

  if (character.proficiencies?.languages && character.proficiencies.languages.length > 0) {
    proficienciesText += `Языки: ${character.proficiencies.languages.join(', ')}\n`;
  }

  if (character.proficiencies?.armor && character.proficiencies.armor.length > 0) {
    proficienciesText += `Доспехи: ${character.proficiencies.armor.join(', ')}\n`;
  }

  if (character.proficiencies?.weapons && character.proficiencies.weapons.length > 0) {
    proficienciesText += `Оружие: ${character.proficiencies.weapons.join(', ')}\n`;
  }

  if (character.proficiencies?.tools && character.proficiencies.tools.length > 0) {
    proficienciesText += `Инструменты: ${character.proficiencies.tools.join(', ')}\n`;
  }

  addText(doc, proficienciesText, 15, y);
  y += 20;

  // Spells
  if (character.spells && character.spells.length > 0) {
    y = addHeader(doc, 'Заклинания', y);
    character.spells.forEach((spell, index) => {
      const spellText = `${spell.name} (Уровень ${spell.level})`;
      addText(doc, spellText, 15, y);
      y += 6;
    });
  }

  // Equipment
  if (character.equipment && character.equipment.length > 0) {
    y = addHeader(doc, 'Снаряжение', y);
    character.equipment.forEach((item, index) => {
      addText(doc, item, 15, y);
      y += 6;
    });
  }

  // Backstory
  if (character.backstory) {
    y = addHeader(doc, 'Предыстория', y);
    const backstoryLines = doc.splitTextToSize(character.backstory, 170);
    backstoryLines.forEach(line => {
      addText(doc, line, 15, y);
      y += 6;
    });
  }

  // Feats
  if (character.feats && character.feats.length > 0) {
    y = addHeader(doc, 'Черты', y);
    character.feats.forEach((feat, index) => {
      addText(doc, feat, 15, y);
      y += 6;
    });
  }

  // Save the PDF
  doc.save(`${character.name}.pdf`);
};

export default generateCharacterPdf;
