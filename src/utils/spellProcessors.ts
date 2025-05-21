
/**
 * Парсит строку компонентов заклинания в объект
 * @param componentStr Строка компонентов (например "ВСМ", "ВС(Р)")
 * @returns Объект с флагами компонентов
 */
export const parseComponents = (componentStr: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
} => {
  const result = {
    verbal: false,
    somatic: false,
    material: false,
    ritual: false
  };

  if (!componentStr) return result;
  
  // Проверяем наличие компонентов
  if (componentStr.includes('В')) result.verbal = true;
  if (componentStr.includes('С')) result.somatic = true;
  if (componentStr.includes('М')) result.material = true;
  if (componentStr.includes('Р') || componentStr.includes('(Р)')) result.ritual = true;
  
  return result;
};

/**
 * Форматирует объект компонентов в строку для отображения
 * @param components Объект компонентов
 * @returns Форматированная строка компонентов
 */
export const formatComponents = (components: {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
}): string => {
  let result = '';
  
  if (components.verbal) result += 'В';
  if (components.somatic) result += 'С';
  if (components.material) result += 'М';
  
  if (components.ritual) {
    result += ' (Р)';
  }
  
  return result;
};
