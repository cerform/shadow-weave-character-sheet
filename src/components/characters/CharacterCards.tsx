
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, UserPlus } from "lucide-react";
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { createTestCharacter } from '@/services/characterService';
import InfoMessage from '@/components/ui/InfoMessage';

interface CharacterCardsProps {
  characters: Character[];
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

const CharacterCards: React.FC<CharacterCardsProps> = ({ characters, onDelete, loading = false }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [creatingTest, setCreatingTest] = useState(false);
  
  // Отладочный вывод
  console.log("CharacterCards: получены персонажи:", characters);
  console.log("CharacterCards: тип данных:", typeof characters);
  console.log("CharacterCards: это массив?", Array.isArray(characters));
  
  // Функция создания тестового персонажа
  const handleCreateTestCharacter = async () => {
    try {
      setCreatingTest(true);
      const newCharId = await createTestCharacter();
      toast.success('Тестовый персонаж создан успешно');
      console.log('Создан тестовый персонаж с ID:', newCharId);
      // Обновляем список персонажей после создания
      window.location.reload();
    } catch (err) {
      console.error('Ошибка при создании тестового персонажа:', err);
      toast.error('Не удалось создать тестового персонажа');
    } finally {
      setCreatingTest(false);
    }
  };
  
  // Показываем плейсхолдер при загрузке
  if (loading) {
    return (
      <div className="text-center p-10 bg-black/20 rounded-lg animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Загрузка персонажей...</p>
      </div>
    );
  }

  // Проверяем наличие данных персонажей
  if (!characters) {
    console.error('CharacterCards: Получен null или undefined вместо массива персонажей');
    return (
      <InfoMessage
        variant="error"
        title="Ошибка при загрузке"
        message="Не удалось загрузить данные персонажей"
      />
    );
  }
  
  // Если не массив
  if (!Array.isArray(characters)) {
    console.error('CharacterCards: Получен не массив:', typeof characters);
    return (
      <InfoMessage
        variant="error"
        title="Ошибка данных"
        message="Неверный формат данных персонажей"
      />
    );
  }

  // Если нет персонажей, показываем отладочное сообщение
  if (characters.length === 0) {
    return (
      <div className="p-6 bg-black/20 rounded-lg text-center">
        <p style={{ color: "white" }}>Нет персонажей</p>
        
        {/* Кнопка для создания тестового персонажа */}
        <div className="mt-8">
          <Button
            onClick={handleCreateTestCharacter}
            disabled={creatingTest}
            className="gap-2"
          >
            {creatingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus size={16} />}
            Создать тестового персонажа
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            Для отладки: создать тестового персонажа с базовыми данными
          </p>
        </div>
      </div>
    );
  }
  
  // Если есть персонажи - показываем простой отладочный список
  return (
    <div style={{ padding: 20 }} className="bg-black/20 rounded-lg">
      <h2 style={{ color: "white" }} className="mb-4">Список персонажей ({characters.length}):</h2>
      <ul>
        {characters.map((char) => (
          <li 
            key={char.id || 'unknown'} 
            style={{ color: "lime", marginBottom: 10 }}
            onClick={() => navigate(`/character/${char.id}`)}
            className="cursor-pointer hover:text-green-300 transition-colors"
          >
            {char.name || 'Безымянный'} — {char.class || char.className || 'Без класса'}
            {char.level ? ` (${char.level} уровень)` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CharacterCards;
