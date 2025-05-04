
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCharacter } from '@/contexts/CharacterContext';
import { useToast } from '@/components/ui/use-toast';
import { CharacterSheet } from '@/types/character';
import { getModifierFromAbilityScore } from '@/utils/characterUtils';
import { convertToCharacter } from '@/utils/characterConverter';
import { Loader2, Award, Scroll, Sword, Shield } from 'lucide-react';

interface CharacterReviewProps {
  character: CharacterSheet;
  prevStep: () => void;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
}

const CharacterReview = ({ character, prevStep, updateCharacter }: CharacterReviewProps) => {
  const navigate = useNavigate();
  const { saveCurrentCharacter, setCharacter } = useCharacter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Преобразуем значение характеристики в модификатор
  const getModifier = (score: number): string => {
    const mod = getModifierFromAbilityScore(score);
    return mod;
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
      
      // Устанавливаем персонажа в контекст
      setCharacter(convertedCharacter);
      
      // Сохраняем персонажа
      await saveCurrentCharacter();
      
      toast({
        title: "Персонаж сохранен",
        description: `${character.name} успешно сохранен`,
      });
      
      // Перенаправляем на страницу списка персонажей
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
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Завершение создания персонажа</h2>
      <p className="text-gray-200 mb-6 text-center">
        Проверьте информацию о персонаже перед сохранением
      </p>
      
      <div className="space-y-8">
        {/* Основная информация с иконками */}
        <section className="bg-gray-900/60 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Award className="h-6 w-6 text-yellow-400 mr-2" />
            <h3 className="text-xl font-semibold text-white">Основная информация</h3>
          </div>
          <Separator className="mb-4 bg-gray-500" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p><span className="font-medium text-gray-300">Имя:</span> <span className="text-white font-semibold">{character.name || "Не указано"}</span></p>
              <p><span className="font-medium text-gray-300">Раса:</span> <span className="text-white">{character.race || "Не указана"}</span></p>
              {character.subrace && <p><span className="font-medium text-gray-300">Подраса:</span> <span className="text-white">{character.subrace}</span></p>}
              <p><span className="font-medium text-gray-300">Пол:</span> <span className="text-white">{character.gender || "Не указан"}</span></p>
              <p><span className="font-medium text-gray-300">Мировоззрение:</span> <span className="text-white">{character.alignment || "Не указано"}</span></p>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium text-gray-300">Класс:</span> <span className="text-white">{character.class || "Не указан"}</span></p>
              {character.subclass && <p><span className="font-medium text-gray-300">Подкласс:</span> <span className="text-white">{character.subclass}</span></p>}
              <p><span className="font-medium text-gray-300">Уровень:</span> <span className="text-white">{character.level || 1}</span></p>
              <p><span className="font-medium text-gray-300">Предыстория:</span> <span className="text-white">{character.background || "Не указана"}</span></p>
            </div>
          </div>
        </section>
        
        {/* Характеристики с иконкой */}
        <section className="bg-gray-900/60 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-blue-400 mr-2" />
            <h3 className="text-xl font-semibold text-white">Характеристики</h3>
          </div>
          <Separator className="mb-4 bg-gray-500" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-md text-center shadow-lg border border-gray-700">
              <p className="text-sm text-blue-300 uppercase tracking-wider">Сила</p>
              <p className="text-2xl font-bold text-white mt-1">{character.abilities.strength}</p>
              <p className="text-sm font-medium text-green-400 mt-1">{getModifier(character.abilities.strength)}</p>
            </div>
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-md text-center shadow-lg border border-gray-700">
              <p className="text-sm text-blue-300 uppercase tracking-wider">Ловкость</p>
              <p className="text-2xl font-bold text-white mt-1">{character.abilities.dexterity}</p>
              <p className="text-sm font-medium text-green-400 mt-1">{getModifier(character.abilities.dexterity)}</p>
            </div>
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-md text-center shadow-lg border border-gray-700">
              <p className="text-sm text-blue-300 uppercase tracking-wider">Телосложение</p>
              <p className="text-2xl font-bold text-white mt-1">{character.abilities.constitution}</p>
              <p className="text-sm font-medium text-green-400 mt-1">{getModifier(character.abilities.constitution)}</p>
            </div>
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-md text-center shadow-lg border border-gray-700">
              <p className="text-sm text-blue-300 uppercase tracking-wider">Интеллект</p>
              <p className="text-2xl font-bold text-white mt-1">{character.abilities.intelligence}</p>
              <p className="text-sm font-medium text-green-400 mt-1">{getModifier(character.abilities.intelligence)}</p>
            </div>
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-md text-center shadow-lg border border-gray-700">
              <p className="text-sm text-blue-300 uppercase tracking-wider">Мудрость</p>
              <p className="text-2xl font-bold text-white mt-1">{character.abilities.wisdom}</p>
              <p className="text-sm font-medium text-green-400 mt-1">{getModifier(character.abilities.wisdom)}</p>
            </div>
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-md text-center shadow-lg border border-gray-700">
              <p className="text-sm text-blue-300 uppercase tracking-wider">Харизма</p>
              <p className="text-2xl font-bold text-white mt-1">{character.abilities.charisma}</p>
              <p className="text-sm font-medium text-green-400 mt-1">{getModifier(character.abilities.charisma)}</p>
            </div>
          </div>
        </section>
        
        {/* Навыки и владения с иконкой */}
        {character.proficiencies && character.proficiencies.length > 0 && (
          <section className="bg-gray-900/60 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Sword className="h-6 w-6 text-red-400 mr-2" />
              <h3 className="text-xl font-semibold text-white">Владения</h3>
            </div>
            <Separator className="mb-4 bg-gray-500" />
            <div className="flex flex-wrap gap-2">
              {character.proficiencies.map((prof, index) => (
                <span key={index} className="bg-blue-900/60 text-white px-3 py-1.5 rounded-full text-sm border border-blue-700 shadow-sm">
                  {prof}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Языки с иконкой */}
        {character.languages && character.languages.length > 0 && (
          <section className="bg-gray-900/60 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Scroll className="h-6 w-6 text-cyan-400 mr-2" />
              <h3 className="text-xl font-semibold text-white">Языки</h3>
            </div>
            <Separator className="mb-4 bg-gray-500" />
            <div className="flex flex-wrap gap-2">
              {character.languages.map((lang, index) => (
                <span key={index} className="bg-cyan-900/60 text-white px-3 py-1.5 rounded-full text-sm border border-cyan-700 shadow-sm">
                  {lang}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Снаряжение с иконкой */}
        {character.equipment && character.equipment.length > 0 && (
          <section className="bg-gray-900/60 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-orange-400 mr-2" />
              <h3 className="text-xl font-semibold text-white">Снаряжение</h3>
            </div>
            <Separator className="mb-4 bg-gray-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {character.equipment.map((item, index) => (
                <span key={index} className="bg-gray-800/80 text-white px-3 py-2 rounded text-sm border border-gray-700 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Заклинания с иконкой */}
        {character.spells && character.spells.length > 0 && (
          <section className="bg-gray-900/60 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Scroll className="h-6 w-6 text-purple-400 mr-2" />
              <h3 className="text-xl font-semibold text-white">Заклинания</h3>
            </div>
            <Separator className="mb-4 bg-gray-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {character.spells.map((spell, index) => (
                <span key={index} className="bg-purple-900/60 text-white px-3 py-2 rounded text-sm border border-purple-700 shadow-sm">
                  {spell}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Личные черты с иконкой */}
        {(character.personalityTraits || character.ideals || character.bonds || character.flaws) && (
          <section className="bg-gray-900/60 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Award className="h-6 w-6 text-purple-400 mr-2" />
              <h3 className="text-xl font-semibold text-white">Личностные черты</h3>
            </div>
            <Separator className="mb-4 bg-gray-500" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {character.personalityTraits && (
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                  <p className="font-medium text-yellow-300 mb-2">Черты характера:</p>
                  <p className="text-white">{character.personalityTraits}</p>
                </div>
              )}
              {character.ideals && (
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                  <p className="font-medium text-yellow-300 mb-2">Идеалы:</p>
                  <p className="text-white">{character.ideals}</p>
                </div>
              )}
              {character.bonds && (
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                  <p className="font-medium text-yellow-300 mb-2">Привязанности:</p>
                  <p className="text-white">{character.bonds}</p>
                </div>
              )}
              {character.flaws && (
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                  <p className="font-medium text-yellow-300 mb-2">Слабости:</p>
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
