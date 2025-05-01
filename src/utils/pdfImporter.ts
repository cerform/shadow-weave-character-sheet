
import * as pdfjs from 'pdfjs-dist';

// Настраиваем worker для pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
    let textBlocks: Array<{text: string, x: number, y: number}> = [];
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Собираем текст со страницы с сохранением координат
      textContent.items
        .filter(item => 'str' in item)
        .forEach(item => {
          const textItem = item as any;
          if (textItem.str.trim()) {
            textBlocks.push({
              text: textItem.str,
              x: textItem.transform[4],
              y: textItem.transform[5]
            });
            fullText += textItem.str + ' ';
          }
        });
    }

    console.log("Извлеченные текстовые блоки:", textBlocks.slice(0, 10));

    // Ищем текст по шаблонам и соседству с ключевыми словами
    
    // Парсим имя персонажа
    const nameMatch = findTextNearKeyword(textBlocks, ['CHARACTER NAME', 'имя персонажа'], 200, 20);
    if (nameMatch && nameMatch !== 'CHARACTER NAME') {
      characterData.name = nameMatch.trim();
    }

    // Парсим расу персонажа
    const raceMatch = findTextNearKeyword(textBlocks, ['RACE', 'раса'], 200, 20);
    if (raceMatch && !['RACE', 'раса'].includes(raceMatch.toLowerCase())) {
      characterData.race = mapRaceToRussian(raceMatch.trim());
    }

    // Парсим класс персонажа
    const classMatch = findTextNearKeyword(textBlocks, ['CLASS', 'класс'], 200, 20);
    if (classMatch && !['CLASS', 'класс'].includes(classMatch.toLowerCase())) {
      characterData.class = mapEnglishClassToRussian(classMatch.trim());
    }

    // Парсим уровень персонажа
    const levelMatch = findTextNearKeyword(textBlocks, ['LEVEL', 'уровень'], 200, 20);
    if (levelMatch) {
      const levelNumber = parseInt(levelMatch.replace(/\D/g, ''));
      if (!isNaN(levelNumber)) {
        characterData.level = levelNumber;
      }
    }

    // Парсим характеристики персонажа
    const strMatch = findTextNearKeyword(textBlocks, ['STRENGTH', 'сила'], 100, 50);
    if (strMatch) {
      const strNum = parseInt(strMatch.replace(/\D/g, ''));
      if (!isNaN(strNum) && strNum > 0 && strNum < 30) {
        characterData.abilities.STR = strNum;
      }
    }

    const dexMatch = findTextNearKeyword(textBlocks, ['DEXTERITY', 'ловкость'], 100, 50);
    if (dexMatch) {
      const dexNum = parseInt(dexMatch.replace(/\D/g, ''));
      if (!isNaN(dexNum) && dexNum > 0 && dexNum < 30) {
        characterData.abilities.DEX = dexNum;
      }
    }

    const conMatch = findTextNearKeyword(textBlocks, ['CONSTITUTION', 'телосложение'], 100, 50);
    if (conMatch) {
      const conNum = parseInt(conMatch.replace(/\D/g, ''));
      if (!isNaN(conNum) && conNum > 0 && conNum < 30) {
        characterData.abilities.CON = conNum;
      }
    }

    const intMatch = findTextNearKeyword(textBlocks, ['INTELLIGENCE', 'интеллект'], 100, 50);
    if (intMatch) {
      const intNum = parseInt(intMatch.replace(/\D/g, ''));
      if (!isNaN(intNum) && intNum > 0 && intNum < 30) {
        characterData.abilities.INT = intNum;
      }
    }

    const wisMatch = findTextNearKeyword(textBlocks, ['WISDOM', 'мудрость'], 100, 50);
    if (wisMatch) {
      const wisNum = parseInt(wisMatch.replace(/\D/g, ''));
      if (!isNaN(wisNum) && wisNum > 0 && wisNum < 30) {
        characterData.abilities.WIS = wisNum;
      }
    }

    const chaMatch = findTextNearKeyword(textBlocks, ['CHARISMA', 'харизма'], 100, 50);
    if (chaMatch) {
      const chaNum = parseInt(chaMatch.replace(/\D/g, ''));
      if (!isNaN(chaNum) && chaNum > 0 && chaNum < 30) {
        characterData.abilities.CHA = chaNum;
      }
    }

    // Парсим HP персонажа
    const hpMatch = findTextNearKeyword(textBlocks, ['HIT POINT MAXIMUM', 'максимум хитов'], 150, 20);
    if (hpMatch) {
      const hp = parseInt(hpMatch.replace(/\D/g, ''));
      if (!isNaN(hp) && hp > 0) {
        characterData.maxHp = hp;
        characterData.currentHp = hp;
      }
    }

    // Парсим мировоззрение персонажа
    const alignmentMatch = findTextNearKeyword(textBlocks, ['ALIGNMENT', 'мировоззрение'], 200, 20);
    if (alignmentMatch && !['ALIGNMENT', 'мировоззрение'].includes(alignmentMatch.toLowerCase())) {
      characterData.alignment = mapAlignmentToRussian(alignmentMatch.trim());
    }

    // Парсим языки
    const languagesSection = extractSectionFromText(fullText, /OTHER PROFICIENCIES & LANGUAGES|LANGUAGES/i, 500);
    if (languagesSection) {
      const languagesFound = extractLanguagesFromText(languagesSection);
      if (languagesFound.length > 0) {
        characterData.languages = languagesFound.map(mapLanguageToRussian);
      }
    }

    // Парсим снаряжение
    const equipmentSection = extractSectionFromText(fullText, /EQUIPMENT|СНАРЯЖЕНИЕ/i, 500);
    if (equipmentSection) {
      const equipment = equipmentSection
        .replace(/EQUIPMENT|СНАРЯЖЕНИЕ/ig, '')
        .split(/[,.;]/)
        .map(item => item.trim())
        .filter(item => item.length > 2 && !/^(CP|SP|EP|GP|PP|\d+$)/.test(item));
      
      if (equipment.length > 0) {
        characterData.equipment = equipment;
      }
    }

    // Парсим навыки и владения
    const proficienciesSection = extractSectionFromText(fullText, /PROFICIENCIES|ВЛАДЕНИЯ И ЯЗЫКИ|FEATURES & TRAITS|ОСОБЕННОСТИ И УМЕНИЯ/i, 500);
    if (proficienciesSection) {
      const proficiencies = proficienciesSection
        .replace(/PROFICIENCIES|ВЛАДЕНИЯ И ЯЗЫКИ|FEATURES & TRAITS|ОСОБЕННОСТИ И УМЕНИЯ/ig, '')
        .split(/[,.;]/)
        .map(item => item.trim())
        .filter(item => item.length > 2 && !/^(LANGUAGES|ЯЗЫКИ)/.test(item));
      
      if (proficiencies.length > 0) {
        characterData.proficiencies = proficiencies;
      }
    }

    // Парсим заклинания
    const spellsSection = extractSectionFromText(fullText, /SPELLS|ЗАКЛИНАНИЯ/i, 800);
    if (spellsSection) {
      const spellNames = extractSpellsFromText(spellsSection);
      if (spellNames.length > 0) {
        characterData.spells = spellNames;
      }
    }

    // Парсим предысторию персонажа
    const backgroundSection = extractSectionFromText(fullText, /CHARACTER BACKGROUND|ПРЕДЫСТОРИЯ ПЕРСОНАЖА|BACKGROUND|ПРЕДЫСТОРИЯ/i, 1000);
    if (backgroundSection) {
      characterData.background = backgroundSection
        .replace(/CHARACTER BACKGROUND|ПРЕДЫСТОРИЯ ПЕРСОНАЖА|BACKGROUND|ПРЕДЫСТОРИЯ/ig, '')
        .trim();
    }

    // Импорт дополнительных данных из Книги Игрока
    characterData.gender = determinePossibleGender(characterData.name);

    // Добавление из Книги игрока расовых особенностей, если они не были импортированы
    addRacialTraits(characterData);

    console.log("Извлеченные данные персонажа:", characterData);
    return characterData;
  } catch (error) {
    console.error('Ошибка при извлечении данных из PDF:', error);
    throw new Error(`Не удалось извлечь данные персонажа из PDF: ${error}`);
  }
}

