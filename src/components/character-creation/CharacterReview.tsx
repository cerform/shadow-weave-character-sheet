
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
    <div className="p-6 bg-card rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Проверка персонажа</h2>
      <p className="text-muted-foreground mb-6 text-center">
        Проверьте информацию о персонаже перед сохранением
      </p>
      
      <div className="space-y-8">
        {/* Основная информация */}
        <section>
          <h3 className="text-xl font-semibold mb-2">Основная информация</h3>
          <Separator className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p><span className="font-medium">Имя:</span> {character.name || "Не указано"}</p>
              <p><span className="font-medium">Раса:</span> {character.race || "Не указана"}</p>
              {character.subrace && <p><span className="font-medium">Подраса:</span> {character.subrace}</p>}
              <p><span className="font-medium">Пол:</span> {character.gender || "Не указан"}</p>
              <p><span className="font-medium">Мировоззрение:</span> {character.alignment || "Не указано"}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Класс:</span> {character.class || "Не указан"}</p>
              {character.subclass && <p><span className="font-medium">Подкласс:</span> {character.subclass}</p>}
              <p><span className="font-medium">Уровень:</span> {character.level || 1}</p>
              <p><span className="font-medium">Предыстория:</span> {character.background || "Не указана"}</p>
            </div>
          </div>
        </section>
        
        {/* Характеристики */}
        <section>
          <h3 className="text-xl font-semibold mb-2">Характеристики</h3>
          <Separator className="mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-background p-3 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Сила</p>
              <p className="text-2xl font-bold">{character.abilities.strength}</p>
              <p className="text-sm">{getModifier(character.abilities.strength)}</p>
            </div>
            <div className="bg-background p-3 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Ловкость</p>
              <p className="text-2xl font-bold">{character.abilities.dexterity}</p>
              <p className="text-sm">{getModifier(character.abilities.dexterity)}</p>
            </div>
            <div className="bg-background p-3 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Телосложение</p>
              <p className="text-2xl font-bold">{character.abilities.constitution}</p>
              <p className="text-sm">{getModifier(character.abilities.constitution)}</p>
            </div>
            <div className="bg-background p-3 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Интеллект</p>
              <p className="text-2xl font-bold">{character.abilities.intelligence}</p>
              <p className="text-sm">{getModifier(character.abilities.intelligence)}</p>
            </div>
            <div className="bg-background p-3 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Мудрость</p>
              <p className="text-2xl font-bold">{character.abilities.wisdom}</p>
              <p className="text-sm">{getModifier(character.abilities.wisdom)}</p>
            </div>
            <div className="bg-background p-3 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Харизма</p>
              <p className="text-2xl font-bold">{character.abilities.charisma}</p>
              <p className="text-sm">{getModifier(character.abilities.charisma)}</p>
            </div>
          </div>
        </section>
        
        {/* Навыки и владения */}
        {character.proficiencies && character.proficiencies.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-2">Владения</h3>
            <Separator className="mb-4" />
            <div className="flex flex-wrap gap-2">
              {character.proficiencies.map((prof, index) => (
                <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  {prof}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Языки */}
        {character.languages && character.languages.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-2">Языки</h3>
            <Separator className="mb-4" />
            <div className="flex flex-wrap gap-2">
              {character.languages.map((lang, index) => (
                <span key={index} className="bg-secondary/10 text-secondary px-2 py-1 rounded text-sm">
                  {lang}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Снаряжение */}
        {character.equipment && character.equipment.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-2">Снаряжение</h3>
            <Separator className="mb-4" />
            <div className="flex flex-wrap gap-2">
              {character.equipment.map((item, index) => (
                <span key={index} className="bg-accent/10 text-accent-foreground px-2 py-1 rounded text-sm">
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Заклинания */}
        {character.spells && character.spells.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-2">Заклинания</h3>
            <Separator className="mb-4" />
            <div className="flex flex-wrap gap-2">
              {character.spells.map((spell, index) => (
                <span key={index} className="bg-destructive/10 text-destructive px-2 py-1 rounded text-sm">
                  {spell}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Личные черты */}
        {(character.personalityTraits || character.ideals || character.bonds || character.flaws) && (
          <section>
            <h3 className="text-xl font-semibold mb-2">Личностные черты</h3>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {character.personalityTraits && (
                <div>
                  <p className="font-medium">Черты характера:</p>
                  <p className="text-muted-foreground">{character.personalityTraits}</p>
                </div>
              )}
              {character.ideals && (
                <div>
                  <p className="font-medium">Идеалы:</p>
                  <p className="text-muted-foreground">{character.ideals}</p>
                </div>
              )}
              {character.bonds && (
                <div>
                  <p className="font-medium">Привязанности:</p>
                  <p className="text-muted-foreground">{character.bonds}</p>
                </div>
              )}
              {character.flaws && (
                <div>
                  <p className="font-medium">Слабости:</p>
                  <p className="text-muted-foreground">{character.flaws}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={prevStep}>
          Назад
        </Button>
        <Button 
          onClick={handleSaveCharacter} 
          disabled={isSaving}
          className="flex gap-2"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? 'Сохранение...' : 'Сохранить персонажа'}
        </Button>
      </div>
    </div>
  );
};

export default CharacterReview;
