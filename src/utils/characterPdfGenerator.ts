import { Character, SkillProficiency } from '@/types/character';

// Function to generate a PDF character sheet
export const generateCharacterPdf = (character: Character) => {
  // Import jsPDF
  const { jsPDF } = require("jspdf");

  // Initialize jsPDF
  const doc = new jsPDF();

  // Function to add a section title
  const addSectionTitle = (title: string) => {
    doc.setFontSize(16);
    doc.text(title, 10, doc.y + 10);
    doc.line(10, doc.y + 11, 200, doc.y + 11);
    doc.y += 12;
  };

  // Function to add character info
  const addCharacterInfo = () => {
    doc.setFontSize(20).text(character.name, 10, 20);
    doc.setFontSize(12);
    doc.text(`Класс: ${character.class || 'Не указан'}`, 10, 30);
    doc.text(`Уровень: ${character.level || '1'}`, 10, 40);
    doc.text(`Раса: ${character.race || 'Не указана'}`, 10, 50);
    doc.text(`Мировоззрение: ${character.alignment || 'Не указано'}`, 10, 60);
    doc.y = 70;
  };

  // Function to add ability scores
  const addAbilityScores = () => {
    addSectionTitle('Характеристики');
    const abilities = character.abilities;
    if (abilities) {
      let x = 10;
      for (const key in abilities) {
        if (typeof abilities[key] === 'number') {
          doc.text(`${key}: ${abilities[key]}`, x, doc.y);
          x += 30;
        }
      }
      doc.y += 10;
    }
  };

  // Function to calculate skill modifier
  const getSkillModifier = (character: Character, skillName: string): string => {
    const skill = character.skills?.[skillName];
    if (!skill) return "+0";
    
    // Check the isProficient property instead of calling the object
    const isProficient = skill.isProficient;
    const proficiencyBonus = character.proficiencyBonus || 2;
    
    let modifier = Math.floor((getAbilityScore(character, skillName) - 10) / 2);
    
    if (isProficient) {
      modifier += proficiencyBonus;
    }
    
    return (modifier >= 0 ? "+" : "") + modifier.toString();
  };

  // Function to get ability score based on skill
  const getAbilityScore = (character: Character, skillName: string): number => {
    switch (skillName) {
      case "athletics": return character.abilities?.strength || 10;
      case "acrobatics": return character.abilities?.dexterity || 10;
      case "sleightOfHand": return character.abilities?.dexterity || 10;
      case "stealth": return character.abilities?.dexterity || 10;
      case "arcana": return character.abilities?.intelligence || 10;
      case "history": return character.abilities?.intelligence || 10;
      case "investigation": return character.abilities?.intelligence || 10;
      case "nature": return character.abilities?.intelligence || 10;
      case "religion": return character.abilities?.intelligence || 10;
      case "animalHandling": return character.abilities?.wisdom || 10;
      case "insight": return character.abilities?.wisdom || 10;
      case "medicine": return character.abilities?.wisdom || 10;
      case "perception": return character.abilities?.wisdom || 10;
      case "survival": return character.abilities?.wisdom || 10;
      case "deception": return character.abilities?.charisma || 10;
      case "intimidation": return character.abilities?.charisma || 10;
      case "performance": return character.abilities?.charisma || 10;
      case "persuasion": return character.abilities?.charisma || 10;
      default: return 10;
    }
  };

  // Function to get saving throw modifier
  const getSavingThrowModifier = (character: Character, abilityKey: string): string => {
    let modifier = Math.floor(((character.abilities as any)?.[abilityKey] || 10 - 10) / 2);
    const proficiencyBonus = character.proficiencyBonus || 2;
    
    // Use the boolean value directly instead of calling it
    const isProficient = character.savingThrowProficiencies?.[abilityKey] || false;
    
    if (isProficient) {
      modifier += proficiencyBonus;
    }
    
    return (modifier >= 0 ? "+" : "") + modifier.toString();
  };

  // Function to add skills
  const addSkillsSection = () => {
    addSectionTitle('Навыки');
    let x = 10;
    const skills = [
      "athletics", "acrobatics", "sleightOfHand", "stealth",
      "arcana", "history", "investigation", "nature", "religion",
      "animalHandling", "insight", "medicine", "perception", "survival",
      "deception", "intimidation", "performance", "persuasion"
    ];

    skills.forEach(skill => {
      const skillName = skill.charAt(0).toUpperCase() + skill.slice(1);
      doc.text(`${skillName}: ${getSkillModifier(character, skill)}`, x, doc.y);
      x += 50;
      if (x > 100) {
        x = 10;
        doc.y += 10;
      }
    });
    doc.y += 10;
  };

  // Function to add saving throws
  const addSavingThrowsSection = () => {
    addSectionTitle('Спасброски');
    let x = 10;
    const savingThrows = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];

    savingThrows.forEach(savingThrow => {
      const savingThrowName = savingThrow.charAt(0).toUpperCase() + savingThrow.slice(1);
      doc.text(`${savingThrowName}: ${getSavingThrowModifier(character, savingThrow)}`, x, doc.y);
      x += 50;
      if (x > 100) {
        x = 10;
        doc.y += 10;
      }
    });
    doc.y += 10;
  };

  // Function to add equipment
  const addEquipmentSection = () => {
    addSectionTitle('Снаряжение');
    doc.setFontSize(12);
    if (character.equipment && Array.isArray(character.equipment)) {
      character.equipment.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.name || item}`, 10, doc.y);
        doc.y += 10;
      });
    } else {
      doc.text('Нет снаряжения', 10, doc.y);
      doc.y += 10;
    }
  };

  // Function to add features
  const addFeaturesSection = (doc: any, character: Character) => {
    doc.fontSize(14).text('Особенности и черты', { align: 'center' });
    
    // Use features instead of feats
    const features = character.features || [];
    
    if (features.length > 0) {
      features.forEach(feat => {
        // Implementation
      });
    } else {
      doc.fontSize(10).text('Нет особенностей', { align: 'center' });
    }
  };

  // Add sections to the PDF
  addCharacterInfo();
  addAbilityScores();
  addSkillsSection();
  addSavingThrowsSection();
  addEquipmentSection();
  addFeaturesSection(doc, character);

  // Save the PDF
  doc.save(`${character.name || 'Персонаж'}.pdf`);
};
