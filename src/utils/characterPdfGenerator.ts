import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Character } from '@/types/character';

// Function to set font and style
const setFont = (doc: jsPDF, size: number, style: 'normal' | 'bold' = 'normal') => {
  doc.setFont('Helvetica', style);
  doc.setFontSize(size);
};

// Function to draw text
const drawText = (doc: jsPDF, text: string, x: number, y: number) => {
  doc.text(text, x, y);
};

// Function to draw a section title
const drawSectionTitle = (doc: jsPDF, title: string, x: number, y: number) => {
  setFont(doc, 14, 'bold');
  drawText(doc, title, x, y);
  doc.line(x, y + 2, x + 50, y + 2); // Underline
};

// Function to generate ability scores section
const generateAbilityScoresSection = (doc: jsPDF, character: Character, startX: number, startY: number) => {
  drawSectionTitle(doc, 'Ability Scores', startX, startY);
  const abilities = [
    { name: 'Strength', value: character.strength },
    { name: 'Dexterity', value: character.dexterity },
    { name: 'Constitution', value: character.constitution },
    { name: 'Intelligence', value: character.intelligence },
    { name: 'Wisdom', value: character.wisdom },
    { name: 'Charisma', value: character.charisma },
  ];

  let yOffset = startY + 10;
  abilities.forEach(ability => {
    setFont(doc, 12);
    drawText(doc, `${ability.name}: ${ability.value}`, startX, yOffset);
    yOffset += 6;
  });
};

// Function to generate character details section
const generateCharacterDetailsSection = (doc: jsPDF, character: Character, startX: number, startY: number) => {
  drawSectionTitle(doc, 'Character Details', startX, startY);
  let yOffset = startY + 10;

  setFont(doc, 12);
  drawText(doc, `Name: ${character.name}`, startX, yOffset);
  yOffset += 6;
  drawText(doc, `Race: ${character.race}`, startX, yOffset);
  yOffset += 6;
  drawText(doc, `Class: ${character.class}`, startX, yOffset);
  yOffset += 6;
  drawText(doc, `Level: ${character.level}`, startX, yOffset);
};

// Function to generate proficiencies section
const generateProficienciesSection = (doc: jsPDF, character: Character) => {
  const startX = 10;
  let startY = 150;

  drawSectionTitle(doc, 'Proficiencies', startX, startY);
  let yOffset = startY + 10;

  setFont(doc, 12);

  // Handle proficiencies
  if (character.proficiencies) {
    if (Array.isArray(character.proficiencies)) {
      character.proficiencies.forEach(prof => {
        drawText(doc, prof, startX, yOffset);
        yOffset += 6;
      });
    } else {
      // Handle object structure
      const profObj = character.proficiencies as { armor?: string[], weapons?: string[], tools?: string[], languages?: string[] };
      
      if (profObj.armor && Array.isArray(profObj.armor)) {
        profObj.armor.forEach(armor => {
          drawText(doc, `Armor: ${armor}`, startX, yOffset);
          yOffset += 6;
        });
      }
      
      if (profObj.weapons && Array.isArray(profObj.weapons)) {
        profObj.weapons.forEach(weapon => {
          drawText(doc, `Weapons: ${weapon}`, startX, yOffset);
          yOffset += 6;
        });
      }
      
      if (profObj.tools && Array.isArray(profObj.tools)) {
        profObj.tools.forEach(tool => {
          drawText(doc, `Tools: ${tool}`, startX, yOffset);
          yOffset += 6;
        });
      }
      
      if (profObj.languages && Array.isArray(profObj.languages)) {
        profObj.languages.forEach(language => {
          drawText(doc, `Language: ${language}`, startX, yOffset);
          yOffset += 6;
        });
      }
    }
  }
};

// Function to generate spells section
const generateSpellsSection = (doc: jsPDF, character: Character) => {
  const startX = 10;
  let startY = 200;

  drawSectionTitle(doc, 'Spells', startX, startY);
  let yOffset = startY + 10;

  setFont(doc, 12);

  if (character.spells && character.spells.length > 0) {
    character.spells.forEach(spell => {
      drawText(doc, spell, startX, yOffset);
      yOffset += 6;
    });
  } else {
    drawText(doc, 'No spells known', startX, yOffset);
  }
};

// Function to generate equipment section
const generateEquipmentSection = (doc: jsPDF, character: Character) => {
  const startX = 10;
  let startY = 250;

  drawSectionTitle(doc, 'Equipment', startX, startY);
  let yOffset = startY + 10;

  setFont(doc, 12);

  if (character.equipment && character.equipment.length > 0) {
    character.equipment.forEach(item => {
      drawText(doc, item, startX, yOffset);
      yOffset += 6;
    });
  } else {
    drawText(doc, 'No equipment listed', startX, yOffset);
  }
};

const generateCharacterSheet = async (character: Character) => {
  const doc = new jsPDF();

  // Character Details Section
  generateCharacterDetailsSection(doc, character, 10, 10);

  // Ability Scores Section
  generateAbilityScoresSection(doc, character, 10, 50);

  // Proficiencies Section
  generateProficienciesSection(doc, character);

  // Spells Section
  generateSpellsSection(doc, character);

  // Equipment Section
  generateEquipmentSection(doc, character);
  
  // Update image handling to handle the optional image property
  if (character.image) {
    try {
      const img = new Image();
      img.src = character.image;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      doc.addImage(img.src, 'PNG', 150, 10, 50, 50);
    } catch (error) {
      console.error("Error adding image to PDF:", error);
    }
  }

  // Save the PDF
  doc.save(`${character.name}-character-sheet.pdf`);
};

export default generateCharacterSheet;
