
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CharacterSheet } from '@/types/character';
import { getModifierFromAbilityScore } from './characterUtils';

// Функция для конвертации модификатора в строку
const modStr = (mod: number | string): string => {
  if (typeof mod === 'string') return mod;
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

// Функция для проверки навыка
const getSkillBonus = (skills: any, skillName: string, profBonus: number, abilityMod: number): number => {
  const skill = skills ? skills[skillName] : null;
  if (!skill) return abilityMod;
  
  if (skill.bonus !== undefined) return skill.bonus;
  if (skill.proficient) {
    return abilityMod + (skill.expertise ? profBonus * 2 : profBonus);
  }
  return abilityMod;
};

// Генерация PDF характеристик персонажа
export const generateCharacterPdf = async (character: CharacterSheet): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      // Создаем новый PDF документ
      const doc = new jsPDF();
      
      // Добавляем базовую информацию о персонаже
      doc.setFontSize(20);
      doc.text(`${character.name}`, 105, 15, { align: 'center' });
      
      doc.setFontSize(10);
      let subtitle = '';
      
      if (character.race) {
        subtitle += character.race;
        if (character.subrace) subtitle += ` (${character.subrace})`;
      }
      
      if (character.class) {
        if (subtitle) subtitle += ', ';
        subtitle += character.class;
        if (character.subclass) subtitle += ` (${character.subclass})`;
        subtitle += ` ${character.level} уровня`;
      }
      
      if (character.background) {
        if (subtitle) subtitle += ', ';
        subtitle += character.background;
      }
      
      doc.text(subtitle, 105, 22, { align: 'center' });
      
      // Извлекаем характеристики для удобства
      const abilities = character.abilities || {
        STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
        strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
      };
      
      // Рассчитываем бонус мастерства на основе уровня
      const proficiencyBonus = Math.ceil(2 + ((character.level || 1) - 1) / 4);
      
      // Функция для получения модификатора характеристики
      const getMod = (ability: string): number => {
        const abilityScore = abilities[ability as keyof typeof abilities] || 10;
        const modString = getModifierFromAbilityScore(abilityScore);
        return typeof modString === 'number' ? modString : parseInt(modString) || 0;
      };
      
      // Получаем модификаторы характеристик
      const strMod = getMod('STR') || getMod('strength');
      const dexMod = getMod('DEX') || getMod('dexterity');
      const conMod = getMod('CON') || getMod('constitution');
      const intMod = getMod('INT') || getMod('intelligence');
      const wisMod = getMod('WIS') || getMod('wisdom');
      const chaMod = getMod('CHA') || getMod('charisma');
      
      // Первый раздел: Характеристики и спасброски
      doc.setFontSize(14);
      doc.text("Характеристики", 20, 35);
      
      // Таблица характеристик
      autoTable(doc, {
        startY: 38,
        head: [['СИЛ', 'ЛОВ', 'ТЕЛ', 'ИНТ', 'МДР', 'ХАР']],
        body: [
          [
            `${abilities.STR || abilities.strength}\n(${modStr(strMod)})`, 
            `${abilities.DEX || abilities.dexterity}\n(${modStr(dexMod)})`, 
            `${abilities.CON || abilities.constitution}\n(${modStr(conMod)})`, 
            `${abilities.INT || abilities.intelligence}\n(${modStr(intMod)})`, 
            `${abilities.WIS || abilities.wisdom}\n(${modStr(wisMod)})`, 
            `${abilities.CHA || abilities.charisma}\n(${modStr(chaMod)})`
          ]
        ],
        theme: 'striped',
        styles: { halign: 'center', valign: 'middle' },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' }, 3: { fontStyle: 'bold' }, 4: { fontStyle: 'bold' }, 5: { fontStyle: 'bold' } },
        margin: { left: 20, right: 20 }
      });
      
      // Спасброски
      doc.setFontSize(14);
      doc.text("Спасброски", 20, 65);
      
      // Функция для определения бонуса спасброска
      const getSavingThrowBonus = (ability: string): number => {
        const mod = getMod(ability);
        // Проверяем владение спасброском
        const isProficient = character.savingThrows && character.savingThrows[ability];
        return mod + (isProficient ? proficiencyBonus : 0);
      };
      
      // Таблица спасбросков
      autoTable(doc, {
        startY: 68,
        head: [['Тип', 'Бонус', 'Тип', 'Бонус']],
        body: [
          ['Сила', modStr(getSavingThrowBonus('STR')), 'Интеллект', modStr(getSavingThrowBonus('INT'))],
          ['Ловкость', modStr(getSavingThrowBonus('DEX')), 'Мудрость', modStr(getSavingThrowBonus('WIS'))],
          ['Телосложение', modStr(getSavingThrowBonus('CON')), 'Харизма', modStr(getSavingThrowBonus('CHA'))]
        ],
        theme: 'striped',
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
      });
      
      // Боевые характеристики
      doc.setFontSize(14);
      doc.text("Боевые характеристики", 20, 95);
      
      // Класс доспеха (базовый 10 + модификатор ловкости)
      const baseAC = 10 + dexMod;
      
      // ХП и другие боевые характеристики
      const combatStats = [
        ['КД', `${baseAC}`, 'Инициатива', `${modStr(dexMod)}`],
        ['Макс. ХП', `${character.maxHp || '-'}`, 'Скорость', '30 футов'],
        ['Текущие ХП', `${character.currentHp || '-'}`, 'Временные ХП', `${character.temporaryHp || 0}`]
      ];
      
      autoTable(doc, {
        startY: 98,
        body: combatStats,
        theme: 'striped',
        margin: { left: 20, right: 20 }
      });
      
      // Навыки
      doc.setFontSize(14);
      doc.text("Навыки", 20, 125);
      
      // Определяем связи навыков с характеристиками
      const skillAbilities: { [key: string]: { ability: string, mod: number } } = {
        'Акробатика': { ability: 'DEX', mod: dexMod },
        'Анализ': { ability: 'INT', mod: intMod },
        'Атлетика': { ability: 'STR', mod: strMod },
        'Внимательность': { ability: 'WIS', mod: wisMod },
        'Выживание': { ability: 'WIS', mod: wisMod },
        'Выступление': { ability: 'CHA', mod: chaMod },
        'Запугивание': { ability: 'CHA', mod: chaMod },
        'История': { ability: 'INT', mod: intMod },
        'Ловкость рук': { ability: 'DEX', mod: dexMod },
        'Магия': { ability: 'INT', mod: intMod },
        'Медицина': { ability: 'WIS', mod: wisMod },
        'Обман': { ability: 'CHA', mod: chaMod },
        'Природа': { ability: 'INT', mod: intMod },
        'Проницательность': { ability: 'WIS', mod: wisMod },
        'Религия': { ability: 'INT', mod: intMod },
        'Скрытность': { ability: 'DEX', mod: dexMod },
        'Убеждение': { ability: 'CHA', mod: chaMod },
        'Уход за животными': { ability: 'WIS', mod: wisMod }
      };
      
      // Формируем массив данных для таблицы навыков
      const skillsData: string[][] = [];
      
      // Обрабатываем первую половину навыков
      const firstHalfSkills = Object.entries(skillAbilities).slice(0, 9);
      for (const [skillName, { ability, mod }] of firstHalfSkills) {
        // Безопасно проверяем навык, избегая сравнения объектов с числами
        const isProficient = character.skills && 
                            character.skills[skillName] && 
                            character.skills[skillName].proficient === true;
        const isExpert = character.skills && 
                        character.skills[skillName] && 
                        character.skills[skillName].expertise === true;
        
        // Рассчитываем бонус навыка
        const skillBonus = mod + (isProficient ? (isExpert ? proficiencyBonus * 2 : proficiencyBonus) : 0);
        
        // Добавляем строку в таблицу
        skillsData.push([
          isProficient ? '✓' : '',
          skillName,
          `(${ability})`,
          modStr(skillBonus)
        ]);
      }
      
      // Таблица первой половины навыков
      autoTable(doc, {
        startY: 128,
        head: [['', 'Навык', 'Хар-ка', 'Бонус']],
        body: skillsData,
        theme: 'striped',
        styles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 8 } },
        margin: { left: 20 }
      });
      
      // Вторая половина навыков
      const secondHalfSkills = Object.entries(skillAbilities).slice(9);
      const skillsData2: string[][] = [];
      
      for (const [skillName, { ability, mod }] of secondHalfSkills) {
        // Безопасно проверяем навык, избегая сравнения объектов с числами
        const isProficient = character.skills && 
                            character.skills[skillName] && 
                            character.skills[skillName].proficient === true;
        const isExpert = character.skills && 
                        character.skills[skillName] && 
                        character.skills[skillName].expertise === true;
        
        // Рассчитываем бонус навыка
        const skillBonus = mod + (isProficient ? (isExpert ? proficiencyBonus * 2 : proficiencyBonus) : 0);
        
        // Добавляем строку в таблицу
        skillsData2.push([
          isProficient ? '✓' : '',
          skillName,
          `(${ability})`,
          modStr(skillBonus)
        ]);
      }
      
      // Таблица второй половины навыков
      autoTable(doc, {
        startY: 128,
        head: [['', 'Навык', 'Хар-ка', 'Бонус']],
        body: skillsData2,
        theme: 'striped',
        styles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 8 } },
        margin: { left: 110 }
      });
      
      // Владения и языки
      doc.setFontSize(14);
      doc.text("Владения и языки", 20, 190);
      
      // Объединяем все профессии
      let proficienciesText = '';
      
      // Доспехи
      if (character.proficiencies?.armor && character.proficiencies.armor.length > 0) {
        proficienciesText += 'Доспехи: ' + character.proficiencies.armor.join(', ') + '\n';
      }
      
      // Оружие
      if (character.proficiencies?.weapons && character.proficiencies.weapons.length > 0) {
        proficienciesText += 'Оружие: ' + character.proficiencies.weapons.join(', ') + '\n';
      }
      
      // Инструменты
      if (character.proficiencies?.tools && character.proficiencies.tools.length > 0) {
        proficienciesText += 'Инструменты: ' + character.proficiencies.tools.join(', ') + '\n';
      }
      
      // Языки
      let languagesText = '';
      if (character.proficiencies?.languages && character.proficiencies.languages.length > 0) {
        languagesText = character.proficiencies.languages.join(', ');
      } else if (character.languages && character.languages.length > 0) {
        languagesText = character.languages.join(', ');
      }
      
      if (languagesText) {
        proficienciesText += 'Языки: ' + languagesText;
      }
      
      // Таблица владений и языков
      autoTable(doc, {
        startY: 193,
        body: [[proficienciesText]],
        theme: 'striped',
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
      });
      
      // Снаряжение
      doc.setFontSize(14);
      doc.text("Снаряжение", 20, 220);
      
      // Объединяем всё снаряжение
      let equipmentText = '';
      if (character.equipment && character.equipment.length > 0) {
        equipmentText = character.equipment.join(', ');
      }
      
      // Таблица снаряжения
      autoTable(doc, {
        startY: 223,
        body: [[equipmentText]],
        theme: 'striped',
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
      });
      
      // Заклинания (если есть)
      let currentY = 240;
      
      if (character.spells && character.spells.length > 0) {
        doc.setFontSize(14);
        doc.text("Заклинания", 20, currentY);
        currentY += 3;
        
        // Групируем заклинания по уровням
        const spellsByLevel: { [key: number]: string[] } = {};
        for (const spell of character.spells) {
          const spellName = typeof spell === 'object' ? spell.name : spell;
          const spellLevel = typeof spell === 'object' ? spell.level : 0;
          
          if (!spellsByLevel[spellLevel]) {
            spellsByLevel[spellLevel] = [];
          }
          
          spellsByLevel[spellLevel].push(spellName);
        }
        
        // Выводим заклинания по уровням
        for (const [level, spells] of Object.entries(spellsByLevel)) {
          const levelName = level === '0' ? 'Заговоры' : `Заклинания ${level} уровня`;
          const spellsText = spells.join(', ');
          
          autoTable(doc, {
            startY: currentY,
            head: [[levelName]],
            body: [[spellsText]],
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
            margin: { left: 20, right: 20 }
          });
          
          currentY = (doc as any).lastAutoTable.finalY + 5;
        }
      }
      
      // Добавляем особенности и черты на новой странице, если необходимо
      doc.addPage();
      
      doc.setFontSize(20);
      doc.text(`${character.name} - Особенности и черты`, 105, 15, { align: 'center' });
      
      // Информация о предыстории и персонаже
      doc.setFontSize(14);
      doc.text("Личность и предыстория", 20, 30);
      
      const personalityData = [
        ['Внешность', character.appearance || ''],
        ['Черты характера', character.personalityTraits || ''],
        ['Идеалы', character.ideals || ''],
        ['Привязанности', character.bonds || ''],
        ['Слабости', character.flaws || '']
      ];
      
      autoTable(doc, {
        startY: 33,
        body: personalityData,
        theme: 'striped',
        styles: { fontSize: 9 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
        margin: { left: 20, right: 20 }
      });
      
      // Предыстория персонажа
      doc.setFontSize(14);
      doc.text("Предыстория", 20, 80);
      
      // Разбиваем предысторию на строки
      const backstoryParagraphs = character.backstory ? character.backstory.split('\n') : [''];
      
      autoTable(doc, {
        startY: 83,
        body: backstoryParagraphs.map(p => [p]),
        theme: 'striped',
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
      });
      
      // Особенности класса и расы
      doc.setFontSize(14);
      doc.text("Особенности и черты", 20, 150);
      
      // Собираем все особенности
      let featuresText = '';
      if (character.features && character.features.length > 0) {
        featuresText = character.features.join('\n\n');
      }
      
      autoTable(doc, {
        startY: 153,
        body: [[featuresText]],
        theme: 'striped',
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
      });
      
      // Добавляем колонтитулы на всех страницах
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`© DnD Character Sheet — Страница ${i} из ${pageCount}`, 105, 290, { align: 'center' });
      }
      
      // Возвращаем PDF как Blob
      const pdfBlob = doc.output('blob');
      resolve(pdfBlob);
      
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
      reject(error);
    }
  });
};

export default {
  generateCharacterPdf
};
