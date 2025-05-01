import * as pdfjs from 'pdfjs-dist';

// Загружаем локальный worker для pdf.js вместо удаленного CDN
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs';
pdfjs.GlobalWorkerOptions.workerPort = new Worker(pdfWorker);

interface PDFField {
  name: string;
  value: string;
}

export interface ExtractedCharacterData {
  name: string;
  race: string;
  class: string;
  level: number;
  abilities: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  maxHp: number;
  currentHp: number;
  proficiencies: string[];
  equipment: string[];
  spells: string[];
  languages: string[];
  background?: string;
  alignment?: string;
  gender?: string;
}

/**
 * Извлекает данные персонажа из PDF файла официального листа D&D 5e
 */
export async function extractCharacterDataFromPdf(file: File): Promise<ExtractedCharacterData> {
  try {
    // Загрузка PDF файла и получение текста
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    // Создаем объект для хранения данных персонажа
    const characterData: ExtractedCharacterData = {
      name: '',
      race: '',
      class: '',
      level: 1,
      abilities: {
        STR: 10,
        DEX: 10,
        CON: 10,
        INT: 10,
        WIS: 10,
        CHA: 10,
      },
      maxHp: 10,
      currentHp: 10,
      proficiencies: [],
      equipment: [],
      spells: [],
      languages: ['Общий'],
    };

    // Получаем массив всех строк текста из PDF документа
    const numPages = pdf.numPages;
    let fullText = '';
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter(item => 'str' in item)
        .map(item => (item as any).str)
        .join(' ');
      
      fullText += pageText + ' ';
    }

    // Парсим имя персонажа (обычно находится рядом с "CHARACTER NAME")
    const nameMatch = fullText.match(/CHARACTER NAME\s*([A-Za-zА-Яа-я\s]+)/i);
    if (nameMatch && nameMatch[1]) {
      characterData.name = nameMatch[1].trim();
    }

    // Парсим расу персонажа
    const raceMatch = fullText.match(/RACE\s*([A-Za-zА-Яа-я\s]+)/i);
    if (raceMatch && raceMatch[1]) {
      characterData.race = raceMatch[1].trim();
    }

    // Парсим класс персонажа
    const classMatch = fullText.match(/CLASS[^A-Za-z0-9]*([A-Za-zА-Яа-я\s]+)/i);
    if (classMatch && classMatch[1]) {
      characterData.class = mapEnglishClassToRussian(classMatch[1].trim());
    }

    // Парсим уровень персонажа
    const levelMatch = fullText.match(/LEVEL[^A-Za-z0-9]*(\d+)/i);
    if (levelMatch && levelMatch[1]) {
      characterData.level = parseInt(levelMatch[1], 10);
    }

    // Парсим характеристики персонажа
    const strMatch = fullText.match(/Strength\s*(\d+)/i);
    if (strMatch && strMatch[1]) {
      characterData.abilities.STR = parseInt(strMatch[1], 10);
    }

    const dexMatch = fullText.match(/Dexterity\s*(\d+)/i);
    if (dexMatch && dexMatch[1]) {
      characterData.abilities.DEX = parseInt(dexMatch[1], 10);
    }

    const conMatch = fullText.match(/Constitution\s*(\d+)/i);
    if (conMatch && conMatch[1]) {
      characterData.abilities.CON = parseInt(conMatch[1], 10);
    }

    const intMatch = fullText.match(/Intelligence\s*(\d+)/i);
    if (intMatch && intMatch[1]) {
      characterData.abilities.INT = parseInt(intMatch[1], 10);
    }

    const wisMatch = fullText.match(/Wisdom\s*(\d+)/i);
    if (wisMatch && wisMatch[1]) {
      characterData.abilities.WIS = parseInt(wisMatch[1], 10);
    }

    const chaMatch = fullText.match(/Charisma\s*(\d+)/i);
    if (chaMatch && chaMatch[1]) {
      characterData.abilities.CHA = parseInt(chaMatch[1], 10);
    }

    // Парсим HP персонажа
    const hpMatch = fullText.match(/Hit Point Maximum\s*(\d+)/i);
    if (hpMatch && hpMatch[1]) {
      const hp = parseInt(hpMatch[1], 10);
      characterData.maxHp = hp;
      characterData.currentHp = hp;
    }

    // Парсим мировоззрение персонажа
    const alignmentMatch = fullText.match(/ALIGNMENT\s*([A-Za-zА-Яа-я\s]+)/i);
    if (alignmentMatch && alignmentMatch[1]) {
      characterData.alignment = mapAlignmentToRussian(alignmentMatch[1].trim());
    }

    // Парсим языки
    const languagesSection = extractSection(fullText, /OTHER PROFICIENCIES & LANGUAGES/i, 200);
    if (languagesSection) {
      // Извлекаем потенциальные языки из секции
      const languageMatches = languagesSection.match(/Languages?:([^.]+)/i);
      if (languageMatches && languageMatches[1]) {
        const languagesList = languageMatches[1].split(',').map(lang => 
          mapLanguageToRussian(lang.trim())
        ).filter(Boolean);
        
        if (languagesList.length > 0) {
          characterData.languages = languagesList;
        }
      }
    }

    // Парсим снаряжение
    const equipmentSection = extractSection(fullText, /EQUIPMENT/i, 500);
    if (equipmentSection) {
      // Разделяем снаряжение по запятым и точкам
      const equipItems = equipmentSection
        .replace(/EQUIPMENT/ig, '')
        .split(/[,.]/)
        .map(item => item.trim())
        .filter(item => item.length > 2); // Фильтруем короткие строки
      
      if (equipItems.length > 0) {
        characterData.equipment = equipItems;
      }
    }

    // Парсим навыки (профессии)
    const proficienciesSection = extractSection(fullText, /PROFICIENCIES/i, 300);
    if (proficienciesSection) {
      // Разделяем навыки по запятым
      const profItems = proficienciesSection
        .replace(/PROFICIENCIES/ig, '')
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 2); // Фильтруем короткие строки
      
      if (profItems.length > 0) {
        characterData.proficiencies = profItems;
      }
    }

    // Парсим заклинания
    const spellsSection = extractSection(fullText, /SPELLS/i, 500);
    if (spellsSection) {
      // Пытаемся найти список заклинаний
      const spellsList = spellsSection
        .replace(/SPELLS|CANTRIPS|LEVEL \d|SPELL SLOTS/ig, '')
        .split(/[,.\n]/)
        .map(spell => spell.trim())
        .filter(spell => spell.length > 3 && !spell.match(/^\d+$/)); // Фильтруем короткие строки и чисто цифры
      
      if (spellsList.length > 0) {
        characterData.spells = spellsList;
      }
    }

    // Парсим предысторию персонажа (может быть в секции BACKGROUND)
    const backgroundSection = extractSection(fullText, /CHARACTER BACKGROUND/i, 1000);
    if (backgroundSection) {
      characterData.background = backgroundSection
        .replace(/CHARACTER BACKGROUND/ig, '')
        .trim();
    }

    return characterData;
  } catch (error) {
    console.error('Ошибка при извлечении данных из PDF:', error);
    throw new Error(`Не удалось извлечь данные персонажа из PDF: ${error}`);
  }
}

