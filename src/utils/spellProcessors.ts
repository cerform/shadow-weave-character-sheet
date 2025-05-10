
/**
 * Преобразует компоненты заклинания в строковое представление
 */
export function componentsToString({
  verbal = false,
  somatic = false,
  material = false,
  ritual = false,
  concentration = false
}: {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
  concentration?: boolean;
}): string {
  const components = [];
  
  if (verbal) components.push('В');
  if (somatic) components.push('С');
  if (material) components.push('М');
  
  let result = components.length > 0 ? `(${components.join(', ')})` : '';
  
  if (ritual) {
    result += ' (ритуал)';
  }
  
  if (concentration) {
    result += ' (концентрация)';
  }
  
  return result.trim();
}

/**
 * Преобразует строковое представление компонентов в объект
 */
export function stringToComponents(componentsString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
  materials?: string;
} {
  const result = {
    verbal: false,
    somatic: false,
    material: false,
    ritual: false,
    concentration: false,
    materials: undefined as string | undefined
  };
  
  if (!componentsString) return result;
  
  // Проверяем наличие компонентов В, С, М
  result.verbal = /В/i.test(componentsString);
  result.somatic = /С/i.test(componentsString);
  result.material = /М/i.test(componentsString);
  
  // Проверяем ритуал и концентрацию
  result.ritual = /ритуал/i.test(componentsString);
  result.concentration = /концентрация/i.test(componentsString);
  
  // Извлекаем материальные компоненты, если они указаны
  const materialsMatch = componentsString.match(/М\s*\((.*?)\)/i);
  if (materialsMatch && materialsMatch[1]) {
    result.materials = materialsMatch[1].trim();
  }
  
  return result;
}

/**
 * Возвращает описание школы магии по ее названию
 */
export function getSchoolDescription(school: string): string {
  switch (school.toLowerCase()) {
    case 'воплощение':
    case 'evocation':
      return 'Заклинания воплощения манипулируют магической энергией для создания желаемого эффекта.';
    case 'преобразование':
    case 'transmutation':
      return 'Заклинания преобразования изменяют свойства существа, объекта или окружающей среды.';
    case 'прорицание':
    case 'divination':
      return 'Заклинания прорицания раскрывают информацию в форме тайн, забытых знаний, предсказаний будущего или нахождения скрытых вещей.';
    case 'некромантия':
    case 'necromancy':
      return 'Заклинания некромантии манипулируют энергиями жизни и смерти.';
    case 'ограждение':
    case 'abjuration':
      return 'Заклинания ограждения являются защитными по своей природе, защищая заклинателя или цели от эффектов.';
    case 'очарование':
    case 'enchantment':
      return 'Заклинания очарования воздействуют на разум других, влияя или контролируя их поведение.';
    case 'иллюзия':
    case 'illusion':
      return 'Заклинания иллюзии обманывают чувства или разум других существ.';
    case 'вызов':
    case 'conjuration':
      return 'Заклинания вызова включают транспортировку объектов и существ из одного места в другое.';
    default:
      return 'Универсальная школа магии.';
  }
}
