
/**
 * Возвращает тип кубика хитов для заданного класса
 * @param className Название класса персонажа
 * @returns Тип кубика хитов (d6, d8, d10 или d12)
 */
export const getHitDieByClass = (className?: string): 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' => {
  if (!className) return 'd8';
  
  switch (className.toLowerCase()) {
    case 'варвар':
      return 'd12';
    case 'воин':
    case 'паладин':
    case 'следопыт':
      return 'd10';
    case 'бард':
    case 'жрец':
    case 'друид':
    case 'монах':
    case 'плут':
    case 'колдун':
      return 'd8';
    case 'волшебник':
    case 'чародей':
      return 'd6';
    default:
      return 'd8'; // Значение по умолчанию
  }
};

/**
 * Преобразует число в римскую нумерацию (для уровней)
 * @param num Число для преобразования
 * @returns Римская нумерация
 */
export const toRomanNumeral = (num: number): string => {
  const roman = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1
  };
  let str = '';
  
  for (let i of Object.keys(roman)) {
    const q = Math.floor(num / roman[i as keyof typeof roman]);
    num -= q * roman[i as keyof typeof roman];
    str += i.repeat(q);
  }
  
  return str;
};
