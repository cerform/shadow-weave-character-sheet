
import { jsPDF } from 'jspdf';
import { Character } from '@/contexts/CharacterContext';

// Функция для получения модификатора характеристики
const getModifier = (score: number): string => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

// Функция для получения числового модификатора (без знака)
const getNumericModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

// Функция для получения названия характеристики на русском
const getAbilityName = (ability: string): string => {
  const names: Record<string, string> = {
    'STR': 'СИЛА',
    'DEX': 'ЛОВКОСТЬ',
    'CON': 'ТЕЛОСЛОЖЕНИЕ',
    'INT': 'ИНТЕЛЛЕКТ',
    'WIS': 'МУДРОСТЬ',
    'CHA': 'ХАРИЗМА',
  };
  return names[ability] || ability;
};

// Функция для рисования рамки с характеристикой
const drawAbilityBox = (doc: jsPDF, x: number, y: number, ability: string, score: number) => {
  // Название характеристики
  doc.setFontSize(10);
  doc.text(getAbilityName(ability), x + 15, y, { align: "center" });
  
  // Круг с модификатором
  doc.setFillColor(255, 255, 255);
  doc.circle(x + 15, y + 15, 8, 'F');
  doc.circle(x + 15, y + 15, 8, 'S');
  
  // Модификатор в круге
  doc.setFontSize(14);
  doc.text(getModifier(score), x + 15, y + 17, { align: "center" });
  
  // Значение характеристики
  doc.setFillColor(255, 255, 255);
  doc.rect(x + 5, y + 23, 20, 14, 'F');
  doc.rect(x + 5, y + 23, 20, 14, 'S');
  doc.setFontSize(12);
  doc.text(String(score), x + 15, y + 32, { align: "center" });
};

// Функция для рисования навыка
const drawSkill = (doc: jsPDF, x: number, y: number, skillName: string, isProficient: boolean, modifier: number) => {
  // Круг профессии
  doc.circle(x + 4, y + 4, 3, isProficient ? 'F' : 'S');
  
  // Модификатор навыка
  const skillMod = getModifier(modifier);
  doc.setFontSize(10);
  doc.text(skillMod, x + 15, y + 4, { align: "center" });
  
  // Название навыка
  doc.text(skillName, x + 30, y + 4, { align: "left" });
};

