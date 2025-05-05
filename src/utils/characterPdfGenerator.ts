import { Character } from '@/types/character';
import { 
  safeArrayLength, 
  safeArrayMap, 
  safeGreaterThan, 
  safeLessThan,
  getSkillBonus,
  getEquipmentLength,
  getProficienciesLength
} from './safetyUtils';

const generateCharacterPdf = (character: Character) => {
  const { jsPDF } = require("jspdf");
  
  const doc = new jsPDF();
  
  // Define some constants for positioning
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let currentY = margin;
  
  // Function to add a title
  const addTitle = (text: string, options: { fontSize?: number, isCentered?: boolean } = {}) => {
    const fontSize = options.fontSize || 16;
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    const x = options.isCentered ? (pageWidth - textWidth) / 2 : margin;
    doc.text(text, x, currentY);
    currentY += fontSize + 2;
  };
  
  // Function to add a section title
  const addSectionTitle = (text: string) => {
    addTitle(text, { fontSize: 14 });
    currentY += 2; // Add a little extra space after the section title
  };
  
  // Function to add a paragraph of text
  const addParagraph = (text: string) => {
    const fontSize = 12;
    doc.setFontSize(fontSize);
    const textLines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    textLines.forEach(line => {
      doc.text(line, margin, currentY);
      currentY += fontSize + 2;
    });
  };
  
  // Function to add a key-value pair
  const addKeyValuePair = (key: string, value: string) => {
    const keyFontSize = 12;
    const valueFontSize = 12;
    const keyWidth = doc.getTextWidth(key, { fontSize: keyFontSize });
    
    doc.setFontSize(keyFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text(key, margin, currentY);
    
    doc.setFontSize(valueFontSize);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + keyWidth + 5, currentY);
    
    currentY += valueFontSize + 2;
  };
  
  // Function to add a list of items
  const addList = (items: string[]) => {
    const fontSize = 12;
    doc.setFontSize(fontSize);
    items.forEach(item => {
      doc.text(`- ${item}`, margin, currentY);
      currentY += fontSize + 2;
    });
  };
  
  // Function to start a new page if needed
  const startNewPageIfRequired = (contentHeight: number) => {
    if (currentY + contentHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      currentY = margin;
    }
  };
  
  // Generate Character Info Section
  const generateCharacterInfoSection = (doc: any, character: Character) => {
    addSectionTitle('Информация о персонаже');
    addKeyValuePair('Имя:', character.name || 'Не указано');
    addKeyValuePair('Класс:', character.class || 'Не указано');
    addKeyValuePair('Уровень:', character.level?.toString() || 'Не указано');
    addKeyValuePair('Раса:', character.race || 'Не указано');
    addKeyValuePair('Предыстория:', character.background || 'Не указано');
    addKeyValuePair('Мировоззрение:', character.alignment || 'Не указано');
    currentY += 5;
  };
  
  // Generate Ability Scores Section
  const generateAbilityScoresSection = (doc: any, character: Character) => {
    addSectionTitle('Характеристики');
    
    const abilityScores = {
      STR: character.abilities?.strength || 10,
      DEX: character.abilities?.dexterity || 10,
      CON: character.abilities?.constitution || 10,
      INT: character.abilities?.intelligence || 10,
      WIS: character.abilities?.wisdom || 10,
      CHA: character.abilities?.charisma || 10,
    };
    
    Object.entries(abilityScores).forEach(([ability, score]) => {
      const proficient = safeGreaterThan(character.skills?.[ability.toLowerCase()], 0);
      const skillBonus = getSkillBonus(character.skills?.[ability.toLowerCase()]);
      const scoreText = `${ability}: ${score} ${proficient ? '(Proficient)' : ''} ${skillBonus ? `(Bonus: ${skillBonus})` : ''}`;
      addParagraph(scoreText);
    });
    
    currentY += 5;
  };
  
  // Generate Skills Section
  const generateSkillsSection = (doc: any, character: Character) => {
    addSectionTitle('Навыки');
    
    const skills = {
      Acrobatics: character.skills?.acrobatics || false,
      AnimalHandling: character.skills?.animalHandling || false,
      Arcana: character.skills?.arcana || false,
      Athletics: character.skills?.athletics || false,
      Deception: character.skills?.deception || false,
      History: character.skills?.history || false,
      Insight: character.skills?.insight || false,
      Intimidation: character.skills?.intimidation || false,
      Investigation: character.skills?.investigation || false,
      Medicine: character.skills?.medicine || false,
      Nature: character.skills?.nature || false,
      Perception: character.skills?.perception || false,
      Performance: character.skills?.performance || false,
      Persuasion: character.skills?.persuasion || false,
      Religion: character.skills?.religion || false,
      SleightOfHand: character.skills?.sleightOfHand || false,
      Stealth: character.skills?.stealth || false,
      Survival: character.skills?.survival || false,
    };
    
    Object.entries(skills).forEach(([skillName, skillValue]) => {
      const skillBonus = getSkillBonus(skillValue);
      const skillText = `${skillName}: ${skillBonus ? `+${skillBonus}` : 'Не владеет'}`;
      addParagraph(skillText);
    });
    
    currentY += 5;
  };
  
  // Generate Proficiencies Section
  const generateProficienciesSection = (doc: any, character: Character) => {
    addSectionTitle('Владения');
    
    if (character.proficiencies) {
      const proficiencies = Array.isArray(character.proficiencies)
        ? character.proficiencies
        : [
            ...(character.proficiencies.armor || []),
            ...(character.proficiencies.weapons || []),
            ...(character.proficiencies.tools || []),
            ...(character.proficiencies.languages || [])
          ].filter(Boolean);
      
      if (proficiencies.length > 0) {
        addList(proficiencies as string[]);
      } else {
        addParagraph('Нет владений');
      }
    } else {
      addParagraph('Нет владений');
    }
    
    currentY += 5;
  };
  
  // Generate Equipment Section
  const generateEquipmentSection = (doc: any, character: Character) => {
    addSectionTitle('Снаряжение');
    
    if (getEquipmentLength(character.equipment) > 0) {
      const equipmentItems = character.equipment 
        ? (Array.isArray(character.equipment) 
          ? safeArrayMap(character.equipment, item => item)
          : [
              ...(character.equipment.weapons || []), 
              ...(character.equipment.items || []),
              character.equipment.armor || ''
            ].filter(Boolean)
          )
        : [];
        
      if (equipmentItems.length > 0) {
        addList(equipmentItems as string[]);
      } else {
        addParagraph('Нет снаряжения');
      }
    } else {
      addParagraph('Нет снаряжения');
    }
    
    currentY += 5;
  };
  
  // Generate Spellcasting Section
  const generateSpellcastingSection = (doc: any, character: Character) => {
    if (character.spellcasting && character.spells && character.spells.length > 0) {
      addSectionTitle('Колдовство');
      
      addKeyValuePair('Базовая характеристика:', character.spellcasting.ability || 'Не указано');
      addKeyValuePair('Сложность спасброска:', character.spellcasting.saveDC?.toString() || 'Не указано');
      addKeyValuePair('Бонус атаки:', character.spellcasting.attackBonus?.toString() || 'Не указано');
      
      addSectionTitle('Заклинания');
      if (character.spells && character.spells.length > 0) {
        if (Array.isArray(character.spells)) {
          addList(character.spells as string[]);
        } else {
          addParagraph('Нет заклинаний');
        }
      } else {
        addParagraph('Нет заклинаний');
      }
      
      currentY += 5;
    }
  };
  
  // Generate Features and Traits Section
  const generateFeaturesAndTraitsSection = (doc: any, character: Character) => {
    addSectionTitle('Черты и особенности');
    
    if (character.features && character.features.length > 0) {
      addList(character.features);
    } else {
      addParagraph('Нет особенностей');
    }
    
    currentY += 5;
    
    addSectionTitle('Личные качества');
    
    if (character.personalityTraits) {
      addParagraph(character.personalityTraits);
    } else {
      addParagraph('Нет личных качеств');
    }
    
    currentY += 5;
  };
  
  // Generate Backstory Section
  const generateBackstorySection = (doc: any, character: Character) => {
    addSectionTitle('История');
    
    if (character.backstory) {
      addParagraph(character.backstory);
    } else {
      addParagraph('Нет истории');
    }
    
    currentY += 5;
  };
  
  // Add character image if available
  if (character.image) {
    try {
      // Add image - this part requires more research on how to handle images in jsPDF
      // For now, skipping image addition
      console.log('Изображения пока не поддерживаются');
    } catch (error) {
      console.error('Ошибка при добавлении изображения:', error);
    }
  }
  
  // Call all the generate functions
  startNewPageIfRequired(500);
  generateCharacterInfoSection(doc, character);
  
  startNewPageIfRequired(500);
  generateAbilityScoresSection(doc, character);
  
  startNewPageIfRequired(500);
  generateSkillsSection(doc, character);
  
  startNewPageIfRequired(500);
  generateProficienciesSection(doc, character);
  
  startNewPageIfRequired(500);
  generateEquipmentSection(doc, character);
  
  startNewPageIfRequired(500);
  generateSpellcastingSection(doc, character);
  
  startNewPageIfRequired(500);
  generateFeaturesAndTraitsSection(doc, character);
  
  startNewPageIfRequired(500);
  generateBackstorySection(doc, character);
  
  // Save the PDF
  doc.save(`${character.name || 'Персонаж'}.pdf`);
};

export default generateCharacterPdf;
