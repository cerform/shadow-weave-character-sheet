
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CharacterSheet } from '@/types/character.d';
import NavigationButtons from './NavigationButtons';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Save, Eye } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/services/firebase';

interface CharacterReviewProps {
  character: CharacterSheet;
  prevStep: () => void;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({ character, prevStep, updateCharacter }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const [isSaving, setIsSaving] = useState(false);

  // Функция для сохранения персонажа в базу данных
  const saveCharacter = async () => {
    setIsSaving(true);
    try {
      // Присваиваем ID персонажу, если его нет
      const characterId = character.id || uuidv4();
      
      // Обновляем персонажа с ID
      if (!character.id) {
        updateCharacter({ id: characterId });
      }
      
      // Проверяем авторизацию
      const currentUser = auth.currentUser;
      console.log("Текущий пользователь:", currentUser ? currentUser.email : "Не авторизован");
      
      // Добавляем userId к персонажу, если пользователь авторизован
      if (currentUser) {
        console.log("Сохраняем персонажа для пользователя:", currentUser.uid);
        updateCharacter({ userId: currentUser.uid });
      } else {
        console.log("Пользователь не авторизован, сохраняем локально");
      }
      
      // Сохраняем в локальное хранилище
      const savedCharacters = localStorage.getItem('dnd-characters');
      let characters = savedCharacters ? JSON.parse(savedCharacters) : [];
      
      // Если персонаж с таким ID уже существует, заменяем его
      const existingIndex = characters.findIndex((c: any) => c.id === characterId);
      
      const characterWithTimestamp = {
        ...character, 
        id: characterId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        characters[existingIndex] = characterWithTimestamp;
      } else {
        characters.push(characterWithTimestamp);
      }
      
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
      localStorage.setItem('last-selected-character', characterId);
      
      console.log("Персонаж сохранен локально:", characterId);
      
      toast({
        title: "Персонаж создан",
        description: `${character.name} теперь готов к приключениям!`,
      });
      
      // Переходим к просмотру персонажа с небольшой задержкой
      setTimeout(() => {
        navigate('/character/' + characterId);
      }, 500);
      
    } catch (error) {
      console.error("Ошибка сохранения персонажа:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить персонажа. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Функция для просмотра персонажа
  const viewCharacter = () => {
    // Пробуем сначала сохранить персонажа, если у него нет ID
    if (!character.id) {
      saveCharacter();
    } else {
      // Если у персонажа есть ID, переходим к его просмотру
      navigate(`/character/${character.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Просмотр и завершение создания</h2>
      
      <div className="p-4 bg-primary/10 rounded-lg mb-6">
        <p className="text-sm">
          Проверьте созданного персонажа перед сохранением. После сохранения вы сможете просмотреть и отредактировать 
          его в разделе "Мои персонажи".
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Основная информация */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="text-lg font-semibold mb-3 border-b border-primary/10 pb-2">
            Основная информация
          </h3>
          <div className="space-y-2">
            <p><span className="font-medium">Имя:</span> {character.name || 'Не указано'}</p>
            <p><span className="font-medium">Раса:</span> {character.subrace ? `${character.race} (${character.subrace})` : character.race}</p>
            <p><span className="font-medium">Класс:</span> {character.subclass ? `${character.class} (${character.subclass})` : character.class}</p>
            <p><span className="font-medium">Предыстория:</span> {character.background || 'Не указана'}</p>
            <p><span className="font-medium">Мировоззрение:</span> {character.alignment || 'Не указано'}</p>
          </div>
        </div>
        
        {/* Характеристики */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="text-lg font-semibold mb-3 border-b border-primary/10 pb-2">
            Характеристики
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 text-center">
              <p className="font-medium">СИЛА</p>
              <p className="text-xl">{character.abilities?.strength}</p>
            </div>
            <div className="p-2 text-center">
              <p className="font-medium">ЛОВК</p>
              <p className="text-xl">{character.abilities?.dexterity}</p>
            </div>
            <div className="p-2 text-center">
              <p className="font-medium">ТЕЛО</p>
              <p className="text-xl">{character.abilities?.constitution}</p>
            </div>
            <div className="p-2 text-center">
              <p className="font-medium">ИНТЛ</p>
              <p className="text-xl">{character.abilities?.intelligence}</p>
            </div>
            <div className="p-2 text-center">
              <p className="font-medium">МУДР</p>
              <p className="text-xl">{character.abilities?.wisdom}</p>
            </div>
            <div className="p-2 text-center">
              <p className="font-medium">ХАРИЗ</p>
              <p className="text-xl">{character.abilities?.charisma}</p>
            </div>
          </div>
          <div className="mt-4">
            <p><span className="font-medium">Здоровье (HP):</span> {character.maxHp || 'Не рассчитано'}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <NavigationButtons
          allowNext={true}
          nextStep={saveCharacter}
          prevStep={prevStep}
          isFirstStep={false}
          nextLabel="Сохранить персонажа"
          isLastStep={true}
          disableNext={isSaving}
        />
        
        <Button 
          onClick={viewCharacter}
          variant="outline"
          className="ml-4 bg-primary/10 border-primary/20 hover:bg-primary/20"
          style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}
        >
          <Eye className="mr-2 size-4" />
          Просмотр листа персонажа
        </Button>
      </div>
    </div>
  );
};

export default CharacterReview;
