
import { getSpellSchoolColor } from './schemeUtils';

/**
 * Возвращает цвет бейджа школы в зависимости от темы
 */
export const getSchoolBadgeColor = (school: string, isDark = false): string => {
  const baseColor = getSpellSchoolColor(school);
  
  // Для темной темы можно настроить светлее цвета
  if (isDark) {
    return baseColor + '80'; // 50% прозрачности
  }
  
  return baseColor;
};

/**
 * Возвращает цвет фона заклинания в зависимости от уровня
 */
export const getSpellBackgroundColor = (level: number, isDark = false): string => {
  if (isDark) {
    switch (level) {
      case 0: return 'rgba(75, 85, 99, 0.1)'; // gray
      case 1: return 'rgba(59, 130, 246, 0.1)'; // blue
      case 2: return 'rgba(16, 185, 129, 0.1)'; // green
      case 3: return 'rgba(245, 158, 11, 0.1)'; // amber
      case 4: return 'rgba(139, 92, 246, 0.1)'; // purple
      case 5: return 'rgba(236, 72, 153, 0.1)'; // pink
      case 6: return 'rgba(244, 63, 94, 0.1)'; // rose
      case 7: return 'rgba(14, 165, 233, 0.1)'; // sky
      case 8: return 'rgba(147, 51, 234, 0.1)'; // violet
      case 9: return 'rgba(220, 38, 38, 0.1)'; // red
      default: return 'rgba(107, 114, 128, 0.1)'; // default gray
    }
  } else {
    switch (level) {
      case 0: return 'rgba(75, 85, 99, 0.05)';
      case 1: return 'rgba(59, 130, 246, 0.05)';
      case 2: return 'rgba(16, 185, 129, 0.05)';
      case 3: return 'rgba(245, 158, 11, 0.05)';
      case 4: return 'rgba(139, 92, 246, 0.05)';
      case 5: return 'rgba(236, 72, 153, 0.05)';
      case 6: return 'rgba(244, 63, 94, 0.05)';
      case 7: return 'rgba(14, 165, 233, 0.05)';
      case 8: return 'rgba(147, 51, 234, 0.05)';
      case 9: return 'rgba(220, 38, 38, 0.05)';
      default: return 'rgba(107, 114, 128, 0.05)';
    }
  }
};
