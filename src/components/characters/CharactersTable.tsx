
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { Character } from '@/types/character';
import { toast } from 'sonner';

interface CharactersTableProps {
  characters: Character[];
  onDelete: (id: string) => Promise<void>;
}

const CharactersTable: React.FC<CharactersTableProps> = ({ characters, onDelete }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Расширенная отладка в компоненте таблицы
  useEffect(() => {
    console.log('CharactersTable: получил персонажей:', characters);
    console.log('CharactersTable: типы данных в объектах:', 
      characters.length > 0 
      ? Object.entries(characters[0]).map(([key, value]) => `${key}: ${typeof value}`)
      : 'Нет персонажей'
    );
  }, [characters]);

  // Функция открытия персонажа
  const handleViewCharacter = (id: string) => {
    console.log(`Открываем персонажа с ID: ${id}`);
    // Сохраняем ID последнего выбранного персонажа
    localStorage.setItem('last-selected-character', id);
    navigate(`/character/${id}`);
  };

  // Функция удаления персонажа с индикацией загрузки
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDelete(id);
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
    if (character.className && typeof character.className === 'string') 
      return character.className;
    
    if (character.class && typeof character.class === 'string') 
      return character.class;
      
    return '—';
  };

  // Функция для форматирования уровня персонажа
  const getCharacterLevel = (character: Character): string => {
    const level = character.level;
    if (!level && level !== 0) return '1'; // По умолчанию 1 уровень
    return String(level);
  };

  // Если нет персонажей, показываем сообщение
  if (!characters || characters.length === 0) {
    console.log('CharactersTable: Нет персонажей для отображения');
    return (
      <Card className="bg-black/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Список персонажей</CardTitle>
          <CardDescription>У вас пока нет персонажей</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Создайте своего первого персонажа, нажав на кнопку выше</p>
        </CardContent>
      </Card>
    );
  }

  // Дополнительная проверка на структуру данных
  console.log('CharactersTable: Рендеринг', characters.length, 'персонажей', 
    characters.map(c => 
      `id: ${c.id}, name: ${c.name}, class: ${getCharacterClass(c)}`
    ).join('; ')
  );

  return (
    <Card className="bg-black/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Список персонажей</CardTitle>
        <CardDescription>Всего персонажей: {characters.length}</CardDescription>
      </CardHeader>
      <CardContent>
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
            {characters.map((character) => {
              // Проверка наличия ID у персонажа
              if (!character.id) {
                console.warn('CharactersTable: Персонаж без ID', character);
                return null;
              }
              
              return (
                <TableRow key={character.id}>
                  <TableCell className="font-medium text-primary">
                    {character.name || 'Без имени'}
                  </TableCell>
                  <TableCell>{getCharacterClass(character)}</TableCell>
                  <TableCell>{character.race || '—'}</TableCell>
                  <TableCell>{getCharacterLevel(character)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewCharacter(character.id!)}
                      title="Открыть"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/character/${character.id}`)}
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
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CharactersTable;
