
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
import { CharacterSheet } from '@/types/character';
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

  // Создаем нужную часть CharacterSheet для CharacterBackground
  const backgroundCharacterData = {
    background: character.background || '',
    backstory: character.backstory || '',
    personalityTraits: character.personalityTraits || '',
    ideals: character.ideals || '',
    bonds: character.bonds || '',
    flaws: character.flaws || ''
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
              nextStep={nextStep} 
              character={character} 
              updateCharacter={updateCharacter} 
            />
          </TabsContent>
          
          <TabsContent value="1">
            <CharacterAbilities 
              prevStep={prevStep} 
              nextStep={nextStep} 
              character={character} 
              updateCharacter={updateCharacter} 
            />
          </TabsContent>
          
          <TabsContent value="2">
            <CharacterClass 
              prevStep={prevStep} 
              nextStep={nextStep} 
              character={character} 
              updateCharacter={updateCharacter} 
            />
          </TabsContent>
          
          <TabsContent value="3">
            <CharacterBackground prevStep={prevStep} nextStep={nextStep} />
          </TabsContent>
          
          <TabsContent value="4">
            <CharacterSpellSelection 
              prevStep={prevStep} 
              nextStep={nextStep} 
              character={character} 
              updateCharacter={updateCharacter} 
            />
          </TabsContent>
          
          <TabsContent value="5">
            <CharacterEquipment 
              prevStep={prevStep} 
              nextStep={nextStep} 
              character={character} 
              updateCharacter={updateCharacter} 
            />
          </TabsContent>
          
          <TabsContent value="6">
            <CharacterReview 
              prevStep={prevStep} 
              character={character} 
              updateCharacter={updateCharacter} 
              onSave={handleSave}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CharacterCreationContent;
