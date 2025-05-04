
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCharacterCreation } from "@/hooks/useCharacterCreation";
import { CharacterSheet } from '@/types/character';

// Импорт компонентов для шагов создания персонажа
import CharacterBasics from './CharacterBasics';
import CharacterAbilities from './CharacterAbilities';
import CharacterClass from './CharacterClass';
import CharacterBackground from './CharacterBackground';
import CharacterEquipment from './CharacterEquipment';

// Компонент для отображения шага создания персонажа
const CharacterCreationContent = () => {
  const { toast } = useToast();
  // Инициализация хука создания персонажа
  const { 
    character, 
    updateCharacter, 
    saveCharacter, 
    activeStep, 
    nextStep, 
    prevStep,
    resetCharacter
  } = useCharacterCreation();
  
  // Обработчик для сохранения персонажа
  const handleSaveCharacter = async () => {
    try {
      await saveCharacter();
      toast({
        title: "Персонаж сохранен",
        description: "Ваш персонаж успешно сохранен!"
      });
    } catch (error) {
      console.error("Ошибка при сохранении персонажа", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить персонажа",
        variant: "destructive"
      });
    }
  };
  
  // Отображение текущего шага создания персонажа
  const renderStep = () => {
    switch(activeStep) {
      case 0:
        return (
          <CharacterBasics 
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 1:
        return (
          <CharacterAbilities 
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 2:
        return (
          <CharacterClass 
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <CharacterBackground 
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <CharacterEquipment 
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        // Последний шаг - сводка по персонажу
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-center mb-4">Сводка персонажа</h1>
            
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">{character.name || "Безымянный"}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-medium">Базовая информация</h3>
                  <p>Класс: {character.className || character.class || "Не выбран"}</p>
                  <p>Уровень: {character.level || 1}</p>
                  <p>Раса: {character.race || "Не выбрана"}</p>
                  <p>Предыстория: {character.background || "Не выбрана"}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Характеристики</h3>
                  <p>СИЛ: {character.abilities?.STR || "-"}</p>
                  <p>ЛОВ: {character.abilities?.DEX || "-"}</p>
                  <p>ТЕЛ: {character.abilities?.CON || "-"}</p>
                  <p>ИНТ: {character.abilities?.INT || "-"}</p>
                  <p>МДР: {character.abilities?.WIS || "-"}</p>
                  <p>ХАР: {character.abilities?.CHA || "-"}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Снаряжение</h3>
                <div className="bg-primary-foreground/10 p-2 rounded-md">
                  {character.equipment && character.equipment.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {character.equipment.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Снаряжение не выбрано</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={prevStep}
                >
                  Назад
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline"
                    onClick={resetCharacter}
                  >
                    Сбросить
                  </Button>
                  <Button 
                    onClick={handleSaveCharacter}
                  >
                    Сохранить персонажа
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );
      default:
        return <div>Неизвестный шаг</div>;
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      {renderStep()}
    </div>
  );
};

export default CharacterCreationContent;
