
// Маппинг школ магии для фильтрации и отображения
export const SchoolFilterMapping = {
  'abjuration': 'Ограждение',
  'conjuration': 'Вызов',
  'divination': 'Прорицание',
  'enchantment': 'Очарование',
  'evocation': 'Воплощение',
  'illusion': 'Иллюзия',
  'necromancy': 'Некромантия',
  'transmutation': 'Преобразование',
  'universal': 'Универсальная'
};

// Функция для получения русского названия школы по английскому
export const getSchoolLocalName = (school: string): string => {
  return SchoolFilterMapping[school.toLowerCase()] || school;
};

// Функция для получения английского названия школы по русскому
export const getSchoolEnglishName = (localName: string): string => {
  const entry = Object.entries(SchoolFilterMapping).find(([_, value]) => value === localName);
  return entry ? entry[0] : localName;
};
