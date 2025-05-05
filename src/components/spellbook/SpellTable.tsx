
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SpellData } from '@/types/spells';
import { ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';

interface SpellTableProps {
  spells: SpellData[];
  onSpellClick: (spell: SpellData) => void;
  currentTheme: any;
}

const SpellTable: React.FC<SpellTableProps> = ({ spells, onSpellClick, currentTheme }) => {
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

  // Получение иконки для заголовка сортировки
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-3 w-3 ml-1 inline opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1 inline" /> 
      : <ArrowDown className="h-3 w-3 ml-1 inline" />;
  };

  // Получение стиля для заголовка сортировки
  const getSortHeaderStyle = (column: string) => {
    return {
      cursor: 'pointer',
      color: sortColumn === column ? currentTheme.accent : currentTheme.textColor,
      backgroundColor: sortColumn === column ? `${currentTheme.accent}10` : 'transparent',
      transition: 'all 0.2s ease'
    };
  };

  return (
    <div className="rounded-lg overflow-hidden border" style={{ 
      borderColor: currentTheme.accent,
      boxShadow: `0 4px 15px ${currentTheme.accent}30`,
    }}>
      <Table>
        <TableHeader>
          <TableRow style={{ 
            backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.9)}` 
          }}>
            <TableHead 
              onClick={() => handleSort('name')}
              style={getSortHeaderStyle('name')}
              className="w-[180px] px-4 py-3"
            >
              <span className="flex items-center">
                Название {getSortIcon('name')}
              </span>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('level')}
              style={getSortHeaderStyle('level')}
              className="w-[80px] text-center px-4 py-3"
            >
              <span className="flex items-center justify-center">
                Уровень {getSortIcon('level')}
              </span>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('school')}
              style={getSortHeaderStyle('school')}
              className="w-[120px] px-4 py-3"
            >
              <span className="flex items-center">
                Школа {getSortIcon('school')}
              </span>
            </TableHead>
            <TableHead className="hidden md:table-cell px-4 py-3" style={{ color: currentTheme.textColor }}>
              Время накладывания
            </TableHead>
            <TableHead className="hidden md:table-cell px-4 py-3" style={{ color: currentTheme.textColor }}>
              Дистанция
            </TableHead>
            <TableHead className="hidden lg:table-cell px-4 py-3" style={{ color: currentTheme.textColor }}>
              Компоненты
            </TableHead>
            <TableHead className="hidden lg:table-cell px-4 py-3" style={{ color: currentTheme.textColor }}>
              Длительность
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSpells.length > 0 ? (
            sortedSpells.map((spell, index) => (
              <TableRow 
                key={spell.id || spell.name || `spell-${index}`}
                className="cursor-pointer"
                onClick={() => onSpellClick(spell)}
                style={{ 
                  color: currentTheme.textColor,
                  backgroundColor: index % 2 === 0 
                    ? `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)'}`
                    : `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'}`,
                  transition: 'background-color 0.2s ease',
                  ':hover': {
                    backgroundColor: `${currentTheme.accent}20`
                  }
                }}
              >
                <TableCell className="font-medium px-4 py-3">{spell.name}</TableCell>
                <TableCell className="text-center px-4 py-3">
                  <Badge 
                    variant="outline"
                    style={{
                      backgroundColor: spell.level === 0 ? 'rgba(75, 75, 75, 0.6)' : currentTheme.accent,
                      color: currentTheme.textColor === '#000' ? '#fff' : currentTheme.textColor
                    }}
                  >
                    {spell.level === 0 ? "Заговор" : spell.level}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3">{spell.school}</TableCell>
                <TableCell className="hidden md:table-cell px-4 py-3">{spell.castingTime}</TableCell>
                <TableCell className="hidden md:table-cell px-4 py-3">{spell.range}</TableCell>
                <TableCell className="hidden lg:table-cell px-4 py-3">{spell.components}</TableCell>
                <TableCell className="hidden lg:table-cell px-4 py-3">{spell.duration}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6" style={{ color: currentTheme.textColor }}>
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
