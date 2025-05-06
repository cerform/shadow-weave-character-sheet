
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Character } from '@/types/character';
import { BadgeCheck, User, Book, Star, Scroll, Flag, Dna } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
}

const CharacterCard = ({ character, onClick }: CharacterCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (character.id) {
      // Сохраняем ID последнего выбранного персонажа
      localStorage.setItem('last-selected-character', character.id);
      navigate(`/character/${character.id}`);
    }
  };

  // Безопасное получение названия класса
  const getClassName = (): string => {
    if (character.className && typeof character.className === 'string') 
      return character.className;
    if (character.class && typeof character.class === 'string') 
      return character.class;
    return '—';
  };

  // Безопасное получение имени персонажа
  const getCharacterName = (): string => {
    return character.name || 'Безымянный герой';
  };

  // Функция для форматирования относительной даты
  const getRelativeDate = (dateString?: string) => {
    if (!dateString) return 'Нет даты';
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ru
      });
    } catch (e) {
      return 'Некорректная дата';
    }
  };

  return (
    <Card 
      className="bg-gradient-to-br from-gray-800 to-black text-white hover:scale-[1.02] transition cursor-pointer border border-primary/20"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span className="text-primary flex items-center gap-1.5 truncate" title={getCharacterName()}>
            <User size={16} />
            {getCharacterName()}
          </span>
          <span className="text-xs bg-primary/20 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
            <Star size={14} className="text-amber-400" />
            {character.level || 1}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Book size={16} className="text-blue-400 flex-shrink-0" />
          <span className="truncate" title={getClassName()}>
            Класс: {getClassName()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Dna size={16} className="text-green-400 flex-shrink-0" />
          <span className="truncate" title={character.race || '—'}>
            Раса: {character.race || '—'}{character.subrace ? ` (${character.subrace})` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Scroll size={16} className="text-amber-400 flex-shrink-0" />
          <span className="truncate" title={character.background || '—'}>
            Предыстория: {character.background || '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Flag size={16} className="text-red-400 flex-shrink-0" />
          <span className="truncate" title={character.alignment || '—'}>
            Мировоззрение: {character.alignment || '—'}
          </span>
        </div>
        {character.subclass && (
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} className="text-purple-400 flex-shrink-0" />
            <span className="truncate" title={character.subclass}>
              Архетип: {character.subclass}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-between border-t border-primary/10 pt-3">
        <span title={`Обновлен: ${character.updatedAt}`}>
          Обновлен: {getRelativeDate(character.updatedAt)}
        </span>
        <span title={`Создан: ${character.createdAt}`}>
          Создан: {getRelativeDate(character.createdAt)}
        </span>
      </CardFooter>
    </Card>
  );
};

export default CharacterCard;
