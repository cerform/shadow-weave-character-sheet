
import { jsPDF } from 'jspdf';
import { Character } from '@/contexts/CharacterContext';
import { Shield, Sword, Book, Heart, CircleCheck } from 'lucide-react';

// Добавляем шрифты для лучшего визуального оформления
import '@/fonts/dnd-fonts';

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

// Функция для рисования рамки с характеристикой в официальном стиле D&D
const drawAbilityBox = (doc: jsPDF, x: number, y: number, ability: string, score: number) => {
  // Название характеристики
  doc.setFontSize(10);
  doc.text(getAbilityName(ability), x + 15, y - 5, { align: "center" });
  
  // Круг с модификатором
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.circle(x + 15, y + 15, 12, 'S');
  
  // Модификатор в круге
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(getModifier(score), x + 15, y + 17, { align: "center" });
  doc.setFont("helvetica", "normal");
  
  // Значение характеристики
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(x + 5, y + 28, 20, 15, 'S');
  doc.setFontSize(14);
  // Исправление 1: Преобразуем числовое значение в строку
  doc.text(String(score), x + 15, y + 37, { align: "center" });
};

// Функция для рисования навыка
const drawSkill = (doc: jsPDF, x: number, y: number, skillName: string, isProficient: boolean, modifier: number) => {
  // Круг профессии (закрашенный или пустой)
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.circle(x + 4, y + 4, 3, 'S');
  
  if (isProficient) {
    doc.setFillColor(0);
    doc.circle(x + 4, y + 4, 3, 'F');
  }
  
  // Модификатор навыка
  const skillMod = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  doc.setFontSize(10);
  doc.text(skillMod, x + 15, y + 4, { align: "center" });
  
  // Название навыка
  doc.text(skillName, x + 30, y + 4, { align: "left" });
};

