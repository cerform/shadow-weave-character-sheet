
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CharacterSheet } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';
import { getModifierFromAbilityScore } from '@/utils/characterUtils';

interface CharacterReviewProps {
  character: CharacterSheet;
  prevStep: () => void;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  setCurrentStep: (step: number) => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({
  character,
  prevStep,
  updateCharacter,
  setCurrentStep,
}) => {
  const navigate = useNavigate();
  const { saveCurrentCharacter } = useCharacter();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveCharacter = async () => {
    setIsSaving(true);
    
    try {
      // Преобразуем abilities для соответствия формату AbilityScores в CharacterContext
      const formattedCharacter = {
        ...character,
        abilities: {
          STR: character.abilities.strength,
          DEX: character.abilities.dexterity,
          CON: character.abilities.constitution,
          INT: character.abilities.intelligence,
          WIS: character.abilities.wisdom,
          CHA: character.abilities.charisma,
          ...character.abilities
        }
      };
      
      // Обновляем персонажа с преобразованными характеристиками
      updateCharacter(formattedCharacter);

      // Добавляем небольшую задержку для обновления state перед сохранением
      setTimeout(async () => {
        await saveCurrentCharacter();
        toast.success("Персонаж успешно сохранен!");
        navigate('/sheet');
        setIsSaving(false);
      }, 100);
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      toast.error("Не удалось сохранить персонажа");
      setIsSaving(false);
    }
  };

  // Функция для перехода к определенному шагу
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">Обзор персонажа</h2>
        <p className="text-muted-foreground text-center">
          Проверьте все данные персонажа перед сохранением
        </p>
      </div>

      <ScrollArea className="h-[60vh] rounded-md border p-4">
        <div className="space-y-6">
          {/* Основные данные */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Основная информация</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Имя:</p>
                <p>{character.name || "Не указано"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Пол:</p>
                <p>{character.gender || "Не указано"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Раса:</p>
                <p>{character.race} {character.subrace ? `(${character.subrace})` : ""}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Класс:</p>
                <p>{character.class} {character.subclass ? `(${character.subclass})` : ""}, {character.level} уровень</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Мировоззрение:</p>
                <p>{character.alignment || "Не указано"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Предыстория:</p>
                <p>{character.background || "Не указано"}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => goToStep(7)} 
              className="mt-2"
            >
              Редактировать
            </Button>
          </Card>

          {/* Характеристики */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Характеристики</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-primary/10 p-3 rounded-lg text-center">
                <div className="text-xl font-bold">
                  {character.abilities.strength || 10}
                </div>
                <div className="text-xs text-muted-foreground mt-1">СИЛА</div>
                <div className="text-sm">
                  {getModifierFromAbilityScore(character.abilities.strength || 10)}
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg text-center">
                <div className="text-xl font-bold">
                  {character.abilities.dexterity || 10}
                </div>
                <div className="text-xs text-muted-foreground mt-1">ЛОВКОСТЬ</div>
                <div className="text-sm">
                  {getModifierFromAbilityScore(character.abilities.dexterity || 10)}
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg text-center">
                <div className="text-xl font-bold">
                  {character.abilities.constitution || 10}
                </div>
                <div className="text-xs text-muted-foreground mt-1">ТЕЛОСЛОЖЕНИЕ</div>
                <div className="text-sm">
                  {getModifierFromAbilityScore(character.abilities.constitution || 10)}
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg text-center">
                <div className="text-xl font-bold">
                  {character.abilities.intelligence || 10}
                </div>
                <div className="text-xs text-muted-foreground mt-1">ИНТЕЛЛЕКТ</div>
                <div className="text-sm">
                  {getModifierFromAbilityScore(character.abilities.intelligence || 10)}
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg text-center">
                <div className="text-xl font-bold">
                  {character.abilities.wisdom || 10}
                </div>
                <div className="text-xs text-muted-foreground mt-1">МУДРОСТЬ</div>
                <div className="text-sm">
                  {getModifierFromAbilityScore(character.abilities.wisdom || 10)}
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg text-center">
                <div className="text-xl font-bold">
                  {character.abilities.charisma || 10}
                </div>
                <div className="text-xs text-muted-foreground mt-1">ХАРИЗМА</div>
                <div className="text-sm">
                  {getModifierFromAbilityScore(character.abilities.charisma || 10)}
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => goToStep(3)} 
              className="mt-2"
            >
              Редактировать
            </Button>
          </Card>

          {/* Здоровье и боевые параметры */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Здоровье и боевые параметры</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Максимум здоровья:</p>
                <p>{character.maxHp || "Не указано"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Кость хитов:</p>
                <p>{character.hitDice?.value || `d${character.class === 'Волшебник' ? '6' : character.class === 'Варвар' ? '12' : '8'}`}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => goToStep(5)} 
              className="mt-2"
            >
              Редактировать
            </Button>
          </Card>

          {/* Снаряжение */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Снаряжение</h3>
            <div className="space-y-1">
              {character.equipment && character.equipment.length > 0 ? (
                character.equipment.map((item, index) => (
                  <Badge key={index} variant="outline" className="mr-1 mb-1">
                    {item}
                  </Badge>
                ))
              ) : (
                <p>Нет снаряжения</p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => goToStep(6)} 
              className="mt-2"
            >
              Редактировать
            </Button>
          </Card>

          {/* Заклинания, если это заклинатель */}
          {character.spells && character.spells.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Заклинания</h3>
              <div className="space-y-1">
                {character.spells.map((spell, index) => (
                  <Badge key={index} variant="outline" className="mr-1 mb-1">
                    {spell}
                  </Badge>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => goToStep(8)} 
                className="mt-2"
              >
                Редактировать
              </Button>
            </Card>
          )}

          {/* Особенности характера */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Особенности характера</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {character.personalityTraits && (
                <div>
                  <p className="text-sm text-muted-foreground">Черты характера:</p>
                  <p>{character.personalityTraits}</p>
                </div>
              )}
              {character.ideals && (
                <div>
                  <p className="text-sm text-muted-foreground">Идеалы:</p>
                  <p>{character.ideals}</p>
                </div>
              )}
              {character.bonds && (
                <div>
                  <p className="text-sm text-muted-foreground">Привязанности:</p>
                  <p>{character.bonds}</p>
                </div>
              )}
              {character.flaws && (
                <div>
                  <p className="text-sm text-muted-foreground">Слабости:</p>
                  <p>{character.flaws}</p>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => goToStep(4)} 
              className="mt-2"
            >
              Редактировать
            </Button>
          </Card>
        </div>
      </ScrollArea>

      <div className="flex justify-between pt-4">
        <Button onClick={prevStep} variant="outline">
          Назад
        </Button>
        <Button 
          onClick={handleSaveCharacter} 
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? "Сохранение..." : "Завершить создание"}
        </Button>
      </div>
    </div>
  );
};

export default CharacterReview;
