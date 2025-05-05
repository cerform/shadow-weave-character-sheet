
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Book, Sparkles } from 'lucide-react';
import { SpellData } from '@/types/spells';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SpellTableProps {
  spells: SpellData[];
  onSpellClick: (spell: SpellData) => void;
  currentTheme: any;
}

const SpellTable: React.FC<SpellTableProps> = ({ spells, onSpellClick, currentTheme }) => {
  const getLevelName = (level: number) => {
    return level === 0 ? 'Заговор' : `${level} уровень`;
  };

  // Получение цвета для уровня заклинания из текущей темы
  const getLevelColor = (level: number) => {
    if (currentTheme.spellLevels && currentTheme.spellLevels[level]) {
      return currentTheme.spellLevels[level];
    }
    // Запасные цвета, если в теме не определены
    const fallbackColors: Record<number, string> = {
      0: '#6b7280',
      1: '#3b82f6',
      2: '#8b5cf6',
      3: '#ec4899',
      4: '#f97316',
      5: '#ef4444',
      6: '#14b8a6',
      7: '#6366f1',
      8: '#ca8a04',
      9: '#059669'
    };
    return fallbackColors[level] || '#6b7280';
  };
  
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return "—";
    if (typeof classes === 'string') return classes;
    return classes.join(', ');
  };

  return (
    <ScrollArea className="h-[60vh]">
      <Table>
        <TableHeader>
          <TableRow style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderBottomColor: currentTheme.accent + '30'
          }}>
            <TableHead style={{ color: currentTheme.accent }}>Название</TableHead>
            <TableHead style={{ color: currentTheme.accent }}>Уровень</TableHead>
            <TableHead style={{ color: currentTheme.accent }}>Школа</TableHead>
            <TableHead className="hidden md:table-cell" style={{ color: currentTheme.accent }}>Время накладывания</TableHead>
            <TableHead className="hidden md:table-cell" style={{ color: currentTheme.accent }}>Дистанция</TableHead>
            <TableHead className="hidden lg:table-cell" style={{ color: currentTheme.accent }}>Компоненты</TableHead>
            <TableHead className="hidden lg:table-cell" style={{ color: currentTheme.accent }}>Длительность</TableHead>
            <TableHead className="hidden lg:table-cell" style={{ color: currentTheme.accent }}>Классы</TableHead>
            <TableHead style={{ color: currentTheme.accent }}>Особенности</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spells.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10 bg-black/20" style={{ color: currentTheme.textColor }}>
                <div className="flex flex-col items-center">
                  <Book className="h-12 w-12 mb-3 opacity-30" style={{ color: currentTheme.accent }} />
                  <p className="text-lg font-semibold">Заклинания не найдены</p>
                  <p className="text-sm opacity-70 mt-1">Попробуйте изменить параметры поиска или фильтрации</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            spells.map((spell, index) => (
              <TableRow 
                key={`${spell.id || spell.name}-${index}`}
                onClick={() => onSpellClick(spell)}
                className="cursor-pointer hover:bg-black/40 transition-colors"
                style={{ 
                  borderBottomColor: currentTheme.accent + '10',
                  backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                }}
              >
                <TableCell className="font-medium" style={{ color: currentTheme.textColor }}>
                  {spell.name}
                </TableCell>
                <TableCell>
                  <Badge
                    style={{ 
                      backgroundColor: getLevelColor(spell.level),
                      color: '#fff',
                    }}
                  >
                    {getLevelName(spell.level)}
                  </Badge>
                </TableCell>
                <TableCell style={{ color: currentTheme.textColor }}>{spell.school}</TableCell>
                <TableCell className="hidden md:table-cell" style={{ color: currentTheme.textColor }}>{spell.castingTime || '—'}</TableCell>
                <TableCell className="hidden md:table-cell" style={{ color: currentTheme.textColor }}>{spell.range || '—'}</TableCell>
                <TableCell className="hidden lg:table-cell" style={{ color: currentTheme.textColor }}>{spell.components || '—'}</TableCell>
                <TableCell className="hidden lg:table-cell" style={{ color: currentTheme.textColor }}>{spell.duration || '—'}</TableCell>
                <TableCell className="hidden lg:table-cell" style={{ color: currentTheme.textColor }}>{formatClasses(spell.classes)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {spell.ritual && (
                      <Badge variant="outline" className="px-1 flex items-center gap-1" style={{ borderColor: currentTheme.accent }}>
                        <Book className="h-3 w-3" style={{ color: currentTheme.accent }} />
                        <span style={{ color: currentTheme.accent }}>Р</span>
                      </Badge>
                    )}
                    
                    {spell.concentration && (
                      <Badge variant="outline" className="px-1 flex items-center gap-1" style={{ borderColor: currentTheme.accent }}>
                        <Sparkles className="h-3 w-3" style={{ color: currentTheme.accent }} />
                        <span style={{ color: currentTheme.accent }}>К</span>
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default SpellTable;
