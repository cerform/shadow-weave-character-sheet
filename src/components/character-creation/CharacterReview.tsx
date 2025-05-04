
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Save } from 'lucide-react';
import { CharacterSheet } from '@/types/character';
import { useNavigate } from 'react-router-dom';
import characterService from '@/services/characterService';

interface Props {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  prevStep: () => void;
  setCurrentStep: (step: number) => void;
}

const CharacterReview: React.FC<Props> = ({ character, prevStep, updateCharacter, setCurrentStep }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Конвертируем заклинания в строки для отображения
  const formatSpells = (spells: CharacterSheet['spells'] | string[]): JSX.Element => {
    if (!spells || spells.length === 0) return <span className="text-muted-foreground">Нет выбранных заклинаний</span>;
    
    return (
      <div className="space-y-1">
        {spells.map((spell, index) => {
          // Проверяем тип spell и преобразуем в строку
          const spellName = typeof spell === 'string' 
            ? spell 
            : spell.name;
          
          return (
            <div key={index} className="text-sm">
              {spellName}
            </div>
          );
        })}
      </div>
    );
  };

  // Функция для сохранения персонажа
  const handleSaveCharacter = async () => {
    try {
      // Убеждаемся, что все обязательные поля заполнены
      if (!character.name) {
        toast({
          title: "Ошибка",
          description: "Имя персонажа должно быть заполнено",
          variant: "destructive"
        });
        setCurrentStep(7); // Переход к шагу деталей персонажа
        return;
      }

      // Сохраняем персонажа
      const result = await characterService.saveCharacter(character);
      
      toast({
        title: "Успешно",
        description: "Персонаж успешно сохранен",
        variant: "default"
      });

      // Перенаправляем на страницу просмотра персонажа
      navigate(`/character-sheet/${result.id}`);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить персонажа",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Основные характеристики</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">Имя: {character.name}</div>
              <div className="text-sm">Класс: {character.class || character.className}</div>
              <div className="text-sm">Раса: {character.race}</div>
              <div className="text-sm">Уровень: {character.level}</div>
              <div className="text-sm">Мировоззрение: {character.alignment}</div>
              <div className="text-sm">Предыстория: {character.background}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Характеристики</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">Сила: {character.abilities?.strength || character.abilities?.STR}</div>
              <div className="text-sm">Ловкость: {character.abilities?.dexterity || character.abilities?.DEX}</div>
              <div className="text-sm">Телосложение: {character.abilities?.constitution || character.abilities?.CON}</div>
              <div className="text-sm">Интеллект: {character.abilities?.intelligence || character.abilities?.INT}</div>
              <div className="text-sm">Мудрость: {character.abilities?.wisdom || character.abilities?.WIS}</div>
              <div className="text-sm">Харизма: {character.abilities?.charisma || character.abilities?.CHA}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Заклинания</CardTitle>
            </CardHeader>
            <CardContent>
              {formatSpells(character.spells || [])}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Снаряжение</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {character.equipment && character.equipment.length > 0 ? (
                character.equipment.map((item, index) => (
                  <div key={index} className="text-sm">{item}</div>
                ))
              ) : (
                <span className="text-muted-foreground">Нет выбранного снаряжения</span>
              )}
            </CardContent>
          </Card>
        </div>
        
        {character.backstory && (
          <Card>
            <CardHeader>
              <CardTitle>Предыстория персонажа</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{character.backstory}</p>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-between pt-8">
          <Button 
            variant="outline" 
            onClick={prevStep}
            className="bg-black/70 text-white hover:bg-gray-800 border-gray-700 hover:border-gray-500"
          >
            Назад
          </Button>
          
          <Button 
            variant="default" 
            onClick={handleSaveCharacter}
            className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Сохранить персонажа
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CharacterReview;
