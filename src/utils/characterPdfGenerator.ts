
import { jsPDF } from 'jspdf';
import { CharacterSheet } from '@/types/character';
import html2pdf from 'html2pdf.js';

// Функция для создания PDF с использованием jsPDF (как было раньше)
export const downloadCharacterPDF = (character: CharacterSheet) => {
  const doc = new jsPDF();
  
  try {
    // Устанавливаем стандартный шрифт для поддержки кириллицы
    doc.setFont('helvetica');
    
    // Стили
    const titleSize = 18;
    const headerSize = 14;
    const textSize = 12;
    const smallTextSize = 10;
    
    // Основная информация
    doc.setFontSize(titleSize);
    doc.text('Лист персонажа D&D 5 редакции', 105, 15, { align: 'center' });
    
    doc.setFontSize(headerSize);
    doc.text(character.name || 'Безымянный', 105, 25, { align: 'center' });
    
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
    
  } catch (error) {
    console.error('Ошибка при создании PDF:', error);
    alert('Произошла ошибка при создании PDF. Попробуйте еще раз.');
  }
};

// Новая функция для создания PDF с использованием HTML шаблона
export const downloadCharacterHTMLPDF = (character: CharacterSheet) => {
  // Создаем HTML элемент
  const element = document.createElement('div');
  element.innerHTML = generateCharacterSheetHTML(character);
  
  // Устанавливаем стили для PDF
  element.style.width = '210mm';
  element.style.fontSize = '10pt';
  element.style.fontFamily = 'Arial, Helvetica, sans-serif';
  
  // Добавляем элемент в DOM временно
  document.body.appendChild(element);
  
  // Настройки для html2pdf
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `${character.name.replace(/\s+/g, '_')}_character_sheet.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  // Создаем PDF
  html2pdf().from(element).set(opt).save().then(() => {
    // Удаляем элемент из DOM после создания PDF
    document.body.removeChild(element);
  });
};

// Функция для генерации HTML шаблона листа персонажа
function generateCharacterSheetHTML(character: CharacterSheet): string {
  // Вспомогательная функция для расчета модификатора
  const getModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };
  
  // CSS для листа персонажа
  const css = `
    <style>
      /* Сброс стилей */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: Arial, Helvetica, sans-serif;
        color: black;
        line-height: 1.4;
      }
      
      .character-sheet {
        width: 100%;
        max-width: 210mm;
        padding: 10mm;
        margin: 0 auto;
      }
      
      .header {
        text-align: center;
        margin-bottom: 15px;
      }
      
      .header h1 {
        font-size: 18pt;
        margin-bottom: 5px;
      }
      
      .header h2 {
        font-size: 14pt;
        margin-bottom: 10px;
      }
      
      .section {
        margin-bottom: 15px;
        border: 1px solid #000;
        padding: 10px;
        border-radius: 5px;
      }
      
      .section-title {
        font-size: 12pt;
        font-weight: bold;
        margin-bottom: 10px;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
      }
      
      .abilities {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
      }
      
      .ability {
        width: 15%;
        text-align: center;
        border: 1px solid #000;
        padding: 10px;
        border-radius: 5px;
      }
      
      .ability-name {
        font-weight: bold;
      }
      
      .ability-score {
        font-size: 16pt;
        font-weight: bold;
        margin: 5px 0;
      }
      
      .ability-modifier {
        border: 1px solid #000;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        line-height: 25px;
        margin: 0 auto;
        font-weight: bold;
      }
      
      .two-columns {
        display: flex;
        justify-content: space-between;
        gap: 15px;
      }
      
      .column {
        width: 48%;
      }
      
      .skills {
        margin-bottom: 15px;
      }
      
      .skill {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      
      .list {
        list-style-position: inside;
        margin-left: 10px;
      }
      
      .list li {
        margin-bottom: 3px;
      }
    </style>
  `;
  
  // HTML для листа персонажа
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Character Sheet - ${character.name}</title>
  ${css}
</head>
<body>
  <div class="character-sheet">
    <div class="header">
      <h1>Лист персонажа D&D 5 редакции</h1>
      <h2>${character.name}</h2>
      <p>${character.race} ${character.subrace ? `(${character.subrace})` : ''}, ${character.class} ${character.subclass ? `(${character.subclass})` : ''}, Уровень ${character.level}</p>
    </div>

    <div class="section">
      <div class="section-title">Основная информация</div>
      <div class="two-columns">
        <div class="column">
          <p><strong>Предыстория:</strong> ${character.background || '-'}</p>
          <p><strong>Мировоззрение:</strong> ${character.alignment || '-'}</p>
          <p><strong>Черты характера:</strong> ${character.personalityTraits || '-'}</p>
        </div>
        <div class="column">
          <p><strong>Привязанности:</strong> ${character.bonds || '-'}</p>
          <p><strong>Слабости:</strong> ${character.flaws || '-'}</p>
          <p><strong>Внешность:</strong> ${character.appearance || '-'}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Характеристики</div>
      <div class="abilities">
        ${['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(key => {
          const abilityNames: Record<string, string> = {
            'strength': 'СИЛА',
            'dexterity': 'ЛОВКОСТЬ',
            'constitution': 'ТЕЛОСЛОЖЕНИЕ',
            'intelligence': 'ИНТЕЛЛЕКТ',
            'wisdom': 'МУДРОСТЬ',
            'charisma': 'ХАРИЗМА'
          };
          const score = character.abilities[key as keyof typeof character.abilities];
          const modifier = getModifier(score);
          
          return `
            <div class="ability">
              <div class="ability-name">${abilityNames[key]}</div>
              <div class="ability-score">${score}</div>
              <div class="ability-modifier">${modifier}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="two-columns">
      <div class="column">
        <div class="section">
          <div class="section-title">Навыки</div>
          <div class="skills">
            ${character.skills && character.skills.length > 0 ? 
              `<ul class="list">
                ${character.skills.map(skill => `<li>${skill}</li>`).join('')}
              </ul>` : 
              '<p>Нет выбранных навыков</p>'
            }
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Снаряжение</div>
          ${character.equipment && character.equipment.length > 0 ? 
            `<ul class="list">
              ${character.equipment.map(item => `<li>${item}</li>`).join('')}
            </ul>` : 
            '<p>Нет снаряжения</p>'
          }
        </div>
      </div>

      <div class="column">
        <div class="section">
          <div class="section-title">Владения и языки</div>
          <p><strong>Языки:</strong></p>
          ${character.languages && character.languages.length > 0 ? 
            `<ul class="list">
              ${character.languages.map(lang => `<li>${lang}</li>`).join('')}
            </ul>` : 
            '<p>Общий</p>'
          }
          
          <p><strong>Прочие владения:</strong></p>
          ${character.proficiencies && character.proficiencies.length > 0 ? 
            `<ul class="list">
              ${character.proficiencies.map(prof => `<li>${prof}</li>`).join('')}
            </ul>` : 
            '<p>Нет</p>'
          }
        </div>
        
        ${character.spells && character.spells.length > 0 ? `
        <div class="section">
          <div class="section-title">Заклинания</div>
          <ul class="list">
            ${character.spells.map(spell => `<li>${spell}</li>`).join('')}
          </ul>
        </div>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Особенности и черты</div>
      ${character.features && character.features.length > 0 ? 
        `<ul class="list">
          ${character.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>` : 
        '<p>Нет особенностей</p>'
      }
    </div>
  </div>
</body>
</html>`;
}