/**
 * Функция для поиска текста рядом с ключевым словом
 */
function findTextNearKeyword(textBlocks: Array<{text: string, x: number, y: number}>, keywords: string[], maxDistance: number, yTolerance: number): string | null {
  // Находим блоки с ключевыми словами
  const keywordBlocks = textBlocks.filter(block => 
    keywords.some(keyword => block.text.toLowerCase().includes(keyword.toLowerCase()))
  );
  
  if (keywordBlocks.length === 0) return null;
  
  // Для каждого найденного ключевого слова ищем ближайший текст справа или снизу
  for (const keywordBlock of keywordBlocks) {
    // Ищем текст справа (на той же высоте)
    const rightBlocks = textBlocks.filter(block => 
      Math.abs(block.y - keywordBlock.y) < yTolerance && 
      block.x > keywordBlock.x && 
      block.x - keywordBlock.x < maxDistance &&
      !keywords.some(keyword => block.text.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    if (rightBlocks.length > 0) {
      // Сортируем блоки по возрастанию X-координаты (от ближайших к дальним)
      const sortedByX = [...rightBlocks].sort((a, b) => a.x - b.x);
      return sortedByX[0].text;
    }
    
    // Если справа ничего не нашли, ищем текст снизу (примерно на той же X-координате)
    const belowBlocks = textBlocks.filter(block => 
      Math.abs(block.x - keywordBlock.x) < maxDistance && 
      block.y < keywordBlock.y && 
      keywordBlock.y - block.y < maxDistance &&
      !keywords.some(keyword => block.text.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    if (belowBlocks.length > 0) {
      // Сортируем блоки по убыванию Y-координаты (от ближайших к дальним)
      const sortedByY = [...belowBlocks].sort((a, b) => b.y - a.y);
      return sortedByY[0].text;
    }
  }
  
  return null;
}

/**
 * Извлекает секцию текста вокруг ключевого слова/фразы
 */
function extractSectionFromText(text: string, pattern: RegExp, charLimit: number): string | null {
  const match = text.match(pattern);
  if (!match) return null;

  const index = match.index!;
  const startIdx = Math.max(0, index);
  const endIdx = Math.min(text.length, index + charLimit);
  
  return text.slice(startIdx, endIdx);
}

/**
 * Извлекает языки из текста
 */
function extractLanguagesFromText(text: string): string[] {
  // Ищем фразы, которые могут указывать на языки
  const languagePatterns = [
    /Languages?:([^.;]+)/i,
    /Языки:([^.;]+)/i,
    /speaks?([^.;]+)/i,
    /владеет([^.;]+)язык/i
  ];
  
  for (const pattern of languagePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1]
        .split(/[,&]/)
        .map(lang => lang.trim())
        .filter(lang => lang.length > 0 && !lang.includes('и') && !lang.includes('and'));
    }
  }
  
  // Если специальных маркеров не нашли, ищем известные названия языков
  const knownLanguages = [
    'Common', 'Общий', 'Dwarvish', 'Дварфийский', 'Elvish', 'Эльфийский', 
    'Giant', 'Великаний', 'Gnomish', 'Гномий', 'Goblin', 'Гоблинский', 
    'Halfling', 'Полуросликов', 'Orc', 'Орочий', 'Abyssal', 'Бездны', 
    'Celestial', 'Небесный', 'Draconic', 'Драконий', 'Deep Speech', 'Глубинная речь', 
    'Infernal', 'Инфернальный', 'Primordial', 'Первичный', 'Sylvan', 'Сильван', 
    'Undercommon', 'Подземный'
  ];
  
  const foundLanguages = [];
  for (const lang of knownLanguages) {
    if (text.toLowerCase().includes(lang.toLowerCase())) {
      foundLanguages.push(lang);
    }
  }
  
  return foundLanguages.length > 0 ? foundLanguages : ['Common'];
}

/**
 * Извлекает названия заклинаний из текста
 */
function extractSpellsFromText(text: string): string[] {
  // Импортируем известные заклинания
  const knownSpells = [
    "Волшебная рука", "Огненный снаряд", "Свет", "Малая иллюзия", 
    "Танцующие огоньки", "Волшебный замок", "Огненный шар", "Щит", 
    "Мистический заряд", "Лечение ран", "Благословение", "Чудотворство", 
    "Обнаружение магии", "Маскировка", "Понимание языков", "Ядовитое Облако",
    "Mage Hand", "Fire Bolt", "Light", "Minor Illusion", 
    "Dancing Lights", "Arcane Lock", "Fireball", "Shield", 
    "Eldritch Blast", "Cure Wounds", "Bless", "Thaumaturgy", 
    "Detect Magic", "Disguise Self", "Comprehend Languages", "Poison Spray"
  ];
  
  const spellsFound = [];
  for (const spell of knownSpells) {
    if (text.includes(spell)) {
      spellsFound.push(mapSpellNameToRussian(spell));
    }
  }
  
  return spellsFound;
}

/**
 * Определяет возможный пол персонажа по имени (с использованием базовых эвристик)
 */
function determinePossibleGender(name: string): string {
  // Это очень простая эвристика, которую можно улучшить
  if (!name || name.length < 2) return '';
  
  // Русские имена
  if (/[А-Яа-я]/.test(name)) {
    if (name.endsWith('а') || name.endsWith('я')) return 'Женский';
    return 'Мужской';
  }
  
  // Английские имена - очень приблизительно
  if (name.endsWith('a') || name.endsWith('e') || 
      name.includes('elle') || name.includes('ina') || 
      name.includes('ette')) {
    return 'Женский';
  }
  
  return 'Мужской'; // По умолчанию
}

/**
 * Добавляет расовые особенности на основе расы персонажа из Книги игрока
 */
function addRacialTraits(character: ExtractedCharacterData): void {
  if (!character.race) return;
  
  const raceLower = character.race.toLowerCase();
  
  // Добавляем языки по умолчанию
  if (character.languages.length <= 1) {
    if (raceLower.includes('эльф') || raceLower.includes('elf')) {
      character.languages = ['Общий', 'Эльфийский'];
    } else if (raceLower.includes('дварф') || raceLower.includes('dwarf')) {
      character.languages = ['Общий', 'Дварфийский'];
    } else if (raceLower.includes('гном') || raceLower.includes('gnome')) {
      character.languages = ['Общий', 'Гномий'];
    } else if (raceLower.includes('драконорожд') || raceLower.includes('dragonborn')) {
      character.languages = ['Общий', 'Драконий'];
    } else if (raceLower.includes('тифлинг') || raceLower.includes('tiefling')) {
      character.languages = ['Общий', 'Инфернальный'];
    } else if (raceLower.includes('полурослик') || raceLower.includes('halfling')) {
      character.languages = ['Общий', 'Полуросликов'];
    } else if (raceLower.includes('полуорк') || raceLower.includes('half-orc')) {
      character.languages = ['Общий', 'Орочий'];
    } else if (raceLower.includes('полуэльф') || raceLower.includes('half-elf')) {
      character.languages = ['Общий', 'Эльфийский'];
    }
  }
  
  // Добавляем расовые особенности, если список профессий пуст
  if (character.proficiencies.length === 0) {
    if (raceLower.includes('эльф') || raceLower.includes('elf')) {
      character.proficiencies = ['Темное зрение', 'Наследие фей', 'Транс'];
    } else if (raceLower.includes('дварф') || raceLower.includes('dwarf')) {
      character.proficiencies = ['Темное зрение', 'Дварфская устойчивость', 'Владение оружием дварфов'];
    } else if (raceLower.includes('гном') || raceLower.includes('gnome')) {
      character.proficiencies = ['Темное зрение', 'Гномья хитрость'];
    } else if (raceLower.includes('драконорожд') || raceLower.includes('dragonborn')) {
      character.proficiencies = ['Драконье происхождение', 'Дыхание дракона', 'Сопротивление урону'];
    } else if (raceLower.includes('тифлинг') || raceLower.includes('tiefling')) {
      character.proficiencies = ['Темное зрение', 'Адское сопротивление', 'Дьявольское наследие'];
    } else if (raceLower.includes('полурослик') || raceLower.includes('halfling')) {
      character.proficiencies = ['Везучий', 'Храбрый', 'Проворство полуросликов'];
    } else if (raceLower.includes('полуорк') || raceLower.includes('half-orc')) {
      character.proficiencies = ['Темное зрение', 'Угрожающий', 'Дикий натиск'];
    } else if (raceLower.includes('полуэльф') || raceLower.includes('half-elf')) {
      character.proficiencies = ['Темное зрение', 'Наследие фей', 'Универсальность навыков'];
    }
  }
}

/**
 * Функции перевода на русский
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

  for (const [eng, rus] of Object.entries(classMap)) {
    if (englishClass.toLowerCase().includes(eng.toLowerCase())) {
      return rus;
    }
  }

  return englishClass;
}

function mapRaceToRussian(race: string): string {
  const raceMap: Record<string, string> = {
    'Human': 'Человек',
    'Elf': 'Эльф',
    'High Elf': 'Высший эльф',
    'Wood Elf': 'Лесной эльф',
    'Drow': 'Дроу',
    'Dwarf': 'Дварф',
    'Hill Dwarf': 'Холмовой дварф',
    'Mountain Dwarf': 'Горный дварф',
    'Halfling': 'Полурослик',
    'Lightfoot Halfling': 'Легконогий полурослик',
    'Stout Halfling': 'Коренастый полурослик',
    'Gnome': 'Гном',
    'Rock Gnome': 'Скальный гном',
    'Forest Gnome': 'Лесной гном',
    'Half-Elf': 'Полуэльф',
    'Half-Orc': 'Полуорк',
    'Tiefling': 'Тифлинг',
    'Dragonborn': 'Драконорожденный',
  };

  for (const [eng, rus] of Object.entries(raceMap)) {
    if (race.toLowerCase().includes(eng.toLowerCase())) {
      return rus;
    }
  }

  return race;
}

function mapAlignmentToRussian(alignment: string): string {
  const alignmentMap: Record<string, string> = {
    'Lawful Good': 'Законно-добрый',
    'Neutral Good': 'Нейтрально-добрый',
    'Chaotic Good': 'Хаотично-добрый',
    'Lawful Neutral': 'Законно-нейтральный',
    'True Neutral': 'Истинно нейтральный',
    'Neutral': 'Нейтральный',
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

function mapSpellNameToRussian(spellName: string): string {
  const spellMap: Record<string, string> = {
    'Mage Hand': 'Волшебная рука',
    'Fire Bolt': 'Огненный снаряд',
    'Light': 'Свет',
    'Minor Illusion': 'Малая иллюзия',
    'Dancing Lights': 'Танцующие огоньки',
    'Arcane Lock': 'Волшебный замок',
    'Fireball': 'Огненный шар',
    'Shield': 'Щит',
    'Eldritch Blast': 'Мистический заряд',
    'Cure Wounds': 'Лечение ран',
    'Bless': 'Благословение',
    'Thaumaturgy': 'Чудотворство',
    'Detect Magic': 'Обнаружение магии',
    'Disguise Self': 'Маскировка',
    'Comprehend Languages': 'Понимание языков',
    'Poison Spray': 'Ядовитое облако'
  };

  // Проверяем, нужно ли переводить
  if (Object.keys(spellMap).includes(spellName)) {
    return spellMap[spellName];
  } else if (Object.values(spellMap).includes(spellName)) {
    return spellName;
  }

  // Если точного соответствия нет, пытаемся найти частичное
  for (const [eng, rus] of Object.entries(spellMap)) {
    if (spellName.toLowerCase().includes(eng.toLowerCase())) {
      return rus;
    } else if (spellName.toLowerCase().includes(rus.toLowerCase())) {
      return rus;
    }
  }

  return spellName;
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
