
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Eye, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import DebugPanel from '@/components/debug/DebugPanel';
import { validateCharacters } from '@/utils/debugUtils';

interface CharactersTableProps {
  characters: Character[];
  loading?: boolean;
  error?: string | null;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Экспортируем компонент с правильным именем
export const CharactersTable: React.FC<CharactersTableProps> = ({ 
  characters, 
  loading = false,
  error = null,
  onView,
  onEdit,
  onDelete 
}) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const [validationReport, setValidationReport] = useState<any>(null);
  
  // Валидация массива персонажей при монтировании/обновлении
  useEffect(() => {
    if (typeof validateCharacters === 'function') {
      const validation = validateCharacters(characters);
      setValidationReport(validation);
      
      if (validation && !validation.valid) {
        console.warn('CharactersTable: Найдены проблемы с данными персонажей:', validation);
      }
    }
  }, [characters]);

  // Функция удаления персонажа с индикацией загрузки
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDelete(id);
      toast.success('Персонаж удален успешно');
    } catch (err) {
      toast.error('Не удалось удалить персонажа');
      console.error('Ошибка при удалении персонажа:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Функция для отображения класса персонажа с учетом разных форматов данных
  const getCharacterClass = (character: Character): string => {
    // Проверяем различные поля, где может храниться класс
    const classValue = character.className || character.class;
    return typeof classValue === 'string' && classValue.trim() !== ''
      ? classValue
      : '—';
  };

  // Функция для форматирования уровня персонажа
  const getCharacterLevel = (character: Character): string => {
    const level = character.level;
    if (!level && level !== 0) return '1'; // По умолчанию 1 уровень
    return String(level);
  };

  // Функция для безопасного получения расы персонажа
  const getCharacterRace = (character: Character): string => {
    return character.race || '—';
  };

  // Если происходит загрузка, показываем индикатор
  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Загрузка персонажей...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Если есть ошибка, показываем сообщение об ошибке
  if (error) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-red-500">Ошибка загрузки</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Проверяем корректность массива персонажей
  if (!Array.isArray(characters)) {
    console.error('CharactersTable: characters не является массивом:', characters);
    return (
      <Card className="bg-black/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-red-500">Ошибка данных</CardTitle>
          <CardDescription>Формат данных персонажей некорректный</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-950/30 border border-red-800 rounded">
            <p className="mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              Данные о персонажах не являются массивом
            </p>
            <pre className="text-xs bg-black/50 p-2 rounded overflow-auto max-h-40">
              {typeof characters === 'object' 
                ? JSON.stringify(characters, null, 2) 
                : `Тип данных: ${typeof characters}`}
            </pre>
          </div>
          
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Выводим в консоль для отладки
  console.log('CharactersTable: characters получены:', characters);
  
  // Если нет персонажей, показываем сообщение
  if (characters.length === 0) {
    console.log('CharactersTable: Персонажи не найдены');
    return (
      <Card className="bg-black/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Список персонажей</CardTitle>
          <CardDescription>У вас пока нет персонажей</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Создайте своего первого персонажа, нажав на кнопку выше</p>
        </CardContent>
      </Card>
    );
  }

  // Отфильтруем персонажей, чтобы убедиться, что у всех есть ID
  const validCharacters = characters.filter(character => character && character.id);
  console.log('CharactersTable: Валидных персонажей:', validCharacters.length);
  
  if (validCharacters.length === 0) {
    console.warn('CharactersTable: Все персонажи невалидны (без ID)');
    return (
      <Card className="bg-black/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Список персонажей</CardTitle>
          <CardDescription>Проблема с данными персонажей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded">
            <p>Возникла проблема с загрузкой данных персонажей. Они получены, но в некорректном формате.</p>
          </div>
          
          {validationReport && (
            <DebugPanel 
              title="Проблемы с данными персонажей" 
              data={validationReport} 
              variant="warning"
              showByDefault={true}
            />
          )}
          
          <div className="mt-4">
            <Button onClick={() => window.location.reload()}>
              Обновить страницу
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Если есть невалидные персонажи, выводим предупреждение
  const hasInvalidCharacters = characters.length > validCharacters.length;

  return (
    <Card className="bg-black/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle style={{ color: currentTheme.textColor }}>Список персонажей</CardTitle>
        <CardDescription>Всего персонажей: {validCharacters.length}</CardDescription>
      </CardHeader>
      <CardContent>
        {validationReport && !validationReport.valid && (
          <DebugPanel 
            title="Диагностика данных персонажей" 
            data={validationReport} 
            variant="warning"
            showByDefault={true}
          />
        )}
        
        {hasInvalidCharacters && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded">
            <p className="text-yellow-200 text-sm">
              Внимание: {characters.length - validCharacters.length} из {characters.length} персонажей не отображаются из-за отсутствия ID
            </p>
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя персонажа</TableHead>
              <TableHead>Класс</TableHead>
              <TableHead>Раса</TableHead>
              <TableHead>Уровень</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validCharacters.map((character) => (
              <TableRow key={character.id}>
                <TableCell className="font-medium text-primary">
                  {character.name || 'Без имени'}
                </TableCell>
                <TableCell>{getCharacterClass(character)}</TableCell>
                <TableCell>{getCharacterRace(character)}</TableCell>
                <TableCell>{getCharacterLevel(character)}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onView(character.id!)}
                    title="Открыть"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(character.id!)}
                    title="Редактировать"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(character.id!)}
                    disabled={deletingId === character.id}
                    className="text-red-500 hover:text-red-700"
                    title="Удалить"
                  >
                    {deletingId === character.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Также экспортируем компонент по умолчанию для совместимости
export default CharactersTable;
