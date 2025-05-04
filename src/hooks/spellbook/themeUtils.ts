
export const getSchoolBadgeColor = (school: string): string => {
  switch (school?.toLowerCase()) {
    case 'воплощение': return '#dc2626'; // red
    case 'некромантия': return '#4b5563'; // gray
    case 'очарование': return '#8b5cf6'; // purple
    case 'преобразование': return '#10b981'; // green
    case 'прорицание': return '#3b82f6'; // blue
    case 'вызов': return '#f59e0b'; // amber
    case 'ограждение': return '#6366f1'; // indigo
    case 'иллюзия': return '#ec4899'; // pink
    default: return '#6b7280'; // gray
  }
};
