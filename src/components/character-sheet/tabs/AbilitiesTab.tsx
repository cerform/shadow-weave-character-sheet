import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const [strength, setStrength] = useState(character.strength || 10);
  const [dexterity, setDexterity] = useState(character.dexterity || 10);
  const [constitution, setConstitution] = useState(character.constitution || 10);
  const [intelligence, setIntelligence] = useState(character.intelligence || 10);
  const [wisdom, setWisdom] = useState(character.wisdom || 10);
  const [charisma, setCharisma] = useState(character.charisma || 10);
  const [savingThrows, setSavingThrows] = useState<string[]>(
    character.savingThrows || []
  );
  const [skills, setSkills] = useState<string[]>(
    character.skills || []
  );
  const [expertise, setExpertise] = useState<string[]>(
    character.expertise || []
  );
  
  useEffect(() => {
    onUpdate({
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
      savingThrows,
      skills,
      expertise
    });
  }, [strength, dexterity, constitution, intelligence, wisdom, charisma, savingThrows, skills, expertise, onUpdate]);
  
  const abilityModifier = (abilityScore: number) => {
    return Math.floor((abilityScore - 10) / 2);
  };
  
  const handleSavingThrowChange = (ability: string) => {
    let newSavingThrows: string[] = [...savingThrows];
    
    if (newSavingThrows.includes(ability)) {
      newSavingThrows = newSavingThrows.filter(s => s !== ability);
    } else {
      newSavingThrows.push(ability);
    }
    
    setSavingThrows(newSavingThrows);
    onUpdate({ savingThrows: newSavingThrows });
  };
  
  const handleSkillChange = (skill: string) => {
    let newSkills: string[] = [...skills];
    
    if (newSkills.includes(skill)) {
      newSkills = newSkills.filter(s => s !== skill);
    } else {
      newSkills.push(skill);
    }
    
    setSkills(newSkills);
    onUpdate({ skills: newSkills });
  };
  
  const handleExpertiseChange = (skill: string) => {
    let newExpertise: string[] = [...expertise];
    
    if (newExpertise.includes(skill)) {
      newExpertise = newExpertise.filter(e => e !== skill);
    } else {
      newExpertise.push(skill);
    }
    
    setExpertise(newExpertise);
    onUpdate({ expertise: newExpertise });
  };
  
  const hasExpertise = (skill: string) => {
    return Array.isArray(expertise) && expertise.includes(skill);
  };
  
  return (
    <ScrollArea className="h-[65vh] pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Основные характеристики */}
        <Card>
          <CardHeader>
            <CardTitle>Характеристики</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="strength">Сила</Label>
              <Input
                type="number"
                id="strength"
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
              />
              <span>({abilityModifier(strength)})</span>
            </div>
            <div className="flex items-center space-x-4">
              <Label htmlFor="dexterity">Ловкость</Label>
              <Input
                type="number"
                id="dexterity"
                value={dexterity}
                onChange={(e) => setDexterity(Number(e.target.value))}
              />
              <span>({abilityModifier(dexterity)})</span>
            </div>
            <div className="flex items-center space-x-4">
              <Label htmlFor="constitution">Телосложение</Label>
              <Input
                type="number"
                id="constitution"
                value={constitution}
                onChange={(e) => setConstitution(Number(e.target.value))}
              />
              <span>({abilityModifier(constitution)})</span>
            </div>
            <div className="flex items-center space-x-4">
              <Label htmlFor="intelligence">Интеллект</Label>
              <Input
                type="number"
                id="intelligence"
                value={intelligence}
                onChange={(e) => setIntelligence(Number(e.target.value))}
              />
              <span>({abilityModifier(intelligence)})</span>
            </div>
            <div className="flex items-center space-x-4">
              <Label htmlFor="wisdom">Мудрость</Label>
              <Input
                type="number"
                id="wisdom"
                value={wisdom}
                onChange={(e) => setWisdom(Number(e.target.value))}
              />
              <span>({abilityModifier(wisdom)})</span>
            </div>
            <div className="flex items-center space-x-4">
              <Label htmlFor="charisma">Харизма</Label>
              <Input
                type="number"
                id="charisma"
                value={charisma}
                onChange={(e) => setCharisma(Number(e.target.value))}
              />
              <span>({abilityModifier(charisma)})</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Спасброски */}
        <Card>
          <CardHeader>
            <CardTitle>Спасброски</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saving-strength"
                checked={savingThrows.includes('strength')}
                onCheckedChange={() => handleSavingThrowChange('strength')}
              />
              <Label htmlFor="saving-strength">Сила ({abilityModifier(strength)})</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saving-dexterity"
                checked={savingThrows.includes('dexterity')}
                onCheckedChange={() => handleSavingThrowChange('dexterity')}
              />
              <Label htmlFor="saving-dexterity">Ловкость ({abilityModifier(dexterity)})</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saving-constitution"
                checked={savingThrows.includes('constitution')}
                onCheckedChange={() => handleSavingThrowChange('constitution')}
              />
              <Label htmlFor="saving-constitution">Телосложение ({abilityModifier(constitution)})</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saving-intelligence"
                checked={savingThrows.includes('intelligence')}
                onCheckedChange={() => handleSavingThrowChange('intelligence')}
              />
              <Label htmlFor="saving-intelligence">Интеллект ({abilityModifier(intelligence)})</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saving-wisdom"
                checked={savingThrows.includes('wisdom')}
                onCheckedChange={() => handleSavingThrowChange('wisdom')}
              />
              <Label htmlFor="saving-wisdom">Мудрость ({abilityModifier(wisdom)})</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saving-charisma"
                checked={savingThrows.includes('charisma')}
                onCheckedChange={() => handleSavingThrowChange('charisma')}
              />
              <Label htmlFor="saving-charisma">Харизма ({abilityModifier(charisma)})</Label>
            </div>
          </CardContent>
        </Card>
        
        {/* Навыки */}
        <Card>
          <CardHeader>
            <CardTitle>Навыки</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-athletics">Атлетика (Сила)</Label>
              <Checkbox
                id="skill-athletics"
                checked={skills.includes('athletics')}
                onCheckedChange={() => handleSkillChange('athletics')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-acrobatics">Акробатика (Ловкость)</Label>
              <Checkbox
                id="skill-acrobatics"
                checked={skills.includes('acrobatics')}
                onCheckedChange={() => handleSkillChange('acrobatics')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-stealth">Скрытность (Ловкость)</Label>
              <Checkbox
                id="skill-stealth"
                checked={skills.includes('stealth')}
                onCheckedChange={() => handleSkillChange('stealth')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-arcana">Магия (Интеллект)</Label>
              <Checkbox
                id="skill-arcana"
                checked={skills.includes('arcana')}
                onCheckedChange={() => handleSkillChange('arcana')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-history">История (Интеллект)</Label>
              <Checkbox
                id="skill-history"
                checked={skills.includes('history')}
                onCheckedChange={() => handleSkillChange('history')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-investigation">Анализ (Интеллект)</Label>
              <Checkbox
                id="skill-investigation"
                checked={skills.includes('investigation')}
                onCheckedChange={() => handleSkillChange('investigation')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-nature">Природа (Интеллект)</Label>
              <Checkbox
                id="skill-nature"
                checked={skills.includes('nature')}
                onCheckedChange={() => handleSkillChange('nature')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-religion">Религия (Интеллект)</Label>
              <Checkbox
                id="skill-religion"
                checked={skills.includes('religion')}
                onCheckedChange={() => handleSkillChange('religion')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-animal-handling">Уход за животными (Мудрость)</Label>
              <Checkbox
                id="skill-animal-handling"
                checked={skills.includes('animal-handling')}
                onCheckedChange={() => handleSkillChange('animal-handling')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-insight">Проницательность (Мудрость)</Label>
              <Checkbox
                id="skill-insight"
                checked={skills.includes('insight')}
                onCheckedChange={() => handleSkillChange('insight')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-medicine">Медицина (Мудрость)</Label>
              <Checkbox
                id="skill-medicine"
                checked={skills.includes('medicine')}
                onCheckedChange={() => handleSkillChange('medicine')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-perception">Внимательность (Мудрость)</Label>
              <Checkbox
                id="skill-perception"
                checked={skills.includes('perception')}
                onCheckedChange={() => handleSkillChange('perception')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-survival">Выживание (Мудрость)</Label>
              <Checkbox
                id="skill-survival"
                checked={skills.includes('survival')}
                onCheckedChange={() => handleSkillChange('survival')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-deception">Обман (Харизма)</Label>
              <Checkbox
                id="skill-deception"
                checked={skills.includes('deception')}
                onCheckedChange={() => handleSkillChange('deception')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-intimidation">Запугивание (Харизма)</Label>
              <Checkbox
                id="skill-intimidation"
                checked={skills.includes('intimidation')}
                onCheckedChange={() => handleSkillChange('intimidation')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-performance">Выступление (Харизма)</Label>
              <Checkbox
                id="skill-performance"
                checked={skills.includes('performance')}
                onCheckedChange={() => handleSkillChange('performance')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="skill-persuasion">Убеждение (Харизма)</Label>
              <Checkbox
                id="skill-persuasion"
                checked={skills.includes('persuasion')}
                onCheckedChange={() => handleSkillChange('persuasion')}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Владение */}
        <Card>
          <CardHeader>
            <CardTitle>Владение и экспертиза</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-athletics">Атлетика (Сила)</Label>
              <Checkbox
                id="expertise-athletics"
                checked={hasExpertise('athletics')}
                onCheckedChange={() => handleExpertiseChange('athletics')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-acrobatics">Акробатика (Ловкость)</Label>
              <Checkbox
                id="expertise-acrobatics"
                checked={hasExpertise('acrobatics')}
                onCheckedChange={() => handleExpertiseChange('acrobatics')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-stealth">Скрытность (Ловкость)</Label>
              <Checkbox
                id="expertise-stealth"
                checked={hasExpertise('stealth')}
                onCheckedChange={() => handleExpertiseChange('stealth')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-arcana">Магия (Интеллект)</Label>
              <Checkbox
                id="expertise-arcana"
                checked={hasExpertise('arcana')}
                onCheckedChange={() => handleExpertiseChange('arcana')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-history">История (Интеллект)</Label>
              <Checkbox
                id="expertise-history"
                checked={hasExpertise('history')}
                onCheckedChange={() => handleExpertiseChange('history')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-investigation">Анализ (Интеллект)</Label>
              <Checkbox
                id="expertise-investigation"
                checked={hasExpertise('investigation')}
                onCheckedChange={() => handleExpertiseChange('investigation')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-nature">Природа (Интеллект)</Label>
              <Checkbox
                id="expertise-nature"
                checked={hasExpertise('nature')}
                onCheckedChange={() => handleExpertiseChange('nature')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-religion">Религия (Интеллект)</Label>
              <Checkbox
                id="expertise-religion"
                checked={hasExpertise('religion')}
                onCheckedChange={() => handleExpertiseChange('religion')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-animal-handling">Уход за животными (Мудрость)</Label>
              <Checkbox
                id="expertise-animal-handling"
                checked={hasExpertise('animal-handling')}
                onCheckedChange={() => handleExpertiseChange('animal-handling')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-insight">Проницательность (Мудрость)</Label>
              <Checkbox
                id="expertise-insight"
                checked={hasExpertise('insight')}
                onCheckedChange={() => handleExpertiseChange('insight')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-medicine">Медицина (Мудрость)</Label>
              <Checkbox
                id="expertise-medicine"
                checked={hasExpertise('medicine')}
                onCheckedChange={() => handleExpertiseChange('medicine')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-perception">Внимательность (Мудрость)</Label>
              <Checkbox
                id="expertise-perception"
                checked={hasExpertise('perception')}
                onCheckedChange={() => handleExpertiseChange('perception')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-survival">Выживание (Мудрость)</Label>
              <Checkbox
                id="expertise-survival"
                checked={hasExpertise('survival')}
                onCheckedChange={() => handleExpertiseChange('survival')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-deception">Обман (Харизма)</Label>
              <Checkbox
                id="expertise-deception"
                checked={hasExpertise('deception')}
                onCheckedChange={() => handleExpertiseChange('deception')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-intimidation">Запугивание (Харизма)</Label>
              <Checkbox
                id="expertise-intimidation"
                checked={hasExpertise('intimidation')}
                onCheckedChange={() => handleExpertiseChange('intimidation')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-performance">Выступление (Харизма)</Label>
              <Checkbox
                id="expertise-performance"
                checked={hasExpertise('performance')}
                onCheckedChange={() => handleExpertiseChange('performance')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expertise-persuasion">Убеждение (Харизма)</Label>
              <Checkbox
                id="expertise-persuasion"
                checked={hasExpertise('persuasion')}
                onCheckedChange={() => handleExpertiseChange('persuasion')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default AbilitiesTab;