/**
 * Вспомогательная функция для извлечения секции текста вокруг ключевого слова
 */
function extractSection(text: string, pattern: RegExp, charLimit: number): string | null {
  const match = text.match(pattern);
  if (!match) return null;

  const index = match.index!;
  const startIdx = Math.max(0, index);
  const endIdx = Math.min(text.length, index + charLimit);
  
  return text.slice(startIdx, endIdx);
}

/**
 * Вспомогательные функции для перевода английских названий на русский
 */
function mapEnglishClassToRussian(englishClass: string): string {
  const classMap: Record<string, string> = {
    'Barbarian': 'Варвар',
    'Bard': 'Бард',
    'Cleric': 'Жрец',
    'Druid': 'Друид',
    'Fighter': 'Воин',
    'Monk': 'Монах',
    'Paladin': 'Паладин',
    'Ranger': 'Следопыт',
    'Rogue': 'Плут',
    'Sorcerer': 'Чародей',
    'Warlock': 'Чернокнижник',
    'Wizard': 'Волшебник',
  };

  // Проверяем, есть ли прямое соответствие
  for (const [eng, rus] of Object.entries(classMap)) {
    if (englishClass.toLowerCase().includes(eng.toLowerCase())) {
      return rus;
    }
  }

  // Если нет соответствия, возвращаем оригинал
  return englishClass;
}

function mapAlignmentToRussian(alignment: string): string {
  const alignmentMap: Record<string, string> = {
    'Lawful Good': 'Законно-добрый',
    'Neutral Good': 'Нейтрально-добрый',
    'Chaotic Good': 'Хаотично-добрый',
    'Lawful Neutral': 'Законно-нейтральный',
    'True Neutral': 'Истинно нейтральный',
    'Chaotic Neutral': 'Хаотично-нейтральный',
    'Lawful Evil': 'Законно-злой',
    'Neutral Evil': 'Нейтрально-злой',
    'Chaotic Evil': 'Хаотично-злой',
  };

  for (const [eng, rus] of Object.entries(alignmentMap)) {
    if (alignment.toLowerCase().includes(eng.toLowerCase())) {
      return rus;
    }
  }

  return alignment;
}

function mapLanguageToRussian(language: string): string {
  const languageMap: Record<string, string> = {
    'Common': 'Общий',
    'Dwarvish': 'Дварфийский',
    'Elvish': 'Эльфийский',
    'Giant': 'Великаний',
    'Gnomish': 'Гномий',
    'Goblin': 'Гоблинский',
    'Halfling': 'Полуросликов',
    'Orc': 'Орочий',
    'Abyssal': 'Бездны',
    'Celestial': 'Небесный',
    'Draconic': 'Драконий',
    'Deep Speech': 'Глубинная речь',
    'Infernal': 'Инфернальный',
    'Primordial': 'Первичный',
    'Sylvan': 'Сильван',
    'Undercommon': 'Подземный',
  };

  for (const [eng, rus] of Object.entries(languageMap)) {
    if (language.toLowerCase().includes(eng.toLowerCase())) {
      return rus;
    }
  }

  return language;
}

