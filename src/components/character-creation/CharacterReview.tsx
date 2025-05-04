
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CharacterSheet } from '@/types/character.d';
import NavigationButtons from './NavigationButtons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Save, Eye } from 'lucide-react';

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
      // Здесь должна быть логика сохранения персонажа в базу данных
      // Для демонстрации будем считать, что персонаж сохраняется с id
      const savedCharacterId = character.id || 'new-character-id';
      
      toast({
        title: "Персонаж создан",
        description: `${character.name} теперь готов к приключениям!`,
      });
      
      // Переходим к списку персонажей с небольшой задержкой
      setTimeout(() => {
        navigate('/characters');
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

  // Функция для просмотра персонажа (временное решение)
  const viewCharacter = () => {
    // Если у персонажа есть ID, переходим к его просмотру
    if (character.id) {
      navigate(`/character/${character.id}`);
    } else {
      toast({
        title: "Персонаж не сохранен",
        description: "Сначала сохраните персонажа, чтобы просмотреть его лист.",
        variant: "destructive"  // Changed from "warning" to "destructive"
      });
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
        
        {character.id && (
          <Button 
            onClick={viewCharacter}
            variant="outline"
            className="ml-4 bg-primary/10 border-primary/20 hover:bg-primary/20"
            style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}
          >
            <Eye className="mr-2 size-4" />
            Просмотр листа персонажа
          </Button>
        )}
      </div>
    </div>
  );
};

export default CharacterReview;
