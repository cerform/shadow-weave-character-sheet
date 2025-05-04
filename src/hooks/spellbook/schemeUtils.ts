
export const getSpellSchoolBadgeVariant = (school: string): "destructive" | "outline" | "secondary" | "default" => {
  switch (school?.toLowerCase()) {
    case 'воплощение': return 'destructive';
    case 'некромантия': return 'outline';
    case 'очарование': return 'secondary';
    case 'преобразование': return 'default';
    case 'прорицание': return 'default';
    case 'вызов': return 'secondary';
    case 'ограждение': return 'default';
    case 'иллюзия': return 'outline';
    default: return 'default';
  }
};