/**
 * Преобразует извлеченные данные персонажа в формат Character для использования в приложении
 */
export function convertExtractedDataToCharacter(data: ExtractedCharacterData) {
  // Создаем спелслоты на основе класса и уровня
  const spellSlots = calculateSpellSlots(data.class, data.level);
  
  // Вычисляем максимальные HP на основе класса, уровня и телосложения если они не были извлечены
  const conModifier = Math.floor((data.abilities.CON - 10) / 2);
  let maxHp = data.maxHp;
  
  if (!maxHp || maxHp <= 0) {
    const hpByClass = getHitDieByClass(data.class);
    // Первый уровень - максимальное значение Hit Die + конституция
    maxHp = hpByClass + conModifier;
    
    // Для каждого дополнительного уровня - среднее значение Hit Die + конституция
    if (data.level > 1) {
      const averageHitPoints = Math.floor((hpByClass + 1) / 2) + 1;
      maxHp += (averageHitPoints + conModifier) * (data.level - 1);
    }
  }

  return {
    name: data.name || "Импортированный персонаж",
    race: data.race || "Человек",
    className: data.class || "Воин",
    level: data.level || 1,
    abilities: data.abilities,
    spells: data.spells || [],
    spellSlots: spellSlots,
    maxHp: maxHp,
    currentHp: data.currentHp || maxHp,
    gender: data.gender || "",
    alignment: data.alignment || "Нейтральный",
    background: data.background || "",
    equipment: data.equipment || [],
    languages: data.languages || ["Общий"],
    proficiencies: data.proficiencies || [],
  };
}

// Получаем Hit Die для класса
const getHitDieByClass = (characterClass: string): number => {
  const hitDice: Record<string, number> = {
    "Варвар": 12,
    "Воин": 10,
    "Паладин": 10,
    "Следопыт": 10,
    "Жрец": 8,
    "Друид": 8,
    "Монах": 8,
    "Плут": 8,
    "Бард": 8,
    "Колдун": 8,
    "Чернокнижник": 8,
    "Волшебник": 6,
    "Чародей": 6
  };
  
  return hitDice[characterClass] || 8; // По умолчанию d8
};

// Рассчитываем ячейки заклинаний на основе класса и уровня
const calculateSpellSlots = (className: string, level: number) => {
  if (!isMagicClass(className) || level < 1) return {};
  
  const slots: Record<number, { max: number, used: number }> = {};
  // Полные заклинатели (Волшебник, Жрец, Друид, Бард, Чародей)
  if (["Волшебник", "Чародей", "Жрец", "Друид", "Бард"].includes(className)) {
    if (level >= 1) slots[1] = { max: Math.min(level + 1, 4), used: 0 };
    if (level >= 3) slots[2] = { max: Math.min(level - 1, 3), used: 0 };
    if (level >= 5) slots[3] = { max: Math.min(level - 3, 3), used: 0 };
    if (level >= 7) slots[4] = { max: Math.min(level - 6, 3), used: 0 };
    if (level >= 9) slots[5] = { max: Math.min(level - 8, 2), used: 0 };
    if (level >= 11) slots[6] = { max: 1, used: 0 };
    if (level >= 13) slots[7] = { max: 1, used: 0 };
    if (level >= 15) slots[8] = { max: 1, used: 0 };
    if (level >= 17) slots[9] = { max: 1, used: 0 };
  }
  // Полу-заклинатели (Паладин, Следопыт)
  else if (["Паладин", "Следопыт"].includes(className)) {
    // Полу-заклинатели используют половину своего уровня (округленную вверх) для расчета ячеек заклинаний
    const effectiveLevel = Math.ceil(level / 2);
    if (level >= 2) slots[1] = { max: Math.min(effectiveLevel + 1, 4), used: 0 };
    if (level >= 5) slots[2] = { max: Math.min(effectiveLevel - 1, 3), used: 0 };
    if (level >= 9) slots[3] = { max: Math.min(effectiveLevel - 3, 3), used: 0 };
    if (level >= 13) slots[4] = { max: Math.min(effectiveLevel - 6, 2), used: 0 };
    if (level >= 17) slots[5] = { max: Math.min(effectiveLevel - 8, 1), used: 0 };
  }
  // Чернокнижники имеют свою собственную прогрессию ячеек заклинаний
  else if (className === "Чернокнижник") {
    const slotLevel = Math.min(Math.ceil(level / 2), 5);
    const numSlots = level === 1 ? 1 : Math.min(Math.floor((level + 1) / 2) + 1, 4);
    slots[slotLevel] = { max: numSlots, used: 0 };
  }
  
  return slots;
};

// Определение, является ли класс заклинательным
const isMagicClass = (className: string) => {
  const magicClasses = ['Волшебник', 'Чародей', 'Чернокнижник', 'Бард', 'Жрец', 'Друид', 'Паладин', 'Следопыт'];
  return magicClasses.includes(className);
};
