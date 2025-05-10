import React from 'react';
import { Character, AbilityScores } from '@/types/character';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// Define helper functions that were missing
const toggleSavingThrow = (ability: string, character: Character, onUpdate: (updates: Partial<Character>) => void) => {
  const savingThrows = { ...(character.savingThrows || {}) };
  savingThrows[ability] = savingThrows[ability] ? 0 : 1;
  onUpdate({ savingThrows });
};

const calculateSavingThrow = (ability: string, abilityScore: number, proficient: boolean, proficiencyBonus: number): number => {
  const modifier = Math.floor((abilityScore - 10) / 2);
  return proficient ? modifier + proficiencyBonus : modifier;
};

const hasSkillProficiency = (skill: string, character: Character): boolean => {
  if (!character.skills) return false;
  const skillValue = character.skills[skill];
  if (!skillValue) return false;
  
  if (typeof skillValue === 'number') {
    return skillValue > 0;
  }
  
  return skillValue.proficient;
};

const toggleSkillProficiency = (skill: string, character: Character, onUpdate: (updates: Partial<Character>) => void) => {
  const skills = { ...(character.skills || {}) };
  
  const currentSkill = skills[skill];
  if (typeof currentSkill === 'number') {
    skills[skill] = currentSkill > 0 ? 0 : 1;
  } else if (currentSkill && typeof currentSkill === 'object') {
    skills[skill] = {
      ...currentSkill,
      proficient: !currentSkill.proficient
    };
  } else {
    skills[skill] = { proficient: true, expertise: false, value: 0 };
  }
  
  onUpdate({ skills });
};

