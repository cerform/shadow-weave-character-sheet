import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCharacter } from '@/contexts/CharacterContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Check, Download, Eye, Save } from 'lucide-react';
import { saveCharacterToFirestore } from '@/services/characterService';
import { getCurrentUid } from '@/utils/authHelpers';
import NavigationButtons from './NavigationButtons';

interface CharacterReviewProps {
  character: Character;
  prevStep: () => void;
  updateCharacter: (updates: Partial<Character>) => void;
  setCurrentStep: (step: number) => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({ character, prevStep, updateCharacter, setCurrentStep }) => {
  const { saveCurrentCharacter, setCharacter } = useCharacter();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [characterId, setCharacterId] = useState<string | null>(null);

  // Автоматическое сохранение персонажа при попадании на экран завершения
  useEffect(() => {
    const autoSaveCharacter = async () => {
      if (!autoSaved && character.name && character.race && character.class) {
        try {
          setIsSaving(true);
          const uid = getCurrentUid();
          
          if (!uid) {
            toast.error('Необходимо войти для сохранения персонажа');
            return;
          }
          
          // Убедимся, что userId установлен перед сохранением
          if (!character.userId) {
            updateCharacter({ userId: uid });
          }
          
          const savedId = await saveCharacterToFirestore(character, uid);
          
          if (savedId) {
            console.log('✅ Персонаж автоматически сохранен с ID:', savedId);
            setCharacterId(savedId);
            updateCharacter({ id: savedId });
            setAutoSaved(true);
            
            toast.success('Персонаж успешно сохранен!');
            
            // Также обновляем персонажа в контексте
            setCharacter({...character, id: savedId, userId: uid});
            
            // Сохраняем персонажа локально как резервную копию
            localStorage.setItem(`character_${savedId}`, JSON.stringify({...character, id: savedId, userId: uid}));
            localStorage.setItem('last-selected-character', savedId);
          }
        } catch (error) {
          console.error('❌ Ошибка при автосохранении персонажа:', error);
          toast.error('Не удалось автоматически сохранить персонажа');
        } finally {
          setIsSaving(false);
        }
      }
    };
    
    autoSaveCharacter();
  }, [character, autoSaved, updateCharacter, setCharacter]);

  const handleSaveCharacter = async () => {
    try {
      setIsSaving(true);
      
      const uid = getCurrentUid();
      if (!uid) {
        toast.error('Необходимо войти для сохранения персонажа');
        return;
      }
      
      // Обновляем userId перед сохранением
      const characterToSave = { ...character, userId: uid };
      
      // Сначала устанавливаем персонажа в контексте
      setCharacter(characterToSave);
      
      // Затем сохраняем персонажа
      await saveCurrentCharacter();
      
      toast.success('Персонаж успешно сохранен');
      
      // Предлагаем перейти в режим OBS для дальнейшего использования
      navigate('/sheet?view=obs');
    } catch (error) {
      console.error('Ошибка при сохранении персонажа:', error);
      toast.error('Не удалось сохранить персонажа');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewCharacter = () => {
    if (characterId) {
      navigate(`/character/${characterId}`);
    } else if (character.id) {
      navigate(`/character/${character.id}`);
    } else {
      navigate('/characters');
    }
  };

  const exportCharacter = () => {
    const characterData = JSON.stringify(character, null, 2);
    const blob = new Blob([characterData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name || 'character'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Персонаж экспортирован в JSON файл');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Завершение создания персонажа</h2>
        <p className="text-muted-foreground mt-2">
          {autoSaved ? 
            'Ваш персонаж успешно сохранен! Теперь вы можете продолжить работу с ним.' : 
            'Проверьте информацию о персонаже перед сохранением'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Имя:</dt>
              <dd className="font-medium">{character.name || 'Не указано'}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Раса:</dt>
              <dd className="font-medium">{character.race} {character.subrace ? `(${character.subrace})` : ''}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Класс:</dt>
              <dd className="font-medium">{character.className || character.class} {character.subclass ? `(${character.subclass})` : ''}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Уровень:</dt>
              <dd className="font-medium">{character.level}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Предыстория:</dt>
              <dd className="font-medium">{character.background || 'Не указана'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Характеристики</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-black/30 p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">СИЛ</div>
              <div className="text-xl font-bold">{character.abilities?.strength || character.strength || '-'}</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">ЛОВ</div>
              <div className="text-xl font-bold">{character.abilities?.dexterity || character.dexterity || '-'}</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">ТЕЛ</div>
              <div className="text-xl font-bold">{character.abilities?.constitution || character.constitution || '-'}</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">ИНТ</div>
              <div className="text-xl font-bold">{character.abilities?.intelligence || character.intelligence || '-'}</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">МДР</div>
              <div className="text-xl font-bold">{character.abilities?.wisdom || character.wisdom || '-'}</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">ХАР</div>
              <div className="text-xl font-bold">{character.abilities?.charisma || character.charisma || '-'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col space-y-4">
        {autoSaved ? (
          <Button 
            onClick={handleViewCharacter} 
            className="bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2"
          >
            <Eye className="h-5 w-5" />
            Открыть лист персонажа
          </Button>
        ) : (
          <Button 
            onClick={handleSaveCharacter} 
            className="bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2"
            disabled={isSaving}
          >
            <Save className="h-5 w-5" />
            {isSaving ? 'Сохранение...' : 'Принудительно сохранить персонажа'}
          </Button>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={handleViewCharacter}
            className="flex items-center gap-2"
          >
            <Eye className="h-5 w-5" />
            {autoSaved ? 'Открыть в режиме OBS' : 'Открыть лист персонажа'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={exportCharacter}
            className="flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Экспортировать в JSON
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Вернуться назад
        </Button>
      </div>
    </div>
  );
};

export default CharacterReview;
