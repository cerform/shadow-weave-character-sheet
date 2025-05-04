
import React from 'react';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CharacterBasics from './CharacterBasics';
import CharacterAbilities from './CharacterAbilities';
import CharacterClass from './CharacterClass';
import CharacterBackground from './CharacterBackground';
import CharacterSpellSelection from './CharacterSpellSelection';
import CharacterEquipment from './CharacterEquipment';
import CharacterReview from './CharacterReview';
import { useToast } from '@/hooks/use-toast';

const CharacterCreationContent: React.FC = () => {
  const { character, activeStep, setActiveStep, updateCharacter, saveCharacter } = useCharacterCreation();
  const { toast } = useToast();

  // Verify if we can navigate to a certain step
  const canNavigate = (step: number) => {
    if (step === 0) return true;
    
    if (step === 1) {
      return !!character.name && !!character.race;
    }
    
    if (step === 2) {
      return !!character.name && !!character.race && 
        !!character.abilities?.strength && !!character.abilities?.dexterity &&
        !!character.abilities?.constitution && !!character.abilities?.intelligence &&
        !!character.abilities?.wisdom && !!character.abilities?.charisma;
    }
    
    if (step === 3) {
      return !!character.name && !!character.race && !!character.class;
    }
    
    return false;
  };

  const handleSave = async () => {
    try {
      await saveCharacter();
      
      toast({
        title: "Персонаж сохранен",
        description: `${character.name} был успешно сохранен.`,
      });
      
      // Redirect to character list or character sheet
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить персонажа. Попробуйте еще раз.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (activeStep < 6) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Создаем объект с базовыми данными для CharacterBackground
  const backgroundCharacter = {
    background: character.background || '',
    backstory: character.backstory || '',
    personalityTraits: character.personalityTraits || '',
    ideals: character.ideals || '',
    bonds: character.bonds || '',
    flaws: character.flaws || ''
  };

  // Необходимо создать объект, который соответствует требованиям CharacterSheet
  // но мы знаем, что мы используем только часть полей в процессе создания
  const characterForCreation = {
    ...character,
    name: character.name || '',  // Установим дефолтное значение для обязательного поля
    level: character.level || 1,
    background: character.background || '',  // Установим дефолтное значение для обязательного поля
    backstory: character.backstory || '',  // Установим дефолтное значение для обязательного поля
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Создание персонажа</span>
          <Button onClick={handleSave}>Сохранить</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeStep.toString()} onValueChange={(v) => setActiveStep(parseInt(v))}>
          <TabsList className="grid grid-cols-7 mb-8">
            <TabsTrigger value="0" disabled={!canNavigate(0)}>Основы</TabsTrigger>
            <TabsTrigger value="1" disabled={!canNavigate(1)}>Характеристики</TabsTrigger>
            <TabsTrigger value="2" disabled={!canNavigate(2)}>Класс</TabsTrigger>
            <TabsTrigger value="3" disabled={!canNavigate(3)}>Предыстория</TabsTrigger>
            <TabsTrigger value="4" disabled={!canNavigate(3)}>Заклинания</TabsTrigger>
            <TabsTrigger value="5" disabled={!canNavigate(3)}>Снаряжение</TabsTrigger>
            <TabsTrigger value="6" disabled={!canNavigate(3)}>Обзор</TabsTrigger>
          </TabsList>
          
          <TabsContent value="0">
            <CharacterBasics 
              character={character} 
              updateCharacter={updateCharacter} 
              nextStep={nextStep}
            />
          </TabsContent>
          
          <TabsContent value="1">
            <CharacterAbilities 
              character={character} 
              updateCharacter={updateCharacter} 
              prevStep={prevStep} 
              nextStep={nextStep}
            />
          </TabsContent>
          
          <TabsContent value="2">
            <CharacterClass 
              character={character} 
              updateCharacter={updateCharacter} 
              prevStep={prevStep} 
              nextStep={nextStep}
            />
          </TabsContent>
          
          <TabsContent value="3">
            <CharacterBackground
              prevStep={prevStep} 
              nextStep={nextStep}
              character={backgroundCharacter}
              updateCharacter={updateCharacter}
            />
          </TabsContent>
          
          <TabsContent value="4">
            <CharacterSpellSelection 
              character={character} 
              updateCharacter={updateCharacter} 
              prevStep={prevStep} 
              nextStep={nextStep}
            />
          </TabsContent>
          
          <TabsContent value="5">
            <CharacterEquipment 
              character={character} 
              updateCharacter={updateCharacter} 
              prevStep={prevStep} 
              nextStep={nextStep}
            />
          </TabsContent>
          
          <TabsContent value="6">
            <CharacterReview 
              character={characterForCreation}
              updateCharacter={updateCharacter} 
              prevStep={prevStep} 
              onSave={handleSave}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CharacterCreationContent;