// Функция для генерации PDF листа персонажа
export const generateCharacterPDF = (character: Character): string => {
  try {
    // Создаем документ
    const doc = new jsPDF();
    doc.setFont("helvetica");
    
    // Название листа
    doc.setFontSize(16);
    doc.text("ЛИСТ ПЕРСОНАЖА D&D 5 РЕДАКЦИЯ", 105, 15, { align: "center" });
    
    // Основная информация - верхняя секция
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 20, 190, 25, 'F');
    doc.rect(10, 20, 190, 25, 'S');
    
    doc.setFontSize(10);
    doc.text("ИМЯ ПЕРСОНАЖА", 20, 25);
    doc.text("КЛАСС И УРОВЕНЬ", 85, 25);
    doc.text("ПРЕДЫСТОРИЯ", 140, 25);
    
    doc.setFontSize(12);
    doc.text(character.name || "—", 20, 32);
    doc.text(`${character.className || "—"} (${character.level})`, 85, 32);
    
    doc.text("РАСА", 20, 40);
    doc.text("МИРОВОЗЗРЕНИЕ", 85, 40);
    doc.text("ОПЫТ", 140, 40);
    
    doc.text(character.race || "—", 42, 40);
    doc.text(character.alignment || "—", 115, 40);
    doc.text("0", 155, 40);
    
    // Характеристики - левая колонка
    let xPos = 15;
    let yPos = 55;
    
    // Рисуем блоки характеристик
    if (character.abilities) {
      const abilityOrder = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
      
      abilityOrder.forEach((ability, index) => {
        const score = character.abilities[ability as keyof typeof character.abilities] || 10;
        
        if (index === 3) {
          // Переходим ко второй колонке для INT, WIS, CHA
          xPos = 15;
          yPos = 130;
        }
        
        drawAbilityBox(doc, xPos, yPos, ability, Number(score));
        xPos += 30;
      });
    }
    
    // Вдохновение, бонус мастерства и спасброски
    doc.setFontSize(10);
    doc.text("ВДОХНОВЕНИЕ", 100, 55);
    doc.rect(95, 57, 10, 10, 'S');
    
    doc.text("БОНУС МАСТЕРСТВА", 140, 55);
    doc.circle(105, 65, 8, 'S');
    doc.setFontSize(12);
    doc.text("+2", 105, 68, { align: "center" });
    
    // Спасброски
    doc.setFontSize(10);
    doc.text("СПАСБРОСКИ", 120, 80);
    
    const savesMod = {
      'STR': getNumericModifier(character.abilities?.STR || 10),
      'DEX': getNumericModifier(character.abilities?.DEX || 10),
      'CON': getNumericModifier(character.abilities?.CON || 10),
      'INT': getNumericModifier(character.abilities?.INT || 10),
      'WIS': getNumericModifier(character.abilities?.WIS || 10),
      'CHA': getNumericModifier(character.abilities?.CHA || 10)
    };
    
    // Спасброски - список
    let savesY = 90;
    const savesNames = {
      'STR': 'Сила',
      'DEX': 'Ловкость',
      'CON': 'Телосложение',
      'INT': 'Интеллект',
      'WIS': 'Мудрость',
      'CHA': 'Харизма'
    };
    
    Object.entries(savesNames).forEach(([ability, name]) => {
      // Проверяем, есть ли у персонажа профессия в этом спасброске
      const isProficient = character.proficiencies?.includes(`Спасбросок: ${name}`) || false;
      
      // Рисуем круг профессии
      doc.circle(104, savesY, 3, isProficient ? 'F' : 'S');
      
      // Модификатор спасброска
      const mod = getModifier(savesMod[ability as keyof typeof savesMod] + (isProficient ? 2 : 0));
      doc.text(mod, 115, savesY, { align: "center" });
      
      // Название спасброска
      doc.text(name, 130, savesY);
      
      savesY += 7;
    });
    
    // Навыки
    doc.text("НАВЫКИ", 120, 140);
    
    const skillsNames = {
      'Акробатика': 'DEX',
      'Анализ': 'INT',
      'Атлетика': 'STR',
      'Восприятие': 'WIS',
      'Выживание': 'WIS',
      'Выступление': 'CHA',
      'Запугивание': 'CHA',
      'История': 'INT',
      'Ловкость рук': 'DEX',
      'Магия': 'INT',
      'Медицина': 'WIS',
      'Обман': 'CHA',
      'Природа': 'INT',
      'Проницательность': 'WIS',
      'Религия': 'INT',
      'Скрытность': 'DEX',
      'Убеждение': 'CHA',
      'Уход за животными': 'WIS'
    };
    
    let skillsY = 150;
    
    Object.entries(skillsNames).forEach(([skill, ability]) => {
      // Проверяем, есть ли у персонажа профессия в этом навыке
      const isProficient = character.proficiencies?.some(p => 
        p.includes(skill) || 
        // Учитываем особенности именования навыков
        (skill === "Ловкость рук" && p.includes("Ловкость")) ||
        (skill === "Уход за животными" && p.includes("Уход"))
      ) || false;
      
      // Модификатор соответствующей характеристики
      const abilityMod = getNumericModifier(character.abilities?.[ability as keyof typeof character.abilities] || 10);
      const skillMod = abilityMod + (isProficient ? 2 : 0);
      
      // Рисуем навык
      drawSkill(doc, 100, skillsY, skill, isProficient, skillMod);
      
      skillsY += 7;
      
      // Если список слишком длинный, переходим на следующую страницу
      if (skillsY > 270) {
        skillsY = 20;
        doc.addPage();
      }
    });
    
    // Пассивная мудрость (восприятие)
    doc.rect(105, 280, 80, 15, 'S');
    doc.text("ПАССИВНАЯ МУДРОСТЬ (ВОСПРИЯТИЕ)", 145, 278, { align: "center" });
    
    const passivePerception = 10 + getNumericModifier(character.abilities?.WIS || 10) + 
      (character.proficiencies?.includes("Восприятие") ? 2 : 0);
    
    doc.setFontSize(14);
    doc.text(String(passivePerception), 145, 290, { align: "center" });
    
    // Языки и прочие владения
    doc.setFontSize(10);
    doc.rect(10, 210, 80, 75, 'S');
    doc.text("ЯЗЫКИ И ПРОЧИЕ ВЛАДЕНИЯ", 50, 208, { align: "center" });
    
    let languagesText = "Языки: ";
    if (character.languages && character.languages.length > 0) {
      languagesText += character.languages.join(", ");
    } else {
      languagesText += "Общий";
    }
    
    // Доп. владения
    let proficienciesText = "Владения: ";
    if (character.proficiencies && character.proficiencies.length > 0) {
      // Исключаем навыки и спасброски, которые уже отображаются в других местах
      const otherProfs = character.proficiencies.filter(p => 
        !p.startsWith("Спасбросок:") && 
        !Object.keys(skillsNames).some(skill => p.includes(skill))
      );
      
      if (otherProfs.length > 0) {
        proficienciesText += otherProfs.join(", ");
      } else {
        proficienciesText += "—";
      }
    } else {
      proficienciesText += "—";
    }
    
    // Разделяем текст на строки, чтобы не выходить за рамки
    const languagesLines = doc.splitTextToSize(languagesText, 70);
    const profsLines = doc.splitTextToSize(proficienciesText, 70);
    
    doc.text(languagesLines, 15, 220);
    doc.text(profsLines, 15, 235);
    
    // Боевые характеристики
    // Класс доспеха
    doc.setFontSize(10);
    doc.circle(25, 105, 12, 'S');
    doc.text("КЛАСС", 25, 90, { align: "center" });
    doc.text("ДОСПЕХА", 25, 95, { align: "center" });
    
    // Рассчитываем КД
    const dexMod = getNumericModifier(character.abilities?.DEX || 10);
    let armorClass = 10 + dexMod; // Базовый КД без доспеха
    
    doc.setFontSize(14);
    doc.text(String(armorClass), 25, 108, { align: "center" });
    
    // Инициатива
    doc.setFontSize(10);
    doc.circle(55, 105, 12, 'S');
    doc.text("ИНИЦИАТИВА", 55, 90, { align: "center" });
    
    doc.setFontSize(14);
    doc.text(getModifier(dexMod), 55, 108, { align: "center" });
    
    // Скорость
    doc.setFontSize(10);
    doc.circle(85, 105, 12, 'S');
    doc.text("СКОРОСТЬ", 85, 90, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("30", 85, 108, { align: "center" }); // Базовая скорость для большинства рас
    
    // Здоровье
    doc.setFontSize(10);
    doc.text("МАКСИМУМ ХИТОВ", 55, 120, { align: "center" });
    doc.rect(25, 122, 60, 15, 'S');
    
    doc.setFontSize(14);
    doc.text(String(character.maxHp || 0), 55, 132, { align: "center" });
    
    doc.setFontSize(10);
    doc.text("ТЕКУЩИЕ ХИТЫ", 55, 145, { align: "center" });
    doc.rect(25, 147, 60, 25, 'S');
    
    doc.setFontSize(14);
    doc.text(String(character.currentHp || 0), 55, 160, { align: "center" });
    
    doc.setFontSize(10);
    doc.text("ВРЕМЕННЫЕ ХИТЫ", 55, 180, { align: "center" });
    doc.rect(25, 182, 60, 15, 'S');
    
    // Вторая страница
    doc.addPage();
    
    // Заголовок второй страницы
    doc.setFontSize(16);
    doc.text("СНАРЯЖЕНИЕ И ЗАКЛИНАНИЯ", 105, 15, { align: "center" });
    
    // Снаряжение
    doc.setFontSize(12);
    doc.text("СНАРЯЖЕНИЕ", 50, 25, { align: "center" });
    doc.rect(10, 27, 80, 100, 'S');
    
    let equipY = 35;
    if (character.equipment && character.equipment.length > 0) {
      character.equipment.forEach((item, index) => {
        if (index < 20) { // Ограничиваем количество предметов
          const itemText = doc.splitTextToSize(`• ${item}`, 70);
          doc.setFontSize(10);
          doc.text(itemText, 15, equipY);
          equipY += 5 * itemText.length;
        }
      });
    } else {
      doc.setFontSize(10);
      doc.text("Нет снаряжения", 15, equipY);
    }
    
    // Заклинания
    doc.setFontSize(12);
    doc.text("ЗАКЛИНАНИЯ", 150, 25, { align: "center" });
    doc.rect(100, 27, 100, 100, 'S');
    
    let spellY = 35;
    
    // Заголовки для ячеек заклинаний
    doc.setFontSize(10);
    doc.text("УРОВЕНЬ", 110, spellY);
    doc.text("ВСЕГО ЯЧЕЕК", 140, spellY);
    doc.text("ИСПОЛЬЗОВАНО", 170, spellY);
    spellY += 7;
    
    // Ячейки заклинаний
    if (character.spellSlots) {
      Object.entries(character.spellSlots).forEach(([level, slots]) => {
        doc.text(`${level}`, 110, spellY);
        doc.text(`${slots.max}`, 140, spellY);
        doc.text(`${slots.used}`, 170, spellY);
        spellY += 7;
      });
    }
    
    spellY += 5;
    doc.text("ИЗВЕСТНЫЕ ЗАКЛИНАНИЯ:", 110, spellY);
    spellY += 7;
    
    // Список заклинаний
    if (character.spells && character.spells.length > 0) {
      character.spells.forEach((spell, index) => {
        if (index < 15) {
          const spellText = doc.splitTextToSize(`• ${spell}`, 90);
          doc.text(spellText, 110, spellY);
          spellY += 5 * spellText.length;
        }
      });
    } else {
      doc.text("Нет известных заклинаний", 110, spellY);
    }
    
    // Предыстория
    doc.setFontSize(12);
    doc.text("ПРЕДЫСТОРИЯ ПЕРСОНАЖА", 105, 140, { align: "center" });
    doc.rect(10, 142, 190, 130, 'S');
    
    if (character.background) {
      const bgText = doc.splitTextToSize(character.background, 180);
      doc.setFontSize(10);
      doc.text(bgText, 15, 150);
    } else {
      doc.setFontSize(10);
      doc.text("Нет предыстории", 15, 150);
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
    // Создаем документ
    const doc = new jsPDF();
    doc.setFont("helvetica");
    
    // Остальной код генерации PDF такой же, как в функции generateCharacterPDF
    // Кроме последнего шага - здесь мы сохраняем вместо возврата URL
    
    // Название листа
    doc.setFontSize(16);
    doc.text("ЛИСТ ПЕРСОНАЖА D&D 5 РЕДАКЦИЯ", 105, 15, { align: "center" });
    
    // Основная информация - верхняя секция
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 20, 190, 25, 'F');
    doc.rect(10, 20, 190, 25, 'S');
    
    doc.setFontSize(10);
    doc.text("ИМЯ ПЕРСОНАЖА", 20, 25);
    doc.text("КЛАСС И УРОВЕНЬ", 85, 25);
    doc.text("ПРЕДЫСТОРИЯ", 140, 25);
    
    doc.setFontSize(12);
    doc.text(character.name || "—", 20, 32);
    doc.text(`${character.className || "—"} (${character.level})`, 85, 32);
    
    doc.text("РАСА", 20, 40);
    doc.text("МИРОВОЗЗРЕНИЕ", 85, 40);
    doc.text("ОПЫТ", 140, 40);
    
    doc.text(character.race || "—", 42, 40);
    doc.text(character.alignment || "—", 115, 40);
    doc.text("0", 155, 40);
    
    // Характеристики - левая колонка
    let xPos = 15;
    let yPos = 55;
    
    // Рисуем блоки характеристик
    if (character.abilities) {
      const abilityOrder = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
      
      abilityOrder.forEach((ability, index) => {
        const score = character.abilities[ability as keyof typeof character.abilities] || 10;
        
        if (index === 3) {
          // Переходим ко второй колонке для INT, WIS, CHA
          xPos = 15;
          yPos = 130;
        }
        
        drawAbilityBox(doc, xPos, yPos, ability, Number(score));
        xPos += 30;
      });
    }
    
    // Вдохновение, бонус мастерства и спасброски
    doc.setFontSize(10);
    doc.text("ВДОХНОВЕНИЕ", 100, 55);
    doc.rect(95, 57, 10, 10, 'S');
    
    doc.text("БОНУС МАСТЕРСТВА", 140, 55);
    doc.circle(105, 65, 8, 'S');
    doc.setFontSize(12);
    doc.text("+2", 105, 68, { align: "center" });
    
    // Спасброски
    doc.setFontSize(10);
    doc.text("СПАСБРОСКИ", 120, 80);
    
    const savesMod = {
      'STR': getNumericModifier(character.abilities?.STR || 10),
      'DEX': getNumericModifier(character.abilities?.DEX || 10),
      'CON': getNumericModifier(character.abilities?.CON || 10),
      'INT': getNumericModifier(character.abilities?.INT || 10),
      'WIS': getNumericModifier(character.abilities?.WIS || 10),
      'CHA': getNumericModifier(character.abilities?.CHA || 10)
    };
    
    // Спасброски - список
    let savesY = 90;
    const savesNames = {
      'STR': 'Сила',
      'DEX': 'Ловкость',
      'CON': 'Телосложение',
      'INT': 'Интеллект',
      'WIS': 'Мудрость',
      'CHA': 'Харизма'
    };
    
    Object.entries(savesNames).forEach(([ability, name]) => {
      // Проверяем, есть ли у персонажа профессия в этом спасброске
      const isProficient = character.proficiencies?.includes(`Спасбросок: ${name}`) || false;
      
      // Рисуем круг профессии
      doc.circle(104, savesY, 3, isProficient ? 'F' : 'S');
      
      // Модификатор спасброска
      const mod = getModifier(savesMod[ability as keyof typeof savesMod] + (isProficient ? 2 : 0));
      doc.text(mod, 115, savesY, { align: "center" });
      
      // Название спасброска
      doc.text(name, 130, savesY);
      
      savesY += 7;
    });
    
    // Навыки
    doc.text("НАВЫКИ", 120, 140);
    
    const skillsNames = {
      'Акробатика': 'DEX',
      'Анализ': 'INT',
      'Атлетика': 'STR',
      'Восприятие': 'WIS',
      'Выживание': 'WIS',
      'Выступление': 'CHA',
      'Запугивание': 'CHA',
      'История': 'INT',
      'Ловкость рук': 'DEX',
      'Магия': 'INT',
      'Медицина': 'WIS',
      'Обман': 'CHA',
      'Природа': 'INT',
      'Проницательность': 'WIS',
      'Религия': 'INT',
      'Скрытность': 'DEX',
      'Убеждение': 'CHA',
      'Уход за животными': 'WIS'
    };
    
    let skillsY = 150;
    
    Object.entries(skillsNames).forEach(([skill, ability]) => {
      // Проверяем, есть ли у персонажа профессия в этом навыке
      const isProficient = character.proficiencies?.some(p => 
        p.includes(skill) || 
        // Учитываем особенности именования навыков
        (skill === "Ловкость рук" && p.includes("Ловкость")) ||
        (skill === "Уход за животными" && p.includes("Уход"))
      ) || false;
      
      // Модификатор соответствующей характеристики
      const abilityMod = getNumericModifier(character.abilities?.[ability as keyof typeof character.abilities] || 10);
      const skillMod = abilityMod + (isProficient ? 2 : 0);
      
      // Рисуем навык
      drawSkill(doc, 100, skillsY, skill, isProficient, skillMod);
      
      skillsY += 7;
      
      // Если список слишком длинный, переходим на следующую страницу
      if (skillsY > 270) {
        skillsY = 20;
        doc.addPage();
      }
    });
    
    // Пассивная мудрость (восприятие)
    doc.rect(105, 280, 80, 15, 'S');
    doc.text("ПАССИВНАЯ МУДРОСТЬ (ВОСПРИЯТИЕ)", 145, 278, { align: "center" });
    
    const passivePerception = 10 + getNumericModifier(character.abilities?.WIS || 10) + 
      (character.proficiencies?.includes("Восприятие") ? 2 : 0);
    
    doc.setFontSize(14);
    doc.text(String(passivePerception), 145, 290, { align: "center" });
    
    // Языки и прочие владения
    doc.setFontSize(10);
    doc.rect(10, 210, 80, 75, 'S');
    doc.text("ЯЗЫКИ И ПРОЧИЕ ВЛАДЕНИЯ", 50, 208, { align: "center" });
    
    let languagesText = "Языки: ";
    if (character.languages && character.languages.length > 0) {
      languagesText += character.languages.join(", ");
    } else {
      languagesText += "Общий";
    }
    
    // Доп. владения
    let proficienciesText = "Владения: ";
    if (character.proficiencies && character.proficiencies.length > 0) {
      // Исключаем навыки и спасброски, которые уже отображаются в других местах
      const otherProfs = character.proficiencies.filter(p => 
        !p.startsWith("Спасбросок:") && 
        !Object.keys(skillsNames).some(skill => p.includes(skill))
      );
      
      if (otherProfs.length > 0) {
        proficienciesText += otherProfs.join(", ");
      } else {
        proficienciesText += "—";
      }
    } else {
      proficienciesText += "—";
    }
    
    // Разделяем текст на строки, чтобы не выходить за рамки
    const languagesLines = doc.splitTextToSize(languagesText, 70);
    const profsLines = doc.splitTextToSize(proficienciesText, 70);
    
    doc.text(languagesLines, 15, 220);
    doc.text(profsLines, 15, 235);
    
    // Боевые характеристики
    // Класс доспеха
    doc.setFontSize(10);
    doc.circle(25, 105, 12, 'S');
    doc.text("КЛАСС", 25, 90, { align: "center" });
    doc.text("ДОСПЕХА", 25, 95, { align: "center" });
    
    // Рассчитываем КД
    const dexMod = getNumericModifier(character.abilities?.DEX || 10);
    let armorClass = 10 + dexMod; // Базовый КД без доспеха
    
    doc.setFontSize(14);
    doc.text(String(armorClass), 25, 108, { align: "center" });
    
    // Инициатива
    doc.setFontSize(10);
    doc.circle(55, 105, 12, 'S');
    doc.text("ИНИЦИАТИВА", 55, 90, { align: "center" });
    
    doc.setFontSize(14);
    doc.text(getModifier(dexMod), 55, 108, { align: "center" });
    
    // Скорость
    doc.setFontSize(10);
    doc.circle(85, 105, 12, 'S');
    doc.text("СКОРОСТЬ", 85, 90, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("30", 85, 108, { align: "center" }); // Базовая скорость для большинства рас
    
    // Здоровье
    doc.setFontSize(10);
    doc.text("МАКСИМУМ ХИТОВ", 55, 120, { align: "center" });
    doc.rect(25, 122, 60, 15, 'S');
    
    doc.setFontSize(14);
    doc.text(String(character.maxHp || 0), 55, 132, { align: "center" });
    
    doc.setFontSize(10);
    doc.text("ТЕКУЩИЕ ХИТЫ", 55, 145, { align: "center" });
    doc.rect(25, 147, 60, 25, 'S');
    
    doc.setFontSize(14);
    doc.text(String(character.currentHp || 0), 55, 160, { align: "center" });
    
    doc.setFontSize(10);
    doc.text("ВРЕМЕННЫЕ ХИТЫ", 55, 180, { align: "center" });
    doc.rect(25, 182, 60, 15, 'S');
    
    // Вторая страница
    doc.addPage();
    
    // Заголовок второй страницы
    doc.setFontSize(16);
    doc.text("СНАРЯЖЕНИЕ И ЗАКЛИНАНИЯ", 105, 15, { align: "center" });
    
    // Снаряжение
    doc.setFontSize(12);
    doc.text("СНАРЯЖЕНИЕ", 50, 25, { align: "center" });
    doc.rect(10, 27, 80, 100, 'S');
    
    let equipY = 35;
    if (character.equipment && character.equipment.length > 0) {
      character.equipment.forEach((item, index) => {
        if (index < 20) { // Ограничиваем количество предметов
          const itemText = doc.splitTextToSize(`• ${item}`, 70);
          doc.setFontSize(10);
          doc.text(itemText, 15, equipY);
          equipY += 5 * itemText.length;
        }
      });
    } else {
      doc.setFontSize(10);
      doc.text("Нет снаряжения", 15, equipY);
    }
    
    // Заклинания
    doc.setFontSize(12);
    doc.text("ЗАКЛИНАНИЯ", 150, 25, { align: "center" });
    doc.rect(100, 27, 100, 100, 'S');
    
    let spellY = 35;
    
    // Заголовки для ячеек заклинаний
    doc.setFontSize(10);
    doc.text("УРОВЕНЬ", 110, spellY);
    doc.text("ВСЕГО ЯЧЕЕК", 140, spellY);
    doc.text("ИСПОЛЬЗОВАНО", 170, spellY);
    spellY += 7;
    
    // Ячейки заклинаний
    if (character.spellSlots) {
      Object.entries(character.spellSlots).forEach(([level, slots]) => {
        doc.text(`${level}`, 110, spellY);
        doc.text(`${slots.max}`, 140, spellY);
        doc.text(`${slots.used}`, 170, spellY);
        spellY += 7;
      });
    }
    
    spellY += 5;
    doc.text("ИЗВЕСТНЫЕ ЗАКЛИНАНИЯ:", 110, spellY);
    spellY += 7;
    
    // Список заклинаний
    if (character.spells && character.spells.length > 0) {
      character.spells.forEach((spell, index) => {
        if (index < 15) {
          const spellText = doc.splitTextToSize(`• ${spell}`, 90);
          doc.text(spellText, 110, spellY);
          spellY += 5 * spellText.length;
        }
      });
    } else {
      doc.text("Нет известных заклинаний", 110, spellY);
    }
    
    // Предыстория
    doc.setFontSize(12);
    doc.text("ПРЕДЫСТОРИЯ ПЕРСОНАЖА", 105, 140, { align: "center" });
    doc.rect(10, 142, 190, 130, 'S');
    
    if (character.background) {
      const bgText = doc.splitTextToSize(character.background, 180);
      doc.setFontSize(10);
      doc.text(bgText, 15, 150);
    } else {
      doc.setFontSize(10);
      doc.text("Нет предыстории", 15, 150);
    }
    
    // Сохраняем документ
    doc.save(`${character.name || 'персонаж'}_dnd.pdf`);
  } catch (error) {
    console.error("Ошибка при сохранении PDF:", error);
  }
};
