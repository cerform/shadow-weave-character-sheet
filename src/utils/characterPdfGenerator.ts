
import { jsPDF } from 'jspdf';
import { Character } from '@/contexts/CharacterContext';

// Функция для получения модификатора характеристики
const getModifier = (score: number): string => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

// Функция для получения названия характеристики на русском
const getAbilityName = (ability: string): string => {
  const names: Record<string, string> = {
    'STR': 'Сила',
    'DEX': 'Ловкость',
    'CON': 'Телосложение',
    'INT': 'Интеллект',
    'WIS': 'Мудрость',
    'CHA': 'Харизма',
  };
  return names[ability] || ability;
};

// Функция для генерации PDF листа персонажа
export const generateCharacterPDF = (character: Character): string => {
  try {
    // Создаем документ
    const doc = new jsPDF();
    doc.setFont("helvetica");
    
    // Добавляем заголовок
    doc.setFontSize(18);
    doc.text("Лист персонажа D&D 5e", 105, 15, { align: "center" });
    
    // Основная информация
    doc.setFontSize(14);
    doc.text("Основная информация", 15, 25);
    doc.setFontSize(12);
    doc.text(`Имя: ${character.name}`, 15, 35);
    doc.text(`Раса: ${character.race}`, 15, 42);
    doc.text(`Класс: ${character.className}`, 15, 49);
    doc.text(`Уровень: ${character.level}`, 15, 56);
    doc.text(`Мировоззрение: ${character.alignment || "Нейтральный"}`, 15, 63);
    
    // Характеристики
    doc.setFontSize(14);
    doc.text("Характеристики", 15, 75);
    doc.setFontSize(12);
    
    let yPos = 85;
    let xPos = 15;
    
    if (character.abilities) {
      Object.entries(character.abilities).forEach(([ability, score], index) => {
        const abilityName = getAbilityName(ability);
        const modifier = getModifier(Number(score));
        
        doc.text(`${abilityName}: ${score} (${modifier})`, xPos, yPos);
        
        yPos += 7;
        if (index === 2) { // После первых трех характеристик переключаемся на правую колонку
          xPos = 105;
          yPos = 85;
        }
      });
    }
    
    // HP
    doc.setFontSize(14);
    doc.text("Здоровье", 15, 115);
    doc.setFontSize(12);
    doc.text(`Максимум HP: ${character.maxHp || 0}`, 15, 125);
    doc.text(`Текущее HP: ${character.currentHp || 0}`, 15, 132);
    
    // Заклинания
    doc.setFontSize(14);
    doc.text("Заклинания", 15, 145);
    doc.setFontSize(10);
    
    yPos = 155;
    if (character.spells && character.spells.length > 0) {
      character.spells.forEach((spell, index) => {
        if (index < 15) { // Ограничиваем количество заклинаний на странице
          doc.text(`• ${spell}`, 15, yPos);
          yPos += 6;
        }
      });
    } else {
      doc.text("Нет заклинаний", 15, yPos);
    }
    
    // Снаряжение
    doc.setFontSize(14);
    doc.text("Снаряжение", 105, 145);
    doc.setFontSize(10);
    
    yPos = 155;
    if (character.equipment && character.equipment.length > 0) {
      character.equipment.forEach((item, index) => {
        if (index < 15) { // Ограничиваем количество предметов на странице
          doc.text(`• ${item}`, 105, yPos);
          yPos += 6;
        }
      });
    } else {
      doc.text("Нет снаряжения", 105, yPos);
    }
    
    // Навыки и языки на второй странице
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Навыки и особенности", 15, 15);
    doc.setFontSize(10);
    
    yPos = 25;
    if (character.proficiencies && character.proficiencies.length > 0) {
      character.proficiencies.forEach((prof, index) => {
        if (index < 20) {
          doc.text(`• ${prof}`, 15, yPos);
          yPos += 6;
        }
      });
    } else {
      doc.text("Нет навыков", 15, yPos);
    }
    
    doc.setFontSize(14);
    doc.text("Языки", 15, yPos + 15);
    doc.setFontSize(10);
    
    yPos += 25;
    if (character.languages && character.languages.length > 0) {
      character.languages.forEach((lang, index) => {
        if (index < 10) {
          doc.text(`• ${lang}`, 15, yPos);
          yPos += 6;
        }
      });
    } else {
      doc.text("Общий", 15, yPos);
    }
    
    // Предыстория
    doc.setFontSize(14);
    doc.text("Предыстория", 15, yPos + 15);
    doc.setFontSize(10);
    
    if (character.background) {
      const splitBackground = doc.splitTextToSize(character.background, 180);
      doc.text(splitBackground, 15, yPos + 25);
    } else {
      doc.text("Нет предыстории", 15, yPos + 25);
    }
    
    // Генерируем PDF как URL
    return doc.output('dataurlstring');
  } catch (error) {
    console.error("Ошибка при создании PDF:", error);
    return "";
  }
};

