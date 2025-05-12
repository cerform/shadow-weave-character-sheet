import { Character } from '@/types/character';
import jsPDF from 'jspdf';

export const generateCharacterPDF = async (character: Character) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(character.name, 10, 10);
  
  doc.setFontSize(12);
  doc.text(`Класс: ${character.class}`, 10, 20);
  doc.text(`Уровень: ${character.level.toString()}`, 10, 30);
  doc.text(`Раса: ${character.race}`, 10, 40);
  
  doc.text(`Сила: ${character.strength.toString()}`, 10, 60);
  doc.text(`Ловкость: ${character.dexterity.toString()}`, 10, 70);
  doc.text(`Телосложение: ${character.constitution.toString()}`, 10, 80);
  doc.text(`Интеллект: ${character.intelligence.toString()}`, 10, 90);
  doc.text(`Мудрость: ${character.wisdom.toString()}`, 10, 100);
  doc.text(`Харизма: ${character.charisma.toString()}`, 10, 110);
  
  // Исправим обращение к спискам языков и других вещей
  
  // Языки
  const languages = character.proficiencies?.languages || [];
  const languagesText = languages.length > 0 ? 
    languages.join(', ') : 
    'Нет известных языков';
  
  // Инструменты
  const tools = character.proficiencies?.tools || [];
  const toolsText = tools.length > 0 ?
    tools.join(', ') :
    'Нет владения инструментами';
  
  doc.text(`Языки: ${languagesText}`, 10, 130);
  doc.text(`Инструменты: ${toolsText}`, 10, 140);
  
  doc.text(`Предыстория: ${character.backstory}`, 10, 160);
  
  // Изображение персонажа
  let characterImageSrc = null;
  if (character.image) {
    characterImageSrc = character.image;
  }
  
  if (characterImageSrc) {
    try {
      const imageResponse = await fetch(characterImageSrc);
      const imageBlob = await imageResponse.blob();
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });
      
      doc.addImage(imageBase64, 'JPEG', 120, 10, 80, 80);
    } catch (error) {
      console.error("Ошибка при загрузке изображения:", error);
    }
  }
  
  doc.save(`${character.name}.pdf`);
};
