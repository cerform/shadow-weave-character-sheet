
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useCharacter } from '@/contexts/CharacterContext';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Character } from '@/types/character';

const CharacterReview: React.FC = () => {
  const { character, saveCharacter } = useCharacter();
  const { characterData } = useCharacterCreation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [characterId, setCharacterId] = useState<string>('');
  const [savedCharacter, setSavedCharacter] = useState<Character | null>(null);

  const handleSaveCharacter = async () => {
    if (!characterData) {
      toast({
        title: "Ошибка сохранения",
        description: "Отсутствуют данные персонажа"
      });
      return;
    }

    try {
      setSaving(true);
      // Сохраняем персонажа в базу данных
      const id = await saveCharacter(characterData);
      setCharacterId(id);
      setSavedCharacter(characterData);

      toast({
        title: "Персонаж создан!",
        description: "Ваш персонаж был успешно сохранен."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка при создании персонажа",
        description: "Произошла ошибка при сохранении персонажа."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleViewCharacter = () => {
    if (characterId && savedCharacter) {
      navigate(`/character/${characterId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Обзор персонажа</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Основная информация</h3>
            <div className="space-y-2">
              <p><strong>Имя:</strong> {characterData?.name}</p>
              <p><strong>Раса:</strong> {characterData?.race}</p>
              <p><strong>Подраса:</strong> {characterData?.subrace || '—'}</p>
              <p><strong>Класс:</strong> {characterData?.class}</p>
              <p><strong>Подкласс:</strong> {characterData?.subclass || '—'}</p>
              <p><strong>Уровень:</strong> {characterData?.level}</p>
              <p><strong>Предыстория:</strong> {characterData?.background || '—'}</p>
              <p><strong>Мировоззрение:</strong> {characterData?.alignment || '—'}</p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Характеристики</h3>
            <div className="space-y-2">
              <p><strong>Сила:</strong> {characterData?.abilities?.STR}</p>
              <p><strong>Ловкость:</strong> {characterData?.abilities?.DEX}</p>
              <p><strong>Телосложение:</strong> {characterData?.abilities?.CON}</p>
              <p><strong>Интеллект:</strong> {characterData?.abilities?.INT}</p>
              <p><strong>Мудрость:</strong> {characterData?.abilities?.WIS}</p>
              <p><strong>Харизма:</strong> {characterData?.abilities?.CHA}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Здоровье</h3>
          <p><strong>Максимальные хиты:</strong> {characterData?.hitPoints?.maximum}</p>
        </div>

        <div className="mt-6 space-y-2">
          <h3 className="text-xl font-semibold mb-2">Особенности и умения</h3>
          <ul className="list-disc pl-5">
            {Array.isArray(characterData?.features) && characterData.features.map((feature, index) => (
              <li key={index}>
                {typeof feature === 'string' ? feature : `${feature.name} (${feature.source})`}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex gap-4 justify-end">
          {!characterId ? (
            <Button 
              onClick={handleSaveCharacter} 
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Завершить создание'}
            </Button>
          ) : (
            <Button onClick={handleViewCharacter}>
              Перейти к листу персонажа
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterReview;