// Функция для сохранения PDF
export const downloadCharacterPDF = (character: Character): void => {
  try {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    
    // Добавляем заголовок
    doc.setFontSize(18);
    doc.text("Лист персонажа D&D 5e", 105, 15, { align: "center" });
    
    // Основная информация
    doc.setFontSize(14);
    doc.text("Основная информация", 15, 25);
    doc.setFontSize(12);
    doc.text(`Имя: ${character.name}`, 15, 35);
    doc.text(`Раса: ${character.race}`, 15, 42);
    doc.text(`Класс: ${character.className}`, 15, 49);
    doc.text(`Уровень: ${character.level}`, 15, 56);
    doc.text(`Мировоззрение: ${character.alignment || "Нейтральный"}`, 15, 63);
    
    // Характеристики
    doc.setFontSize(14);
    doc.text("Характеристики", 15, 75);
    doc.setFontSize(12);
    
    let yPos = 85;
    let xPos = 15;
    
    if (character.abilities) {
      Object.entries(character.abilities).forEach(([ability, score], index) => {
        const abilityName = getAbilityName(ability);
        const modifier = getModifier(Number(score));
        
        doc.text(`${abilityName}: ${score} (${modifier})`, xPos, yPos);
        
        yPos += 7;
        if (index === 2) { // После первых трех характеристик переключаемся на правую колонку
          xPos = 105;
          yPos = 85;
        }
      });
    }
    
    // HP
    doc.setFontSize(14);
    doc.text("Здоровье", 15, 115);
    doc.setFontSize(12);
    doc.text(`Максимум HP: ${character.maxHp || 0}`, 15, 125);
    doc.text(`Текущее HP: ${character.currentHp || 0}`, 15, 132);
    
    // Заклинания
    doc.setFontSize(14);
    doc.text("Заклинания", 15, 145);
    doc.setFontSize(10);
    
    yPos = 155;
    if (character.spells && character.spells.length > 0) {
      character.spells.forEach((spell, index) => {
        if (index < 15) {
          doc.text(`• ${spell}`, 15, yPos);
          yPos += 6;
        }
      });
    } else {
      doc.text("Нет заклинаний", 15, yPos);
    }
    
    // Снаряжение
    doc.setFontSize(14);
    doc.text("Снаряжение", 105, 145);
    doc.setFontSize(10);
    
    yPos = 155;
    if (character.equipment && character.equipment.length > 0) {
      character.equipment.forEach((item, index) => {
        if (index < 15) {
          doc.text(`• ${item}`, 105, yPos);
          yPos += 6;
        }
      });
    } else {
      doc.text("Нет снаряжения", 105, yPos);
    }
    
    // Навыки и языки на второй странице
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Навыки и особенности", 15, 15);
    doc.setFontSize(10);
    
    yPos = 25;
    if (character.proficiencies && character.proficiencies.length > 0) {
      character.proficiencies.forEach((prof, index) => {
        if (index < 20) {
          doc.text(`• ${prof}`, 15, yPos);
          yPos += 6;
        }
      });
    } else {
      doc.text("Нет навыков", 15, yPos);
    }
    
    doc.setFontSize(14);
    doc.text("Языки", 15, yPos + 15);
    doc.setFontSize(10);
    
    yPos += 25;
    if (character.languages && character.languages.length > 0) {
      character.languages.forEach((lang, index) => {
        if (index < 10) {
          doc.text(`• ${lang}`, 15, yPos);
          yPos += 6;
        }
      });
    } else {
      doc.text("Общий", 15, yPos);
    }
    
    // Предыстория
    doc.setFontSize(14);
    doc.text("Предыстория", 15, yPos + 15);
    doc.setFontSize(10);
    
    if (character.background) {
      const splitBackground = doc.splitTextToSize(character.background, 180);
      doc.text(splitBackground, 15, yPos + 25);
    } else {
      doc.text("Нет предыстории", 15, yPos + 25);
    }
    
    // Сохраняем документ
    doc.save(`${character.name || 'персонаж'}_dnd.pdf`);
  } catch (error) {
    console.error("Ошибка при сохранении PDF:", error);
  }
};
