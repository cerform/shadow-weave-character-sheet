
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';

interface CharacterBasicsProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterBasics: React.FC<CharacterBasicsProps> = ({ 
  character, 
  onUpdate,
}) => {
  const [name, setName] = useState(character.name || '');
  const [gender, setGender] = useState(character.gender || '');
  const [alignment, setAlignment] = useState(character.alignment || '');
  
  // Получаем текущие стили темы
  const { themeStyles } = useTheme();
  
  // Мемоизируем стили для предотвращения мерцания
  const selectStyle = useMemo(() => ({
    color: themeStyles?.textColor || '#E3F2FD',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: `${themeStyles?.accent}50` || 'rgba(255, 255, 255, 0.1)'
  }), [themeStyles]);

  // Обработчик для автоматического сохранения данных при изменении
  const handleInputChange = (field: string, value: string) => {
    if (field === 'name') setName(value);
    if (field === 'gender') setGender(value);
    if (field === 'alignment') setAlignment(value);
    
    onUpdate({ [field]: value });
  };

  return (
    <div>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Имя персонажа</Label>
            <Input
              id="name"
              placeholder="Введите имя персонажа"
              value={name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Пол</Label>
            <select
              id="gender"
              className="w-full p-2 border rounded"
              style={selectStyle}
              value={gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <option value="">Выберите пол</option>
              <option value="Мужской">Мужской</option>
              <option value="Женский">Женский</option>
              <option value="Другое">Другое</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="alignment">Мировоззрение</Label>
            <select
              id="alignment"
              className="w-full p-2 border rounded"
              style={selectStyle}
              value={alignment}
              onChange={(e) => handleInputChange('alignment', e.target.value)}
            >
              <option value="">Выберите мировоззрение</option>
              <option value="Законопослушный Добрый">Законопослушный Добрый</option>
              <option value="Нейтральный Добрый">Нейтральный Добрый</option>
              <option value="Хаотичный Добрый">Хаотичный Добрый</option>
              <option value="Законопослушный Нейтральный">Законопослушный Нейтральный</option>
              <option value="Истинно Нейтральный">Истинно Нейтральный</option>
              <option value="Хаотичный Нейтральный">Хаотичный Нейтральный</option>
              <option value="Законопослушный Злой">Законопослушный Злой</option>
              <option value="Нейтральный Злой">Нейтральный Злой</option>
              <option value="Хаотичный Злой">Хаотичный Злой</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterBasics;
