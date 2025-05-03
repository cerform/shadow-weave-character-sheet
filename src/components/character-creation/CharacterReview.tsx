
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCharacter } from '@/contexts/CharacterContext';
import { useToast } from '@/components/ui/use-toast';
import { CharacterSheet } from '@/types/character';
import { getModifierFromAbilityScore } from '@/utils/characterUtils';
import { convertToCharacter } from '@/utils/characterConverter';
import { Loader2 } from 'lucide-react';

interface CharacterReviewProps {
  character: CharacterSheet;
  prevStep: () => void;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
}

const CharacterReview = ({ character, prevStep, updateCharacter }: CharacterReviewProps) => {
  const navigate = useNavigate();
  const { saveCharacter } = useCharacter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Преобразуем значение характеристики в модификатор
  const getModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Обработчик сохранения персонажа
  const handleSaveCharacter = async () => {
    if (!character.name) {
      toast({
        title: "Требуется имя персонажа",
        description: "Пожалуйста, вернитесь назад и укажите имя для вашего персонажа",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Преобразуем CharacterSheet в Character для сохранения
      const convertedCharacter = convertToCharacter(character);
      
      // Сохраняем персонажа
      const savedCharacter = await saveCharacter(convertedCharacter);
      
      toast({
        title: "Персонаж сохранен",
        description: `${character.name} успешно сохранен`,
      });
      
      // Перенаправляем на страницу с персонажами
      navigate('/characters');
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить персонажа. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-black/80 rounded-lg shadow-md max-w-4xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Проверка персонажа</h2>
      <p className="text-gray-200 mb-6 text-center">
        Проверьте информацию о персонаже перед сохранением
      </p>
      
      <div className="space-y-8">
        {/* Основная информация */}
        <section>
          <h3 className="text-xl font-semibold mb-2 text-white">Основная информация</h3>
          <Separator className="mb-4 bg-gray-500" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p><span className="font-medium text-gray-200">Имя:</span> <span className="text-white">{character.name || "Не указано"}</span></p>
              <p><span className="font-medium text-gray-200">Раса:</span> <span className="text-white">{character.race || "Не указана"}</span></p>
              {character.subrace && <p><span className="font-medium text-gray-200">Подраса:</span> <span className="text-white">{character.subrace}</span></p>}
              <p><span className="font-medium text-gray-200">Пол:</span> <span className="text-white">{character.gender || "Не указан"}</span></p>
              <p><span className="font-medium text-gray-200">Мировоззрение:</span> <span className="text-white">{character.alignment || "Не указано"}</span></p>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium text-gray-200">Класс:</span> <span className="text-white">{character.class || "Не указан"}</span></p>
              {character.subclass && <p><span className="font-medium text-gray-200">Подкласс:</span> <span className="text-white">{character.subclass}</span></p>}
              <p><span className="font-medium text-gray-200">Уровень:</span> <span className="text-white">{character.level || 1}</span></p>
              <p><span className="font-medium text-gray-200">Предыстория:</span> <span className="text-white">{character.background || "Не указана"}</span></p>
            </div>
          </div>
        </section>
        
        {/* Характеристики */}
        <section>
          <h3 className="text-xl font-semibold mb-2 text-white">Характеристики</h3>
          <Separator className="mb-4 bg-gray-500" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gray-900 p-3 rounded-md text-center">
              <p className="text-sm text-gray-300">Сила</p>
              <p className="text-2xl font-bold text-white">{character.abilities.strength}</p>
              <p className="text-sm text-white">{getModifier(character.abilities.strength)}</p>
            </div>
            <div className="bg-gray-900 p-3 rounded-md text-center">
              <p className="text-sm text-gray-300">Ловкость</p>
              <p className="text-2xl font-bold text-white">{character.abilities.dexterity}</p>
              <p className="text-sm text-white">{getModifier(character.abilities.dexterity)}</p>
            </div>
            <div className="bg-gray-900 p-3 rounded-md text-center">
              <p className="text-sm text-gray-300">Телосложение</p>
              <p className="text-2xl font-bold text-white">{character.abilities.constitution}</p>
              <p className="text-sm text-white">{getModifier(character.abilities.constitution)}</p>
            </div>
            <div className="bg-gray-900 p-3 rounded-md text-center">
              <p className="text-sm text-gray-300">Интеллект</p>
              <p className="text-2xl font-bold text-white">{character.abilities.intelligence}</p>
              <p className="text-sm text-white">{getModifier(character.abilities.intelligence)}</p>
            </div>
            <div className="bg-gray-900 p-3 rounded-md text-center">
              <p className="text-sm text-gray-300">Мудрость</p>
              <p className="text-2xl font-bold text-white">{character.abilities.wisdom}</p>
              <p className="text-sm text-white">{getModifier(character.abilities.wisdom)}</p>
            </div>
            <div className="bg-gray-900 p-3 rounded-md text-center">
              <p className="text-sm text-gray-300">Харизма</p>
              <p className="text-2xl font-bold text-white">{character.abilities.charisma}</p>
              <p className="text-sm text-white">{getModifier(character.abilities.charisma)}</p>
            </div>
          </div>
        </section>
        
        {/* Навыки и владения */}
        {character.proficiencies && character.proficiencies.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-2 text-white">Владения</h3>
            <Separator className="mb-4 bg-gray-500" />
            <div className="flex flex-wrap gap-2">
              {character.proficiencies.map((prof, index) => (
                <span key={index} className="bg-blue-900 text-white px-2 py-1 rounded text-sm">
                  {prof}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Языки */}
        {character.languages && character.languages.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-2 text-white">Языки</h3>
            <Separator className="mb-4 bg-gray-500" />
            <div className="flex flex-wrap gap-2">
              {character.languages.map((lang, index) => (
                <span key={index} className="bg-cyan-900 text-white px-2 py-1 rounded text-sm">
                  {lang}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Снаряжение */}
        {character.equipment && character.equipment.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-2 text-white">Снаряжение</h3>
            <Separator className="mb-4 bg-gray-500" />
            <div className="flex flex-wrap gap-2">
              {character.equipment.map((item, index) => (
                <span key={index} className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Заклинания */}
        {character.spells && character.spells.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-2 text-white">Заклинания</h3>
            <Separator className="mb-4 bg-gray-500" />
            <div className="flex flex-wrap gap-2">
              {character.spells.map((spell, index) => (
                <span key={index} className="bg-purple-900 text-white px-2 py-1 rounded text-sm">
                  {spell}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Личные черты */}
        {(character.personalityTraits || character.ideals || character.bonds || character.flaws) && (
          <section>
            <h3 className="text-xl font-semibold mb-2 text-white">Личностные черты</h3>
            <Separator className="mb-4 bg-gray-500" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {character.personalityTraits && (
                <div>
                  <p className="font-medium text-gray-200">Черты характера:</p>
                  <p className="text-white">{character.personalityTraits}</p>
                </div>
              )}
              {character.ideals && (
                <div>
                  <p className="font-medium text-gray-200">Идеалы:</p>
                  <p className="text-white">{character.ideals}</p>
                </div>
              )}
              {character.bonds && (
                <div>
                  <p className="font-medium text-gray-200">Привязанности:</p>
                  <p className="text-white">{character.bonds}</p>
                </div>
              )}
              {character.flaws && (
                <div>
                  <p className="font-medium text-gray-200">Слабости:</p>
                  <p className="text-white">{character.flaws}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={prevStep} className="text-white border-white hover:bg-gray-800">
          Назад
        </Button>
        <Button 
          onClick={handleSaveCharacter} 
          disabled={isSaving}
          className="flex gap-2 bg-green-700 hover:bg-green-800 text-white"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? 'Сохранение...' : 'Сохранить персонажа'}
        </Button>
      </div>
    </div>
  );
};

export default CharacterReview;
