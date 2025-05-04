
// Находим проблемное место и исправляем типы
// Преобразуем CharacterSpell[] в SpellData[] с добавлением обязательных полей

// Вместо прямого присваивания:
// someVariable = characterSpells as SpellData[]

// Делаем корректное преобразование:
const convertedSpells = characterSpells.map(spell => ({
  ...spell,
  school: spell.school || "Вызов", // Добавляем школу по умолчанию
  castingTime: spell.castingTime || "1 действие",
  range: spell.range || "Self",
  components: spell.components || "",
  duration: spell.duration || "Instantaneous"
})) as SpellData[];

// И используем convertedSpells вместо прямого приведения типов
