
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellTableProps {
  spells: SpellData[];
  onSpellClick: (spell: SpellData) => void;
}

const SpellTable: React.FC<SpellTableProps> = ({ spells, onSpellClick }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Обработчик клика по заголовку для сортировки
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Сортировка заклинаний
  const sortedSpells = [...spells].sort((a, b) => {
    const aValue = a[sortColumn as keyof SpellData];
    const bValue = b[sortColumn as keyof SpellData];
    
    if (aValue === bValue) return 0;
    
    // Специальная обработка для уровня (числовое значение)
    if (sortColumn === 'level') {
      return sortDirection === 'asc'
        ? (a.level || 0) - (b.level || 0)
        : (b.level || 0) - (a.level || 0);
    }
    
    // Обработка строковых значений
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });
  
  // Форматирование текста для сортировки
  const getSortIndicator = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Получение стиля для заголовка сортировки
  const getSortHeaderStyle = (column: string) => {
    return sortColumn === column 
      ? { color: currentTheme.accent, cursor: 'pointer' }
      : { cursor: 'pointer' };
  };

  // Сокращение длинного описания для таблицы
  const truncateDescription = (description: string | string[]) => {
    const text = typeof description === 'string' 
      ? description 
      : Array.isArray(description) 
        ? description.join(' ') 
        : '';
    
    return text.length > 80 ? text.slice(0, 80) + '...' : text;
  };

  return (
    <div className="rounded-md border" style={{ borderColor: currentTheme.accent }}>
      <Table>
        <TableHeader>
          <TableRow style={{ backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)'}` }}>
            <TableHead 
              onClick={() => handleSort('name')}
              style={getSortHeaderStyle('name')}
              className="w-[180px]"
            >
              Название{getSortIndicator('name')}
            </TableHead>
            <TableHead 
              onClick={() => handleSort('level')}
              style={getSortHeaderStyle('level')}
              className="w-[80px] text-center"
            >
              Уровень{getSortIndicator('level')}
            </TableHead>
            <TableHead 
              onClick={() => handleSort('school')}
              style={getSortHeaderStyle('school')}
              className="w-[120px]"
            >
              Школа{getSortIndicator('school')}
            </TableHead>
            <TableHead className="hidden md:table-cell">Время накладывания</TableHead>
            <TableHead className="hidden md:table-cell">Дистанция</TableHead>
            <TableHead className="hidden lg:table-cell">Компоненты</TableHead>
            <TableHead className="hidden lg:table-cell">Длительность</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSpells.length > 0 ? (
            sortedSpells.map((spell) => (
              <TableRow 
                key={spell.id || spell.name}
                className="cursor-pointer hover:bg-accent/10"
                onClick={() => onSpellClick(spell)}
                style={{ color: currentTheme.textColor }}
              >
                <TableCell className="font-medium">{spell.name}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant="outline"
                    style={{
                      backgroundColor: spell.level === 0 ? 'rgba(75, 75, 75, 0.6)' : currentTheme.accent,
                      color: currentTheme.textColor
                    }}
                  >
                    {spell.level === 0 ? "Заговор" : spell.level}
                  </Badge>
                </TableCell>
                <TableCell>{spell.school}</TableCell>
                <TableCell className="hidden md:table-cell">{spell.castingTime}</TableCell>
                <TableCell className="hidden md:table-cell">{spell.range}</TableCell>
                <TableCell className="hidden lg:table-cell">{spell.components}</TableCell>
                <TableCell className="hidden lg:table-cell">{spell.duration}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Заклинания не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SpellTable;