const calculateSkillBonus = (skill: string, ability: string, abilityScore: number, proficient: boolean, proficiencyBonus: number): number => {
  const modifier = Math.floor((abilityScore - 10) / 2);
  return proficient ? modifier + proficiencyBonus : modifier;
};

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  // Initialize abilities with default values if they don't exist
  const abilities: AbilityScores = character.abilities || {
    STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
    strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
  };

  // Calculate proficiency bonus
  const proficiencyBonus = character.proficiencyBonus || Math.floor((character.level + 7) / 4);

  // Calculate ability modifiers
  const getModifier = (score: number): number => Math.floor((score - 10) / 2);

  // Handle ability score changes
  const handleAbilityChange = (ability: keyof AbilityScores, value: number) => {
    const newAbilities = { ...character.abilities } as AbilityScores;
    newAbilities[ability] = value;
    
    // Update both short and long forms of the ability score
    if (ability === 'STR') newAbilities.strength = value;
    if (ability === 'DEX') newAbilities.dexterity = value;
    if (ability === 'CON') newAbilities.constitution = value;
    if (ability === 'INT') newAbilities.intelligence = value;
    if (ability === 'WIS') newAbilities.wisdom = value;
    if (ability === 'CHA') newAbilities.charisma = value;
    
    onUpdate({ abilities: newAbilities });
  };

  // Handle text input changes for personality traits etc.
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: keyof Character) => {
    onUpdate({ [field]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Abilities section */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Характеристики</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium">Сила (STR)</label>
            <Input
              type="number"
              value={abilities.STR}
              onChange={(e) => handleAbilityChange('STR', parseInt(e.target.value))}
              className="w-16 text-center"
            />
            <span className="text-sm mt-1">Мод: {getModifier(abilities.STR)}</span>
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium">Ловкость (DEX)</label>
            <Input
              type="number"
              value={abilities.DEX}
              onChange={(e) => handleAbilityChange('DEX', parseInt(e.target.value))}
              className="w-16 text-center"
            />
            <span className="text-sm mt-1">Мод: {getModifier(abilities.DEX)}</span>
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium">Телосложение (CON)</label>
            <Input
              type="number"
              value={abilities.CON}
              onChange={(e) => handleAbilityChange('CON', parseInt(e.target.value))}
              className="w-16 text-center"
            />
            <span className="text-sm mt-1">Мод: {getModifier(abilities.CON)}</span>
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium">Интеллект (INT)</label>
            <Input
              type="number"
              value={abilities.INT}
              onChange={(e) => handleAbilityChange('INT', parseInt(e.target.value))}
              className="w-16 text-center"
            />
            <span className="text-sm mt-1">Мод: {getModifier(abilities.INT)}</span>
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium">Мудрость (WIS)</label>
            <Input
              type="number"
              value={abilities.WIS}
              onChange={(e) => handleAbilityChange('WIS', parseInt(e.target.value))}
              className="w-16 text-center"
            />
            <span className="text-sm mt-1">Мод: {getModifier(abilities.WIS)}</span>
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium">Харизма (CHA)</label>
            <Input
              type="number"
              value={abilities.CHA}
              onChange={(e) => handleAbilityChange('CHA', parseInt(e.target.value))}
              className="w-16 text-center"
            />
            <span className="text-sm mt-1">Мод: {getModifier(abilities.CHA)}</span>
          </div>
        </div>
      </section>

      {/* Saving Throws section */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Спасброски</h3>
        <Separator className="my-2" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={character.savingThrows?.STR > 0}
              onChange={() => toggleSavingThrow('STR', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Сила: {calculateSavingThrow('STR', abilities.STR, !!character.savingThrows?.STR, proficiencyBonus)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={character.savingThrows?.DEX > 0}
              onChange={() => toggleSavingThrow('DEX', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Ловкость: {calculateSavingThrow('DEX', abilities.DEX, !!character.savingThrows?.DEX, proficiencyBonus)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={character.savingThrows?.CON > 0}
              onChange={() => toggleSavingThrow('CON', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Телосложение: {calculateSavingThrow('CON', abilities.CON, !!character.savingThrows?.CON, proficiencyBonus)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={character.savingThrows?.INT > 0}
              onChange={() => toggleSavingThrow('INT', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Интеллект: {calculateSavingThrow('INT', abilities.INT, !!character.savingThrows?.INT, proficiencyBonus)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={character.savingThrows?.WIS > 0}
              onChange={() => toggleSavingThrow('WIS', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Мудрость: {calculateSavingThrow('WIS', abilities.WIS, !!character.savingThrows?.WIS, proficiencyBonus)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={character.savingThrows?.CHA > 0}
              onChange={() => toggleSavingThrow('CHA', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Харизма: {calculateSavingThrow('CHA', abilities.CHA, !!character.savingThrows?.CHA, proficiencyBonus)}
            </span>
          </div>
        </div>
      </section>

      {/* Skills section */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Навыки</h3>
        <Separator className="my-2" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('acrobatics', character)}
              onChange={() => toggleSkillProficiency('acrobatics', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Акробатика (ЛОВ): {calculateSkillBonus('acrobatics', 'DEX', abilities.DEX, hasSkillProficiency('acrobatics', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('animalHandling', character)}
              onChange={() => toggleSkillProficiency('animalHandling', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Обращение с животными (МДР): {calculateSkillBonus('animalHandling', 'WIS', abilities.WIS, hasSkillProficiency('animalHandling', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('arcana', character)}
              onChange={() => toggleSkillProficiency('arcana', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Магия (ИНТ): {calculateSkillBonus('arcana', 'INT', abilities.INT, hasSkillProficiency('arcana', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('athletics', character)}
              onChange={() => toggleSkillProficiency('athletics', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Атлетика (СИЛ): {calculateSkillBonus('athletics', 'STR', abilities.STR, hasSkillProficiency('athletics', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('deception', character)}
              onChange={() => toggleSkillProficiency('deception', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Обман (ХАР): {calculateSkillBonus('deception', 'CHA', abilities.CHA, hasSkillProficiency('deception', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('history', character)}
              onChange={() => toggleSkillProficiency('history', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              История (ИНТ): {calculateSkillBonus('history', 'INT', abilities.INT, hasSkillProficiency('history', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('insight', character)}
              onChange={() => toggleSkillProficiency('insight', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Проницательность (МДР): {calculateSkillBonus('insight', 'WIS', abilities.WIS, hasSkillProficiency('insight', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('intimidation', character)}
              onChange={() => toggleSkillProficiency('intimidation', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Запугивание (ХАР): {calculateSkillBonus('intimidation', 'CHA', abilities.CHA, hasSkillProficiency('intimidation', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('investigation', character)}
              onChange={() => toggleSkillProficiency('investigation', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Расследование (ИНТ): {calculateSkillBonus('investigation', 'INT', abilities.INT, hasSkillProficiency('investigation', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('medicine', character)}
              onChange={() => toggleSkillProficiency('medicine', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Медицина (МДР): {calculateSkillBonus('medicine', 'WIS', abilities.WIS, hasSkillProficiency('medicine', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('nature', character)}
              onChange={() => toggleSkillProficiency('nature', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Природа (ИНТ): {calculateSkillBonus('nature', 'INT', abilities.INT, hasSkillProficiency('nature', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('perception', character)}
              onChange={() => toggleSkillProficiency('perception', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Восприятие (МДР): {calculateSkillBonus('perception', 'WIS', abilities.WIS, hasSkillProficiency('perception', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('performance', character)}
              onChange={() => toggleSkillProficiency('performance', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Выступление (ХАР): {calculateSkillBonus('performance', 'CHA', abilities.CHA, hasSkillProficiency('performance', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('persuasion', character)}
              onChange={() => toggleSkillProficiency('persuasion', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Убеждение (ХАР): {calculateSkillBonus('persuasion', 'CHA', abilities.CHA, hasSkillProficiency('persuasion', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('religion', character)}
              onChange={() => toggleSkillProficiency('religion', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Религия (ИНТ): {calculateSkillBonus('religion', 'INT', abilities.INT, hasSkillProficiency('religion', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('sleightOfHand', character)}
              onChange={() => toggleSkillProficiency('sleightOfHand', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Ловкость рук (ЛОВ): {calculateSkillBonus('sleightOfHand', 'DEX', abilities.DEX, hasSkillProficiency('sleightOfHand', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('stealth', character)}
              onChange={() => toggleSkillProficiency('stealth', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Скрытность (ЛОВ): {calculateSkillBonus('stealth', 'DEX', abilities.DEX, hasSkillProficiency('stealth', character), proficiencyBonus)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSkillProficiency('survival', character)}
              onChange={() => toggleSkillProficiency('survival', character, onUpdate)}
              className="rounded"
            />
            <span className="text-sm">
              Выживание (МДР): {calculateSkillBonus('survival', 'WIS', abilities.WIS, hasSkillProficiency('survival', character), proficiencyBonus)}
            </span>
          </div>
        </div>
      </section>

      {/* Personality traits */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Личностные черты</h3>
        <Textarea
          value={character.personalityTraits || ''}
          onChange={(e) => handleInputChange(e, 'personalityTraits')}
          placeholder="Опишите личностные черты вашего персонажа"
          className="min-h-[100px]"
        />
      </section>

      {/* Ideals */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Идеалы</h3>
        <Textarea
          value={character.ideals || ''}
          onChange={(e) => handleInputChange(e, 'ideals')}
          placeholder="Опишите идеалы вашего персонажа"
          className="min-h-[100px]"
        />
      </section>

      {/* Bonds */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Привязанности</h3>
        <Textarea
          value={character.bonds || ''}
          onChange={(e) => handleInputChange(e, 'bonds')}
          placeholder="Опишите привязанности вашего персонажа"
          className="min-h-[100px]"
        />
      </section>

      {/* Flaws */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Слабости</h3>
        <Textarea
          value={character.flaws || ''}
          onChange={(e) => handleInputChange(e, 'flaws')}
          placeholder="Опишите слабости вашего персонажа"
          className="min-h-[100px]"
        />
      </section>
    </div>
  );
};

// Export the component
export default AbilitiesTab;