// Основная функция для генерации PDF листа персонажа в стиле D&D 5E
export const generateCharacterPDF = (character: Character): string => {
  try {
    // Создаем документ A4
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Устанавливаем шрифт
    doc.setFont("helvetica");
    
    // Верхний заголовок
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ЛИСТ ПЕРСОНАЖА D&D 5 РЕДАКЦИЯ", 105, 15, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Основная информация - верхняя секция (серая рамка)
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 20, 190, 30, 'FD');
    
    // Разделяем серую рамку на секции
    doc.setDrawColor(0);
    doc.line(70, 20, 70, 50); // Вертикальная линия 1
    doc.line(135, 20, 135, 50); // Вертикальная линия 2
    doc.line(10, 35, 200, 35); // Горизонтальная линия
    
    // Заголовки секций
    doc.setFontSize(8);
    doc.text("ИМЯ ПЕРСОНАЖА", 15, 25);
    doc.text("КЛАСС И УРОВЕНЬ", 75, 25);
    doc.text("ПРЕДЫСТОРИЯ", 140, 25);
    
    doc.text("РАСА", 15, 40);
    doc.text("МИРОВОЗЗРЕНИЕ", 75, 40);
    doc.text("ОПЫТ", 140, 40);
    
    // Заполняем данные персонажа
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(character.name || "—", 15, 32);
    doc.text(`${character.className || "—"} ${character.level}`, 75, 32);
    doc.text(character.background?.substring(0, 20) || "—", 140, 32);
    
    doc.text(character.race || "—", 15, 47);
    doc.text(character.alignment || "—", 75, 47);
    doc.text("0", 140, 47);
    doc.setFont("helvetica", "normal");
    
    // Основная сетка характеристик
    // Первый ряд: СИЛ, ЛОВ, ТЕЛ
    let yPos = 60;
    drawAbilityBox(doc, 20, yPos, "STR", character.abilities?.STR || 10);
    drawAbilityBox(doc, 70, yPos, "DEX", character.abilities?.DEX || 10);
    drawAbilityBox(doc, 120, yPos, "CON", character.abilities?.CON || 10);
    
    // Второй ряд: ИНТ, МУД, ХАР
    yPos += 55;
    drawAbilityBox(doc, 20, yPos, "INT", character.abilities?.INT || 10);
    drawAbilityBox(doc, 70, yPos, "WIS", character.abilities?.WIS || 10);
    drawAbilityBox(doc, 120, yPos, "CHA", character.abilities?.CHA || 10);
    
    // Блок вдохновения и бонуса мастерства
    yPos = 60;
    doc.setFontSize(10);
    doc.text("ВДОХНОВЕНИЕ", 170, yPos);
    doc.rect(170, yPos + 2, 10, 10, 'S');
    
    yPos += 20;
    doc.text("БОНУС МАСТЕРСТВА", 170, yPos);
    doc.circle(175, yPos + 10, 8, 'S');
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("+2", 175, yPos + 12, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Блок спасбросков
    yPos += 25;
    doc.setFontSize(10);
    doc.text("СПАСБРОСКИ", 170, yPos);
    doc.setLineWidth(0.3);
    doc.line(150, yPos + 2, 190, yPos + 2);
    
    const savesMod = {
      'STR': getNumericModifier(character.abilities?.STR || 10),
      'DEX': getNumericModifier(character.abilities?.DEX || 10),
      'CON': getNumericModifier(character.abilities?.CON || 10),
      'INT': getNumericModifier(character.abilities?.INT || 10),
      'WIS': getNumericModifier(character.abilities?.WIS || 10),
      'CHA': getNumericModifier(character.abilities?.CHA || 10)
    };
    
    // Спасброски - список
    yPos += 7;
    const savesNames = {
      'STR': 'Сила',
      'DEX': 'Ловкость',
      'CON': 'Телосложение',
      'INT': 'Интеллект',
      'WIS': 'Мудрость',
      'CHA': 'Харизма'
    };
    
    Object.entries(savesNames).forEach(([ability, name], index) => {
      // Проверяем, есть ли у персонажа профессия в этом спасброске
      const isProficient = character.proficiencies?.includes(`Спасбросок: ${name}`) || false;
      
      // Рисуем круг профессии
      doc.setDrawColor(0);
      doc.circle(155, yPos, 3, 'S');
      if (isProficient) {
        doc.setFillColor(0);
        doc.circle(155, yPos, 3, 'F');
      }
      
      // Модификатор спасброска
      const mod = savesMod[ability as keyof typeof savesMod] + (isProficient ? 2 : 0);
      const modString = mod >= 0 ? `+${mod}` : `${mod}`;
      doc.text(modString, 165, yPos, { align: "center" });
      
      // Название спасброска
      doc.text(name, 175, yPos, { align: "left" });
      
      yPos += 7;
    });
    
    // Блок навыков
    yPos += 5;
    doc.setFontSize(10);
    doc.text("НАВЫКИ", 170, yPos);
    doc.setLineWidth(0.3);
    doc.line(150, yPos + 2, 190, yPos + 2);
    
    // Список навыков с соответствующими характеристиками
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
    
    yPos += 7;
    
    Object.entries(skillsNames).forEach(([skill, ability]) => {
      // Проверяем, есть ли у персонажа профессия в этом навыке
      const isProficient = character.proficiencies?.some(p => 
        p.includes(skill) || 
        (skill === "Ловкость рук" && p.includes("Ловкость")) ||
        (skill === "Уход за животными" && p.includes("Уход"))
      ) || false;
      
      // Модификатор соответствующей характеристики
      const abilityMod = getNumericModifier(character.abilities?.[ability as keyof typeof character.abilities] || 10);
      const skillMod = abilityMod + (isProficient ? 2 : 0);
      
      // Рисуем навык
      drawSkill(doc, 150, yPos, skill, isProficient, skillMod);
      
      yPos += 7;
      
      // Если список слишком длинный, переходим на новую страницу
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Пассивная мудрость (восприятие)
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(10, 170, 130, 15, 'S');
    doc.text("ПАССИВНАЯ МУДРОСТЬ (ВОСПРИЯТИЕ)", 75, 168, { align: "center" });
    
    const passivePerception = 10 + getNumericModifier(character.abilities?.WIS || 10) + 
      (character.proficiencies?.includes("Восприятие") ? 2 : 0);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    // Исправление 2: Преобразуем числовое значение в строку
    doc.text(String(passivePerception), 75, 180, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Боевые характеристики
    // Класс доспеха, инициатива, скорость
    doc.setFontSize(10);
    doc.setLineWidth(0.5);
    
    // Класс доспеха
    let xPos = 15;
    yPos = 190;
    doc.circle(xPos + 10, yPos + 15, 15, 'S');
    doc.text("КЛАСС", xPos + 10, yPos, { align: "center" });
    doc.text("ДОСПЕХА", xPos + 10, yPos + 5, { align: "center" });
    
    // Рассчитываем КД
    const dexMod = getNumericModifier(character.abilities?.DEX || 10);
    let armorClass = 10 + dexMod; // Базовый КД без доспеха
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    // Исправление: преобразуем числовое значение в строку
    doc.text(String(armorClass), xPos + 10, yPos + 18, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Инициатива
    xPos += 50;
    doc.circle(xPos + 10, yPos + 15, 15, 'S');
    doc.setFontSize(10);
    doc.text("ИНИЦИАТИВА", xPos + 10, yPos + 2, { align: "center" });
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(getModifier(dexMod), xPos + 10, yPos + 18, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Скорость
    xPos += 50;
    doc.circle(xPos + 10, yPos + 15, 15, 'S');
    doc.setFontSize(10);
    doc.text("СКОРОСТЬ", xPos + 10, yPos + 2, { align: "center" });
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("30", xPos + 10, yPos + 18, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Здоровье
    yPos += 40;
    doc.setFontSize(10);
    doc.text("ТЕКУЩИЕ ХИТЫ", 45, yPos, { align: "center" });
    
    // Большой блок для текущих ХП
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.rect(10, yPos, 70, 40, 'S');
    
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    // Исправление: преобразуем числовое значение в строку
    doc.text(String(character.currentHp || 0), 45, yPos + 25, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Информация о максимуме хитов
    yPos += 45;
    doc.setFontSize(10);
    doc.text("МАКСИМУМ ХИТОВ", 45, yPos, { align: "center" });
    
    // Поле для максимума ХП
    yPos += 5;
    doc.rect(10, yPos, 70, 15, 'S');
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    // Исправление: преобразуем числовое значение в строку
    doc.text(String(character.maxHp || 0), 45, yPos + 10, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Временные хиты
    yPos += 20;
    doc.setFontSize(10);
    doc.text("ВРЕМЕННЫЕ ХИТЫ", 45, yPos, { align: "center" });
    
    // Поле для временных ХП
    yPos += 5;
    doc.rect(10, yPos, 70, 15, 'S');
    
    // Кубики хитов
    yPos = 230;
    xPos = 100;
    doc.setFontSize(10);
    doc.text("КУБИКИ ХИТОВ", xPos + 25, yPos, { align: "center" });
    
    // Поле для кубиков хитов
    yPos += 5;
    doc.rect(xPos, yPos, 50, 15, 'S');
    
    // Определяем кубик хитов по классу
    let hitDie = "d8";
    switch(character.className?.split(' ')[0]) {
      case "Варвар": hitDie = "d12"; break;
      case "Воин":
      case "Паладин":
      case "Следопыт": hitDie = "d10"; break;
      case "Волшебник":
      case "Чародей": hitDie = "d6"; break;
    }
    
    doc.setFontSize(12);
    doc.text(`${character.level}${hitDie}`, xPos + 25, yPos + 10, { align: "center" });
    
    // Спасброски от смерти
    yPos += 25;
    doc.setFontSize(10);
    doc.text("СПАСБРОСКИ ОТ СМЕРТИ", xPos + 25, yPos, { align: "center" });
    
    // Поля для успехов и провалов
    yPos += 5;
    doc.setFontSize(8);
    doc.text("УСПЕХИ", xPos + 5, yPos + 5);
    
    // Круги для успехов
    for (let i = 0; i < 3; i++) {
      doc.circle(xPos + 25 + i * 7, yPos + 5, 3, 'S');
    }
    
    yPos += 10;
    doc.text("ПРОВАЛЫ", xPos + 5, yPos + 5);
    
    // Круги для провалов
    for (let i = 0; i < 3; i++) {
      doc.circle(xPos + 25 + i * 7, yPos + 5, 3, 'S');
    }
    
    // Языки и прочие владения
    yPos = 145;
    xPos = 150;
    doc.setFontSize(10);
    doc.text("ЯЗЫКИ И ВЛАДЕНИЯ", xPos + 25, yPos - 2, { align: "center" });
    doc.rect(xPos, yPos, 50, 50, 'S');
    
    yPos += 5;
    xPos += 5;
    doc.setFontSize(8);
    
    // Перечисляем языки
    let languagesText = "Языки: ";
    if (character.languages && character.languages.length > 0) {
      languagesText += character.languages.join(", ");
    } else {
      languagesText += "Общий";
    }
    
    // Перечисляем владения
    let proficienciesText = "Владения: ";
    if (character.proficiencies && character.proficiencies.length > 0) {
      // Фильтруем навыки и спасброски, которые уже отображены в других местах
      const otherProfs = character.proficiencies.filter(p => 
        !p.startsWith("Спасбросок:") && 
        !Object.keys(skillsNames).some(skill => p.includes(skill))
      );
      
      proficienciesText += otherProfs.join(", ");
    } else {
      proficienciesText += "—";
    }
    
    // Разбиваем текст на строки, чтобы он поместился
    const languagesLines = doc.splitTextToSize(languagesText, 40);
    doc.text(languagesLines, xPos, yPos);
    
    yPos += languagesLines.length * 4;
    const profsLines = doc.splitTextToSize(proficienciesText, 40);
    doc.text(profsLines, xPos, yPos);
    
    // Вторая страница с заклинаниями и снаряжением
    doc.addPage();
    
    // Заголовок второй страницы
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("СНАРЯЖЕНИЕ И ЗАКЛИНАНИЯ", 105, 15, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Секция снаряжения
    yPos = 25;
    doc.setFontSize(12);
    doc.text("СНАРЯЖЕНИЕ И МОНЕТЫ", 50, yPos, { align: "center" });
    doc.setLineWidth(0.5);
    doc.rect(10, yPos + 2, 80, 80, 'S');
    
    // Список снаряжения
    yPos += 7;
    xPos = 15;
    if (character.equipment && character.equipment.length > 0) {
      character.equipment.forEach((item, index) => {
        if (index < 15) {
          const itemText = doc.splitTextToSize(`• ${item}`, 70);
          doc.setFontSize(10);
          doc.text(itemText, xPos, yPos);
          yPos += 5 * itemText.length;
        }
      });
    } else {
      doc.setFontSize(10);
      doc.text("Нет снаряжения", xPos, yPos);
    }
    
    // Секция с монетами
    yPos = 112;
    doc.setFontSize(10);
    doc.text("МОНЕТЫ", 50, yPos - 2, { align: "center" });
    
    // Таблица для монет
    doc.rect(10, yPos, 80, 20, 'S');
    
    // Разделители для разных типов монет
    doc.line(10, yPos + 10, 90, yPos + 10);
    doc.line(26, yPos, 26, yPos + 20);
    doc.line(42, yPos, 42, yPos + 20);
    doc.line(58, yPos, 58, yPos + 20);
    doc.line(74, yPos, 74, yPos + 20);
    
    // Названия типов монет
    doc.setFontSize(8);
    doc.text("ММ", 18, yPos + 5, { align: "center" });
    doc.text("СМ", 34, yPos + 5, { align: "center" });
    doc.text("ЭМ", 50, yPos + 5, { align: "center" });
    doc.text("ЗМ", 66, yPos + 5, { align: "center" });
    doc.text("ПМ", 82, yPos + 5, { align: "center" });
    
    // Заклинания
    xPos = 100;
    yPos = 25;
    doc.setFontSize(12);
    doc.text("ЗАКЛИНАНИЯ", 150, yPos, { align: "center" });
    doc.rect(xPos, yPos + 2, 100, 107, 'S');
    
    // Информация о заклинаниях
    yPos += 7;
    xPos += 5;
    doc.setFontSize(10);
    doc.text("Базовая характеристика:", xPos, yPos);
    
    // Определяем базовую характеристику заклинаний по классу
    let spellAbility = "—";
    switch(character.className?.split(' ')[0]) {
      case "Волшебник": spellAbility = "Интеллект"; break;
      case "Чародей":
      case "Бард":
      case "Чернокнижник": spellAbility = "Харизма"; break;
      case "Жрец":
      case "Друид": spellAbility = "Мудрость"; break;
      case "Паладин":
      case "Следопыт": spellAbility = "Мудрость"; break;
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(spellAbility, xPos + 45, yPos);
    doc.setFont("helvetica", "normal");
    
    yPos += 5;
    doc.text("Сложность спас. от закл.:", xPos, yPos);
    
    // Расчет СЛ заклинаний
    let spellDC = "—";
    if (spellAbility !== "—") {
      const abilityKey = spellAbility === "Интеллект" ? "INT" : 
                        (spellAbility === "Мудрость" ? "WIS" : "CHA");
      const abilityMod = getNumericModifier(character.abilities?.[abilityKey as keyof typeof character.abilities] || 10);
      spellDC = String(8 + abilityMod + 2); // 8 + модификатор + бонус мастерства
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(spellDC, xPos + 45, yPos);
    doc.setFont("helvetica", "normal");
    
    yPos += 5;
    doc.text("Бонус атаки заклинанием:", xPos, yPos);
    
    // Расчет бонуса атаки заклинаниями
    let spellAttack = "—";
    if (spellAbility !== "—") {
      const abilityKey = spellAbility === "Интеллект" ? "INT" : 
                        (spellAbility === "Мудрость" ? "WIS" : "CHA");
      const abilityMod = getNumericModifier(character.abilities?.[abilityKey as keyof typeof character.abilities] || 10);
      const attackBonus = abilityMod + 2; // модификатор + бонус мастерства
      spellAttack = attackBonus >= 0 ? `+${attackBonus}` : String(attackBonus);
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(spellAttack, xPos + 45, yPos);
    doc.setFont("helvetica", "normal");
    
    // Таблица ячеек заклинаний
    yPos += 10;
    doc.setFontSize(9);
    doc.text("УРОВЕНЬ", xPos, yPos);
    doc.text("ВСЕГО ЯЧЕЕК", xPos + 30, yPos);
    doc.text("ИСПОЛЬЗОВАНО", xPos + 70, yPos);
    
    yPos += 5;
    doc.line(xPos, yPos, xPos + 95, yPos);
    
    yPos += 5;
    
    // Отображаем доступные ячейки заклинаний
    if (character.spellSlots && Object.keys(character.spellSlots).length > 0) {
      Object.entries(character.spellSlots).forEach(([level, slots]) => {
        doc.text(`${level}`, xPos, yPos);
        // Исправление: преобразуем числовое значение в строку
        doc.text(String(slots.max), xPos + 35, yPos);
        // Исправление: преобразуем числовое значение в строку
        doc.text(String(slots.used), xPos + 75, yPos);
        yPos += 7;
      });
    } else {
      doc.text("Нет ячеек заклинаний", xPos, yPos);
      yPos += 7;
    }
    
    // Список известных заклинаний
    yPos += 5;
    doc.setFontSize(10);
    doc.text("ИЗВЕСТНЫЕ ЗАКЛИНАНИЯ:", xPos, yPos);
    doc.line(xPos, yPos + 2, xPos + 95, yPos + 2);
    
    yPos += 7;
    
    // Перечисляем заклинания персонажа
    if (character.spells && character.spells.length > 0) {
      character.spells.forEach((spell: string, index: number) => {
        if (index < 12) {
          const spellText = doc.splitTextToSize(`• ${spell}`, 90);
          doc.text(spellText, xPos, yPos);
          yPos += 5 * spellText.length;
        }
      });
    } else {
      doc.text("Нет известных заклинаний", xPos, yPos);
    }
    
    // Предыстория персонажа
    yPos = 140;
    doc.setFontSize(12);
    doc.text("ПРЕДЫСТОРИЯ ПЕРСОНАЖА", 105, yPos - 2, { align: "center" });
    doc.setLineWidth(0.5);
    doc.rect(10, yPos, 190, 130, 'S');
    
    yPos += 10;
    xPos = 15;
    
    if (character.background) {
      const bgText = doc.splitTextToSize(character.background, 180);
      doc.setFontSize(10);
      doc.text(bgText, xPos, yPos);
    } else {
      doc.setFontSize(10);
      doc.text("У персонажа нет предыстории", xPos, yPos);
    }
    
    // Добавляем характерные черты, связи, идеалы и слабости
    yPos = 230;
    doc.setFontSize(12);
    doc.text("ХАРАКТЕРНЫЕ ЧЕРТЫ", 55, yPos - 2, { align: "center" });
    doc.rect(10, yPos, 90, 40, 'S');
    
    doc.text("ИДЕАЛЫ", 155, yPos - 2, { align: "center" });
    doc.rect(110, yPos, 90, 40, 'S');
    
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
    // Создаем документ A4
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Устанавливаем шрифт
    doc.setFont("helvetica");
    
    // Верхний заголовок
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ЛИСТ ПЕРСОНАЖА D&D 5 РЕДАКЦИЯ", 105, 15, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Основная информация - верхняя секция (серая рамка)
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 20, 190, 30, 'FD');
    
    // Разделяем серую рамку на секции
    doc.setDrawColor(0);
    doc.line(70, 20, 70, 50); // Вертикальная линия 1
    doc.line(135, 20, 135, 50); // Вертикальная линия 2
    doc.line(10, 35, 200, 35); // Горизонтальная линия
    
    // Заголовки секций
    doc.setFontSize(8);
    doc.text("ИМЯ ПЕРСОНАЖА", 15, 25);
    doc.text("КЛАСС И УРОВЕНЬ", 75, 25);
    doc.text("ПРЕДЫСТОРИЯ", 140, 25);
    
    doc.text("РАСА", 15, 40);
    doc.text("МИРОВОЗЗРЕНИЕ", 75, 40);
    doc.text("ОПЫТ", 140, 40);
    
    // Заполняем данные персонажа
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(character.name || "—", 15, 32);
    doc.text(`${character.className || "—"} ${character.level}`, 75, 32);
    doc.text(character.background?.substring(0, 20) || "—", 140, 32);
    
    doc.text(character.race || "—", 15, 47);
    doc.text(character.alignment || "—", 75, 47);
    doc.text("0", 140, 47);
    doc.setFont("helvetica", "normal");
    
    // Основная сетка характеристик
    // Первый ряд: СИЛ, ЛОВ, ТЕЛ
    let yPos = 60;
    drawAbilityBox(doc, 20, yPos, "STR", character.abilities?.STR || 10);
    drawAbilityBox(doc, 70, yPos, "DEX", character.abilities?.DEX || 10);
    drawAbilityBox(doc, 120, yPos, "CON", character.abilities?.CON || 10);
    
    // Второй ряд: ИНТ, МУД, ХАР
    yPos += 55;
    drawAbilityBox(doc, 20, yPos, "INT", character.abilities?.INT || 10);
    drawAbilityBox(doc, 70, yPos, "WIS", character.abilities?.WIS || 10);
    drawAbilityBox(doc, 120, yPos, "CHA", character.abilities?.CHA || 10);
    
    // Блок вдохновения и бонуса мастерства
    yPos = 60;
    doc.setFontSize(10);
    doc.text("ВДОХНОВЕНИЕ", 170, yPos);
    doc.rect(170, yPos + 2, 10, 10, 'S');
    
    yPos += 20;
    doc.text("БОНУС МАСТЕРСТВА", 170, yPos);
    doc.circle(175, yPos + 10, 8, 'S');
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("+2", 175, yPos + 12, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Блок спасбросков
    yPos += 25;
    doc.setFontSize(10);
    doc.text("СПАСБРОСКИ", 170, yPos);
    doc.setLineWidth(0.3);
    doc.line(150, yPos + 2, 190, yPos + 2);
    
    const savesMod = {
      'STR': getNumericModifier(character.abilities?.STR || 10),
      'DEX': getNumericModifier(character.abilities?.DEX || 10),
      'CON': getNumericModifier(character.abilities?.CON || 10),
      'INT': getNumericModifier(character.abilities?.INT || 10),
      'WIS': getNumericModifier(character.abilities?.WIS || 10),
      'CHA': getNumericModifier(character.abilities?.CHA || 10)
    };
    
    // Спасброски - список
    yPos += 7;
    const savesNames = {
      'STR': 'Сила',
      'DEX': 'Ловкость',
      'CON': 'Телосложение',
      'INT': 'Интеллект',
      'WIS': 'Мудрость',
      'CHA': 'Харизма'
    };
    
    Object.entries(savesNames).forEach(([ability, name], index) => {
      // Проверяем, есть ли у персонажа профессия в этом спасброске
      const isProficient = character.proficiencies?.includes(`Спасбросок: ${name}`) || false;
      
      // Рисуем круг профессии
      doc.setDrawColor(0);
      doc.circle(155, yPos, 3, 'S');
      if (isProficient) {
        doc.setFillColor(0);
        doc.circle(155, yPos, 3, 'F');
      }
      
      // Модификатор спасброска
      const mod = savesMod[ability as keyof typeof savesMod] + (isProficient ? 2 : 0);
      const modString = mod >= 0 ? `+${mod}` : `${mod}`;
      doc.text(modString, 165, yPos, { align: "center" });
      
      // Название спасброска
      doc.text(name, 175, yPos, { align: "left" });
      
      yPos += 7;
    });
    
    // Блок навыков
    yPos += 5;
    doc.setFontSize(10);
    doc.text("НАВЫКИ", 170, yPos);
    doc.setLineWidth(0.3);
    doc.line(150, yPos + 2, 190, yPos + 2);
    
    // Список навыков с соответствующими характеристиками
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
    
    yPos += 7;
    
    Object.entries(skillsNames).forEach(([skill, ability]) => {
      // Проверяем, есть ли у персонажа профессия в этом навыке
      const isProficient = character.proficiencies?.some(p => 
        p.includes(skill) || 
        (skill === "Ловкость рук" && p.includes("Ловкость")) ||
        (skill === "Уход за животными" && p.includes("Уход"))
      ) || false;
      
      // Модификатор соответствующей характеристики
      const abilityMod = getNumericModifier(character.abilities?.[ability as keyof typeof character.abilities] || 10);
      const skillMod = abilityMod + (isProficient ? 2 : 0);
      
      // Рисуем навык
      drawSkill(doc, 150, yPos, skill, isProficient, skillMod);
      
      yPos += 7;
      
      // Если список слишком длинный, переходим на новую страницу
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Пассивная мудрость (восприятие)
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(10, 170, 130, 15, 'S');
    doc.text("ПАССИВНАЯ МУДРОСТЬ (ВОСПРИЯТИЕ)", 75, 168, { align: "center" });
    
    const passivePerception = 10 + getNumericModifier(character.abilities?.WIS || 10) + 
      (character.proficiencies?.includes("Восприятие") ? 2 : 0);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    // Исправление 3: Преобразуем числовое значение в строку
    doc.text(String(passivePerception), 75, 180, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Боевые характеристики
    // Класс доспеха, инициатива, скорость
    doc.setFontSize(10);
    doc.setLineWidth(0.5);
    
    // Класс доспеха
    let xPos = 15;
    yPos = 190;
    doc.circle(xPos + 10, yPos + 15, 15, 'S');
    doc.text("КЛАСС", xPos + 10, yPos, { align: "center" });
    doc.text("ДОСПЕХА", xPos + 10, yPos + 5, { align: "center" });
    
    // Рассчитываем КД
    const dexMod = getNumericModifier(character.abilities?.DEX || 10);
    let armorClass = 10 + dexMod; // Базовый КД без доспеха
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    // Исправление: преобразуем числовое значение в строку
    doc.text(String(armorClass), xPos + 10, yPos + 18, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Инициатива
    xPos += 50;
    doc.circle(xPos + 10, yPos + 15, 15, 'S');
    doc.setFontSize(10);
    doc.text("ИНИЦИАТИВА", xPos + 10, yPos + 2, { align: "center" });
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(getModifier(dexMod), xPos + 10, yPos + 18, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Скорость
    xPos += 50;
    doc.circle(xPos + 10, yPos + 15, 15, 'S');
    doc.setFontSize(10);
    doc.text("СКОРОСТЬ", xPos + 10, yPos + 2, { align: "center" });
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("30", xPos + 10, yPos + 18, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Здоровье
    yPos += 40;
    doc.setFontSize(10);
    doc.text("ТЕКУЩИЕ ХИТЫ", 45, yPos, { align: "center" });
    
    // Большой блок для текущих ХП
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.rect(10, yPos, 70, 40, 'S');
    
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    // Исправление: преобразуем числовое значение в строку
    doc.text(String(character.currentHp || 0), 45, yPos + 25, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Информация о максимуме хитов
    yPos += 45;
    doc.setFontSize(10);
    doc.text("МАКСИМУМ ХИТОВ", 45, yPos, { align: "center" });
    
    // Поле для максимума ХП
    yPos += 5;
    doc.rect(10, yPos, 70, 15, 'S');
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    // Исправление: преобразуем числовое значение в строку
    doc.text(String(character.maxHp || 0), 45, yPos + 10, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Временные хиты
    yPos += 20;
    doc.setFontSize(10);
    doc.text("ВРЕМЕННЫЕ ХИТЫ", 45, yPos, { align: "center" });
    
    // Поле для временных ХП
    yPos += 5;
    doc.rect(10, yPos, 70, 15, 'S');
    
    // Кубики хитов
    yPos = 230;
    xPos = 100;
    doc.setFontSize(10);
    doc.text("КУБИКИ ХИТОВ", xPos + 25, yPos, { align: "center" });
    
    // Поле для кубиков хитов
    yPos += 5;
    doc.rect(xPos, yPos, 50, 15, 'S');
    
    // Определяем кубик хитов по классу
    let hitDie = "d8";
    switch(character.className?.split(' ')[0]) {
      case "Варвар": hitDie = "d12"; break;
      case "Воин":
      case "Паладин":
      case "Следопыт": hitDie = "d10"; break;
      case "Волшебник":
      case "Чародей": hitDie = "d6"; break;
    }
    
    doc.setFontSize(12);
    doc.text(`${character.level}${hitDie}`, xPos + 25, yPos + 10, { align: "center" });
    
    // Спасброски от смерти
    yPos += 25;
    doc.setFontSize(10);
    doc.text("СПАСБРОСКИ ОТ СМЕРТИ", xPos + 25, yPos, { align: "center" });
    
    // Поля для успехов и провалов
    yPos += 5;
    doc.setFontSize(8);
    doc.text("УСПЕХИ", xPos + 5, yPos + 5);
    
    // Круги для успехов
    for (let i = 0; i < 3; i++) {
      doc.circle(xPos + 25 + i * 7, yPos + 5, 3, 'S');
    }
    
    yPos += 10;
    doc.text("ПРОВАЛЫ", xPos + 5, yPos + 5);
    
    // Круги для провалов
    for (let i = 0; i < 3; i++) {
      doc.circle(xPos + 25 + i * 7, yPos + 5, 3, 'S');
    }
    
    // Языки и прочие владения
    yPos = 145;
    xPos = 150;
    doc.setFontSize(10);
    doc.text("ЯЗЫКИ И ВЛАДЕНИЯ", xPos + 25, yPos - 2, { align: "center" });
    doc.rect(xPos, yPos, 50, 50, 'S');
    
    yPos += 5;
    xPos += 5;
    doc.setFontSize(8);
    
    // Перечисляем языки
    let languagesText = "Языки: ";
    if (character.languages && character.languages.length > 0) {
      languagesText += character.languages.join(", ");
    } else {
      languagesText += "Общий";
    }
    
    // Перечисляем владения
    let proficienciesText = "Владения: ";
    if (character.proficiencies && character.proficiencies.length > 0) {
      // Фильтруем навыки и спасброски, которые уже отображены в других местах
      const otherProfs = character.proficiencies.filter(p => 
        !p.startsWith("Спасбросок:") && 
        !Object.keys(skillsNames).some(skill => p.includes(skill))
      );
      
      proficienciesText += otherProfs.join(", ");
    } else {
      proficienciesText += "—";
    }
    
    // Разбиваем текст на строки, чтобы он поместился
    const languagesLines = doc.splitTextToSize(languagesText, 40);
    doc.text(languagesLines, xPos, yPos);
    
    yPos += languagesLines.length * 4;
    const profsLines = doc.splitTextToSize(proficienciesText, 40);
    doc.text(profsLines, xPos, yPos);
    
    // Вторая страница с заклинаниями и снаряжением
    doc.addPage();
    
    // Заголовок второй страницы
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("СНАРЯЖЕНИЕ И ЗАКЛИНАНИЯ", 105, 15, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Секция снаряжения
    yPos = 25;
    doc.setFontSize(12);
    doc.text("СНАРЯЖЕНИЕ И МОНЕТЫ", 50, yPos, { align: "center" });
    doc.setLineWidth(0.5);
    doc.rect(10, yPos + 2, 80, 80, 'S');
    
    // Список снаряжения
    yPos += 7;
    xPos = 15;
    if (character.equipment && character.equipment.length > 0) {
      character.equipment.forEach((item, index) => {
        if (index < 15) {
          const itemText = doc.splitTextToSize(`• ${item}`, 70);
          doc.setFontSize(10);
          doc.text(itemText, xPos, yPos);
          yPos += 5 * itemText.length;
        }
      });
    } else {
      doc.setFontSize(10);
      doc.text("Нет снаряжения", xPos, yPos);
    }
    
    // Секция с монетами
    yPos = 112;
    doc.setFontSize(10);
    doc.text("МОНЕТЫ", 50, yPos - 2, { align: "center" });
    
    // Таблица для монет
    doc.rect(10, yPos, 80, 20, 'S');
    
    // Разделители для разных типов монет
    doc.line(10, yPos + 10, 90, yPos + 10);
    doc.line(26, yPos, 26, yPos + 20);
    doc.line(42, yPos, 42, yPos + 20);
    doc.line(58, yPos, 58, yPos + 20);
    doc.line(74, yPos, 74, yPos + 20);
    
    // Названия типов монет
    doc.setFontSize(8);
    doc.text("ММ", 18, yPos + 5, { align: "center" });
    doc.text("СМ", 34, yPos + 5, { align: "center" });
    doc.text("ЭМ", 50, yPos + 5, { align: "center" });
    doc.text("ЗМ", 66, yPos + 5, { align: "center" });
    doc.text("ПМ", 82, yPos + 5, { align: "center" });
    
    // Заклинания
    xPos = 100;
    yPos = 25;
    doc.setFontSize(12);
    doc.text("ЗАКЛИНАНИЯ", 150, yPos, { align: "center" });
    doc.rect(xPos, yPos + 2, 100, 107, 'S');
    
    // Информация о заклинаниях
    yPos += 7;
    xPos += 5;
    doc.setFontSize(10);
    doc.text("Базовая характеристика:", xPos, yPos);
    
    // Определяем базовую характеристику заклинаний по классу
    let spellAbility = "—";
    switch(character.className?.split(' ')[0]) {
      case "Волшебник": spellAbility = "Интеллект"; break;
      case "Чародей":
      case "Бард":
      case "Чернокнижник": spellAbility = "Харизма"; break;
      case "Жрец":
      case "Друид": spellAbility = "Мудрость"; break;
      case "Паладин":
      case "Следопыт": spellAbility = "Мудрость"; break;
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(spellAbility, xPos + 45, yPos);
    doc.setFont("helvetica", "normal");
    
    yPos += 5;
    doc.text("Сложность спас. от закл.:", xPos, yPos);
    
    // Расчет СЛ заклинаний
    let spellDC = "—";
    if (spellAbility !== "—") {
      const abilityKey = spellAbility === "Интеллект" ? "INT" : 
                        (spellAbility === "Мудрость" ? "WIS" : "CHA");
      const abilityMod = getNumericModifier(character.abilities?.[abilityKey as keyof typeof character.abilities] || 10);
      spellDC = String(8 + abilityMod + 2); // 8 + модификатор + бонус мастерства
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(spellDC, xPos + 45, yPos);
    doc.setFont("helvetica", "normal");
    
    yPos += 5;
    doc.text("Бонус атаки заклинанием:", xPos, yPos);
    
    // Расчет бонуса атаки заклинаниями
    let spellAttack = "—";
    if (spellAbility !== "—") {
      const abilityKey = spellAbility === "Интеллект" ? "INT" : 
                        (spellAbility === "Мудрость" ? "WIS" : "CHA");
      const abilityMod = getNumericModifier(character.abilities?.[abilityKey as keyof typeof character.abilities] || 10);
      const attackBonus = abilityMod + 2; // модификатор + бонус мастерства
      spellAttack = attackBonus >= 0 ? `+${attackBonus}` : String(attackBonus);
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(spellAttack, xPos + 45, yPos);
    doc.setFont("helvetica", "normal");
    
    // Таблица ячеек заклинаний
    yPos += 10;
    doc.setFontSize(9);
    doc.text("УРОВЕНЬ", xPos, yPos);
    doc.text("ВСЕГО ЯЧЕЕК", xPos + 30, yPos);
    doc.text("ИСПОЛЬЗОВАНО", xPos + 70, yPos);
    
    yPos += 5;
    doc.line(xPos, yPos, xPos + 95, yPos);
    
    yPos += 5;
    
    // Отображаем доступные ячейки заклинаний
    if (character.spellSlots && Object.keys(character.spellSlots).length > 0) {
      Object.entries(character.spellSlots).forEach(([level, slots]) => {
        doc.text(`${level}`, xPos, yPos);
        // Исправление: преобразуем числовое значение в строку
        doc.text(String(slots.max), xPos + 35, yPos);
        // Исправление: преобразуем числовое значение в строку
        doc.text(String(slots.used), xPos + 75, yPos);
        yPos += 7;
      });
    } else {
      doc.text("Нет ячеек заклинаний", xPos, yPos);
      yPos += 7;
    }
    
    // Список известных заклинаний
    yPos += 5;
    doc.setFontSize(10);
    doc.text("ИЗВЕСТНЫЕ ЗАКЛИНАНИЯ:", xPos, yPos);
    doc.line(xPos, yPos + 2, xPos + 95, yPos + 2);
    
    yPos += 7;
    
    // Перечисляем заклинания персонажа
    if (character.spells && character.spells.length > 0) {
      character.spells.forEach((spell: string, index: number) => {
        if (index < 12) {
          const spellText = doc.splitTextToSize(`• ${spell}`, 90);
          doc.text(spellText, xPos, yPos);
          yPos += 5 * spellText.length;
        }
      });
    } else {
      doc.text("Нет известных заклинаний", xPos, yPos);
    }
    
    // Предыстория персонажа
    yPos = 140;
    doc.setFontSize(12);
    doc.text("ПРЕДЫСТОРИЯ ПЕРСОНАЖА", 105, yPos - 2, { align: "center" });
    doc.setLineWidth(0.5);
    doc.rect(10, yPos, 190, 130, 'S');
    
    yPos += 10;
    xPos = 15;
    
    if (character.background) {
      const bgText = doc.splitTextToSize(character.background, 180);
      doc.setFontSize(10);
      doc.text(bgText, xPos, yPos);
    } else {
      doc.setFontSize(10);
      doc.text("У персонажа нет предыстории", xPos, yPos);
    }
    
    // Добавляем характерные черты, связи, идеалы и слабости
    yPos = 230;
    doc.setFontSize(12);
    doc.text("ХАРАКТЕРНЫЕ ЧЕРТЫ", 55, yPos - 2, { align: "center" });
    doc.rect(10, yPos, 90, 40, 'S');
    
    doc.text("ИДЕАЛЫ", 155, yPos - 2, { align: "center" });
    doc.rect(110, yPos, 90, 40, 'S');
    
    // Сохраняем документ
    doc.save(`${character.name || 'персонаж'}_dnd.pdf`);
  } catch (error) {
    console.error("Ошибка при сохранении PDF:", error);
  }
};
