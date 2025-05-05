
import { SpellData } from "@/types/spells";
import { CharacterSpell } from "@/types/character";

/**
 * Проверяет, является ли объект объектом CharacterSpell
 */
export const isCharacterSpellObject = (spell: CharacterSpell | string): spell is CharacterSpell => {
  return typeof spell === "object" && spell !== null;
};

/**
 * Получает уровень заклинания
 */
export const getSpellLevel = (spell: CharacterSpell | string): number => {
  if (typeof spell === "string") {
    return 0; // Устанавливаем заговор по умолчанию для строковых заклинаний
  }
  return spell.level;
};

/**
 * Проверяет, подготовлено ли заклинание
 */
export const isSpellPrepared = (spell: CharacterSpell | string): boolean => {
  if (typeof spell === "string") {
    return false; // Строковые заклинания не могут быть подготовлены
  }
  return spell.prepared || false;
};

/**
 * Проверяет, является ли заклинание ритуальным
 */
export const isRitualSpell = (spell: CharacterSpell | string): boolean => {
  if (typeof spell === "string") {
    return false;
  }
  return spell.ritual || false;
};

/**
 * Проверяет, требует ли заклинание концентрации
 */
export const isConcentrationSpell = (spell: CharacterSpell | string): boolean => {
  if (typeof spell === "string") {
    return false;
  }
  return spell.concentration || false;
};

/**
 * Преобразует данные заклинания для отображения в интерфейсе
 */
export const formatSpellForDisplay = (spell: CharacterSpell | SpellData): SpellData => {
  const spellData: SpellData = {
    name: spell.name,
    level: spell.level,
    school: spell.school || "Универсальная",
    castingTime: spell.castingTime || "1 действие",
    range: spell.range || "На себя",
    components: spell.components || "В, С",
    duration: spell.duration || "Мгновенная",
    description: spell.description || "Нет описания",
    classes: spell.classes || [],
    ritual: "ritual" in spell ? spell.ritual : false,
    concentration: "concentration" in spell ? spell.concentration : false,
    isRitual: "ritual" in spell ? spell.ritual : false,
    isConcentration: "concentration" in spell ? spell.concentration : false,
    prepared: "prepared" in spell ? spell.prepared : false
  };

  return spellData;
};

/**
 * Возвращает текстовое представление компонентов заклинания
 */
export const getSpellComponentsText = (spell: CharacterSpell | SpellData): string => {
  const components: string[] = [];
  
  if (spell.verbal || spell.components?.includes("В") || spell.components?.includes("V")) {
    components.push("В");
  }
  
  if (spell.somatic || spell.components?.includes("С") || spell.components?.includes("S")) {
    components.push("С");
  }
  
  if (spell.material || spell.components?.includes("М") || spell.components?.includes("M")) {
    components.push("М");
    if (spell.materials) {
      components[components.length - 1] += ` (${spell.materials})`;
    }
  }
  
  return components.join(", ");
};
