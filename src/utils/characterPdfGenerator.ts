import jsPDF from "jspdf";
import { CharacterSheet } from "@/types/character";

// Функция для генерации PDF документа
export const generateCharacterSheetPdf = (character: CharacterSheet) => {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
  });

  // Добавляем шрифты
  doc.addFont("helvetica", "normal");
  doc.addFont("helvetica", "bold");

  // Устанавливаем отступы
  const margin = 10;

  // Добавляем рамку
  doc.rect(margin, margin, 210 - 2 * margin, 297 - 2 * margin);

  // Заголовок
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Лист персонажа", 105, 25, { align: "center" });

  // Имя персонажа
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Имя:", 15, 32);
  doc.setFont("helvetica", "normal");
  doc.text(character.name, 40, 32);

  // Уровень персонажа
  doc.setFont("helvetica", "bold");
  doc.text("Уровень:", 145, 32);
  doc.setFont("helvetica", "normal");
  doc.text(character.level.toString(), 170, 32);

  // Класс персонажа
  doc.setFont("helvetica", "bold");
  doc.text("Класс:", 15, 40);
  doc.setFont("helvetica", "normal");
  doc.text(character.class, 40, 40);

  // Раса персонажа
  doc.setFont("helvetica", "bold");
  doc.text("Раса:", 145, 40);
  doc.setFont("helvetica", "normal");
  doc.text(character.race, 170, 40);

  // Характеристики
  doc.setFont("helvetica", "bold");
  doc.text("Характеристики:", 15, 55);

  const startX = 15;
  let startY = 60;
  const lineHeight = 8;

  const abilities = [
    { name: "Сила", value: character.abilities.strength },
    { name: "Ловкость", value: character.abilities.dexterity },
    { name: "Телосложение", value: character.abilities.constitution },
    { name: "Интеллект", value: character.abilities.intelligence },
    { name: "Мудрость", value: character.abilities.wisdom },
    { name: "Харизма", value: character.abilities.charisma },
  ];

  abilities.forEach((ability) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${ability.name}:`, startX, startY);
    doc.setFont("helvetica", "normal");
    doc.text(ability.value.toString(), startX + 20, startY);
    startY += lineHeight;
  });

  // Бонус мастерства
  const level = character.level || 1;
  let proficiencyBonus = 2;
  if (level >= 5) proficiencyBonus = 3;
  if (level >= 9) proficiencyBonus = 4;
  if (level >= 13) proficiencyBonus = 5;
  if (level >= 17) proficiencyBonus = 6;

  doc.setFont("helvetica", "bold");
  doc.text("Бонус мастерства: +", 150, 77);
  doc.setFont("helvetica", "normal");
  doc.text(proficiencyBonus.toString(), 195, 77);

  // Навыки
  doc.setFont("helvetica", "bold");
  doc.text("Навыки:", 15, 90);

  startY = 95;
  const skills = character.skills || [];
  skills.forEach((skill) => {
    doc.setFont("helvetica", "normal");
    doc.text(`- ${skill}`, startX, startY);
    startY += lineHeight;
  });

  // Языки
  doc.setFont("helvetica", "bold");
  doc.text("Языки:", 105, 90);

  startY = 95;
  const languages = character.languages || [];
  languages.forEach((language) => {
    doc.setFont("helvetica", "normal");
    doc.text(`- ${language}`, 105, startY);
    startY += lineHeight;
  });

  // Снаряжение
  doc.setFont("helvetica", "bold");
  doc.text("Снаряжение:", 15, 150);

  startY = 155;
  const equipment = character.equipment || [];
  equipment.forEach((item) => {
    doc.setFont("helvetica", "normal");
    doc.text(`- ${item}`, startX, startY);
    startY += lineHeight;
  });

  // Заклинания
  doc.setFont("helvetica", "bold");
  doc.text("Заклинания:", 105, 150);

  startY = 155;
  const spells = character.spells || [];
  spells.forEach((spell) => {
    doc.setFont("helvetica", "normal");
    doc.text(`- ${spell}`, 105, startY);
    startY += lineHeight;
  });

  // Предыстория
  doc.setFont("helvetica", "bold");
  doc.text("Предыстория:", 15, 200);
  doc.setFont("helvetica", "normal");
  doc.text(character.backstory || "Нет данных", 15, 205, {
    maxWidth: 180,
  });

  // Личность
  doc.setFont("helvetica", "bold");
  doc.text("Личность:", 15, 230);
  doc.setFont("helvetica", "normal");
  doc.text(character.personalityTraits || "Нет данных", 15, 235, {
    maxWidth: 180,
  });

  // Черты характера
  doc.setFont("helvetica", "bold");
  doc.text("Внешность:", 15, 250);
  doc.setFont("helvetica", "normal");
  doc.text(character.appearance || "Нет данных", 15, 255, {
    maxWidth: 180,
  });

  // Дополнительная информация
  doc.setFont("helvetica", "bold");
  doc.text("Мировоззрение:", 105, 200);
  doc.setFont("helvetica", "normal");
  doc.text(character.alignment || "Нет данных", 105, 205, {
    maxWidth: 90,
  });

  doc.setFont("helvetica", "bold");
  doc.text("Идеалы:", 105, 230);
  doc.setFont("helvetica", "normal");
  doc.text(character.ideals || "Нет данных", 105, 235, {
    maxWidth: 90,
  });

  doc.setFont("helvetica", "bold");
  doc.text("Привязанности:", 105, 250);
  doc.setFont("helvetica", "normal");
  doc.text(character.bonds || "Нет данных", 105, 255, {
    maxWidth: 90,
  });

  doc.setFont("helvetica", "bold");
  doc.text("Слабости:", 105, 265);
  doc.setFont("helvetica", "normal");
  doc.text(character.flaws || "Нет данных", 105, 270, {
    maxWidth: 90,
  });

  // Номер страницы
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageNumber = i;

    doc.setFontSize(8);
    doc.text("Страница:", 190, 280);
    doc.text(pageNumber.toString(), 210, 280);
  }

  // Возвращаем PDF документ
  return doc;
};
