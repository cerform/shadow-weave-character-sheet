
import { jsPDF } from 'jspdf';
import { CharacterSheet } from '@/types/character';

export const downloadCharacterPDF = (character: CharacterSheet) => {
  const doc = new jsPDF();
  
  // Добавляем шрифт для кириллицы
  // Используем стандартный шрифт вместо загрузки внешнего
  // doc.addFont требует больше параметров: путь, имя шрифта, стиль, кодировка
  doc.setFont('helvetica'); // Используем встроенный шрифт, который поддерживает кириллицу
  
  // Стили
  const titleSize = 18;
  const headerSize = 14;
  const textSize = 12;
  const smallTextSize = 10;
  
  // Основная информация
  doc.setFontSize(titleSize);
  doc.text('Лист персонажа D&D 5 редакции', 105, 15, { align: 'center' });
  
  doc.setFontSize(headerSize);
  doc.text(character.name, 105, 25, { align: 'center' });
  
  doc.setFontSize(textSize);
  const classLevel = `${character.race}, ${character.class} ${character.subclass ? `(${character.subclass})` : ''}, Уровень ${character.level.toString()}`;
  doc.text(classLevel, 105, 32, { align: 'center' });
  
  // Прямоугольник для основной информации
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(10, 38, 190, 35);
  
  // Основная информация внутри прямоугольника
  doc.setFontSize(smallTextSize);
  doc.text(`Предыстория: ${character.background || '-'}`, 15, 45);
  doc.text(`Мировоззрение: ${character.alignment || '-'}`, 15, 52);
  doc.text(`Черты характера: ${character.personalityTraits || '-'}`, 15, 59);
  doc.text(`Идеалы: ${character.ideals || '-'}`, 15, 66);
  
  doc.text(`Привязанности: ${character.bonds || '-'}`, 110, 45);
  doc.text(`Слабости: ${character.flaws || '-'}`, 110, 52);
  doc.text(`Внешность: ${character.appearance || '-'}`, 110, 59);
  
  // Характеристики
  doc.setFontSize(headerSize);
  doc.text('Характеристики', 105, 85, { align: 'center' });
  
  // Прямоугольник для характеристик
  doc.rect(10, 90, 190, 50);
  
  // Заголовки характеристик
  doc.setFontSize(smallTextSize);
  const abilityHeaders = ['Сила', 'Ловкость', 'Телосложение', 'Интеллект', 'Мудрость', 'Харизма'];
  const abilityKeys = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  const abilityX = [30, 60, 90, 120, 150, 180];
  
  for (let i = 0; i < 6; i++) {
    doc.text(abilityHeaders[i], abilityX[i], 98, { align: 'center' });
  }
  
  // Значения характеристик
  doc.setFontSize(textSize);
  for (let i = 0; i < 6; i++) {
    const score = character.abilities[abilityKeys[i] as keyof typeof character.abilities];
    doc.text(score.toString(), abilityX[i], 108, { align: 'center' });
    
    // Модификаторы
    const modifier = Math.floor((score - 10) / 2);
    const modText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    doc.text(modText, abilityX[i], 118, { align: 'center' });
  }
  
  // Навыки
  doc.setFontSize(headerSize);
  doc.text('Навыки', 55, 155, { align: 'center' });
  
  // Список навыков
  doc.setFontSize(smallTextSize);
  if (character.skills && character.skills.length > 0) {
    let skillY = 165;
    for (let i = 0; i < character.skills.length; i++) {
      if (i > 15) { // Ограничиваем количество отображаемых навыков
        doc.text('...и другие', 55, skillY, { align: 'center' });
        break;
      }
      doc.text(`• ${character.skills[i]}`, 20, skillY);
      skillY += 6;
      if (skillY > 270) break; // Предотвращаем выход за пределы страницы
    }
  } else {
    doc.text('Нет выбранных навыков', 55, 165, { align: 'center' });
  }
  
  // Владения и языки
  doc.setFontSize(headerSize);
  doc.text('Владения и языки', 150, 155, { align: 'center' });
  
  // Список владений
  doc.setFontSize(smallTextSize);
  let profY = 165;
  
  // Языки
  doc.text('Языки:', 115, profY);
  profY += 6;
  if (character.languages && character.languages.length > 0) {
    for (let i = 0; i < character.languages.length; i++) {
      if (profY > 270) break;
      doc.text(`• ${character.languages[i]}`, 120, profY);
      profY += 6;
    }
  } else {
    doc.text('Общий', 120, profY);
    profY += 6;
  }
  
  profY += 4;
  doc.text('Прочие владения:', 115, profY);
  profY += 6;
  if (character.proficiencies && character.proficiencies.length > 0) {
    for (let i = 0; i < character.proficiencies.length; i++) {
      if (profY > 270) break;
      doc.text(`• ${character.proficiencies[i]}`, 120, profY);
      profY += 6;
    }
  } else {
    doc.text('Нет', 120, profY);
  }
  
  // Снаряжение
  doc.setFontSize(headerSize);
  doc.text('Снаряжение', 55, 220, { align: 'center' });
  
  // Список снаряжения
  doc.setFontSize(smallTextSize);
  if (character.equipment && character.equipment.length > 0) {
    let equipY = 230;
    for (let i = 0; i < character.equipment.length; i++) {
      if (i > 10) {
        doc.text('...и другие предметы', 55, equipY, { align: 'center' });
        break;
      }
      doc.text(`• ${character.equipment[i]}`, 20, equipY);
      equipY += 6;
      if (equipY > 270) break;
    }
  } else {
    doc.text('Нет снаряжения', 55, 230, { align: 'center' });
  }
  
  // Заклинания
  if (character.spells && character.spells.length > 0) {
    doc.setFontSize(headerSize);
    doc.text('Заклинания', 150, 220, { align: 'center' });
    
    doc.setFontSize(smallTextSize);
    let spellY = 230;
    for (let i = 0; i < character.spells.length; i++) {
      if (i > 10) {
        doc.text('...и другие заклинания', 150, spellY, { align: 'center' });
        break;
      }
      doc.text(`• ${character.spells[i]}`, 115, spellY);
      spellY += 6;
      if (spellY > 270) break;
    }
  }
  
  // Особенности
  doc.setFontSize(headerSize);
  doc.text('Особенности и черты', 105, 275, { align: 'center' });
  
  doc.setFontSize(smallTextSize);
  if (character.features && character.features.length > 0) {
    let featY = 285;
    for (let i = 0; i < character.features.length; i++) {
      if (i > 5) {
        doc.text('...и другие особенности', 105, featY, { align: 'center' });
        break;
      }
      doc.text(`• ${character.features[i]}`, 20, featY);
      featY += 6;
    }
  } else {
    doc.text('Нет особенностей', 105, 285, { align: 'center' });
  }
  
  // Сохранение PDF
  doc.save(`${character.name.replace(/\s+/g, '_')}_character_sheet.pdf`);
};
