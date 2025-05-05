import { Character } from '@/types/character';

// Заглушка для генератора PDF
export function generateCharacterPdf(character: Character): void {
  console.log('Генерация PDF для персонажа:', character);
  
  // В реальном приложении здесь будет код для генерации PDF
  
  // Проверка на тип equipment для корректного отображения
  if (character.equipment) {
    if (Array.isArray(character.equipment)) {
      console.log('Список снаряжения:', character.equipment.join(', '));
    } else {
      const { weapons, armor, items } = character.equipment;
      
      if (weapons && weapons.length > 0) {
        console.log('Оружие:', weapons.join(', '));
      }
      
      if (armor) {
        console.log('Броня:', armor);
      }
      
      if (items && items.length > 0) {
        console.log('Предметы:', items.join(', '));
      }
    }
  }
  
  // Проверка на proficiencies
  if (character.proficiencies) {
    if (Array.isArray(character.proficiencies)) {
      console.log('Владения:', character.proficiencies.join(', '));
    } else {
      const { armor, weapons, tools, languages } = character.proficiencies;
      
      if (armor && armor.length > 0) {
        console.log('Владение доспехами:', armor.join(', '));
      }
      
      if (weapons && weapons.length > 0) {
        console.log('Владение оружием:', weapons.join(', '));
      }
      
      if (tools && tools.length > 0) {
        console.log('Владение инструментами:', tools.join(', '));
      }
      
      if (languages && languages.length > 0) {
        console.log('Владение языками:', languages.join(', '));
      }
    }
  }
  
  // Проверка на изображение персонажа
  if (character.image) {
    console.log('Изображение персонажа:', character.image);
  }
  
  alert('Функция генерации PDF в разработке. В будущем здесь будет реальная генерация PDF.');
}

// Экспорт дополнительных функций для PDF генерации
export const characterPdfUtils = {
  getModifier: (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  },
  
  formatSpellList: (spells: any[] | undefined): string => {
    if (!spells || spells.length === 0) return "Нет заклинаний";
    
    return spells.map(spell => {
      if (typeof spell === 'string') return spell;
      return spell.name;
    }).join(', ');
  },
  
  calculateProficiencyBonus: (level: number): number => {
    return Math.floor((level - 1) / 4) + 2;
  }
};

export default generateCharacterPdf;
