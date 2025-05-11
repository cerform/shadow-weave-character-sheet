
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid';
import { Character } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Dice1 } from "lucide-react";

const DMSessionPage: React.FC = () => {
  const { characters } = useCharacter();
  const [npcName, setNpcName] = useState('');
  const [npcDescription, setNpcDescription] = useState('');
  const [npcList, setNpcList] = useState<any[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showNpcDetails, setShowNpcDetails] = useState(false);
  const [showCharacterDetails, setShowCharacterDetails] = useState(false);
  const [initiativeOrder, setInitiativeOrder] = useState<any[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [initiativeValue, setInitiativeValue] = useState('');
  const [isRollingInitiative, setIsRollingInitiative] = useState(false);
  const [rollResults, setRollResults] = useState<number[]>([]);
  const [showRollResults, setShowRollResults] = useState(false);
  const [diceFormula, setDiceFormula] = useState('1d20');
  const [diceRollResult, setDiceRollResult] = useState<number | null>(null);
  const [diceRollHistory, setDiceRollHistory] = useState<string[]>([]);
  const [showDiceRollHistory, setShowDiceRollHistory] = useState(false);
  const [diceRollDescription, setDiceRollDescription] = useState('');
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [npcAvatarUrl, setNpcAvatarUrl] = useState('');
  const [npcAvatarFile, setNpcAvatarFile] = useState<File | null>(null);
  const [npcAvatarPreview, setNpcAvatarPreview] = useState('');
  const [npcAlignment, setNpcAlignment] = useState('');
  const [npcArmorClass, setNpcArmorClass] = useState('');
  const [npcHitPoints, setNpcHitPoints] = useState('');
  const [npcSpeed, setNpcSpeed] = useState('');
  const [npcStrength, setNpcStrength] = useState('');
  const [npcDexterity, setNpcDexterity] = useState('');
  const [npcConstitution, setNpcConstitution] = useState('');
  const [npcIntelligence, setNpcIntelligence] = useState('');
  const [npcWisdom, setNpcWisdom] = useState('');
  const [npcCharisma, setNpcCharisma] = useState('');
  const [npcAbilities, setNpcAbilities] = useState({
    strength: '',
    dexterity: '',
    constitution: '',
    intelligence: '',
    wisdom: '',
    charisma: ''
  });
  const [npcSkills, setNpcSkills] = useState('');
  const [npcDamageImmunities, setNpcDamageImmunities] = useState('');
  const [npcConditionImmunities, setNpcConditionImmunities] = useState('');
  const [npcSenses, setNpcSenses] = useState('');
  const [npcLanguages, setNpcLanguages] = useState('');
  const [npcChallenge, setNpcChallenge] = useState('');
  const [npcTraits, setNpcTraits] = useState('');
  const [npcActions, setNpcActions] = useState('');
  const [npcLegendaryActions, setNpcLegendaryActions] = useState('');
  const [npcEquipment, setNpcEquipment] = useState('');
  const [npcNotes, setNpcNotes] = useState('');
  const [npcType, setNpcType] = useState('');
  const [npcSize, setNpcSize] = useState('');
  const [npcArmorType, setNpcArmorType] = useState('');
  const [npcHitDice, setNpcHitDice] = useState('');
  const [npcSpeedDetails, setNpcSpeedDetails] = useState('');
  const [npcDamageResistances, setNpcDamageResistances] = useState('');
  const [npcDamageVulnerabilities, setNpcDamageVulnerabilities] = useState('');
  const [npcSkillsDetails, setNpcSkillsDetails] = useState('');
  const [npcSaves, setNpcSaves] = useState('');
  const [npcSavesDetails, setNpcSavesDetails] = useState('');
  const [npcSkillsList, setNpcSkillsList] = useState<any[]>([]);
  const [npcSavesList, setNpcSavesList] = useState<any[]>([]);
  const [npcActionsList, setNpcActionsList] = useState<any[]>([]);
  const [npcLegendaryActionsList, setNpcLegendaryActionsList] = useState<any[]>([]);
  const [npcTraitsList, setNpcTraitsList] = useState<any[]>([]);
  const [npcEquipmentList, setNpcEquipmentList] = useState<any[]>([]);
  const [npcNotesList, setNpcNotesList] = useState<any[]>([]);
  const [npcSpellsList, setNpcSpellsList] = useState<any[]>([]);
  const [npcSpells, setNpcSpells] = useState('');
  const [npcReactions, setNpcReactions] = useState('');
  const [npcReactionsList, setNpcReactionsList] = useState<any[]>([]);
  const [showNpcEditModal, setShowNpcEditModal] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState<any | null>(null);
  const [npcCrDetails, setNpcCrDetails] = useState('');
  const [npcCrDetailsList, setNpcCrDetailsList] = useState<any[]>([]);
  const [npcImage, setNpcImage] = useState('');
  const [npcImageList, setNpcImageList] = useState<any[]>([]);
  const [npcImageDetails, setNpcImageDetails] = useState('');
  const [npcImageDetailsList, setNpcImageDetailsList] = useState<any[]>([]);
  const [npcSensesDetails, setNpcSensesDetails] = useState('');
  const [npcSensesDetailsList, setNpcSensesDetailsList] = useState<any[]>([]);
  const [npcLanguagesDetails, setNpcLanguagesDetails] = useState('');
  const [npcLanguagesDetailsList, setNpcLanguagesDetailsList] = useState<any[]>([]);
  const [npcDamageImmunitiesDetails, setNpcDamageImmunitiesDetails] = useState('');
  const [npcDamageImmunitiesDetailsList, setNpcDamageImmunitiesDetailsList] = useState<any[]>([]);
  const [npcDamageResistancesDetails, setNpcDamageResistancesDetailsList] = useState('');
  const [npcDamageResistancesDetailsList, setNpcDamageResistancesDetailsList] = useState<any[]>([]);
  const [npcDamageVulnerabilitiesDetails, setNpcDamageVulnerabilitiesDetailsList] = useState('');
  const [npcDamageVulnerabilitiesDetailsList, setNpcDamageVulnerabilitiesDetailsList] = useState<any[]>([]);
  const [npcConditionImmunitiesDetails, setNpcConditionImmunitiesDetailsList] = useState('');
  const [npcConditionImmunitiesDetailsList, setNpcConditionImmunitiesDetailsList] = useState<any[]>([]);
  const [npcReactionsDetails, setNpcReactionsDetails] = useState('');
  const [npcReactionsDetailsList, setNpcReactionsDetailsList] = useState<any[]>([]);
  const [npcTraitsDetails, setNpcTraitsDetails] = useState('');
  const [npcTraitsDetailsList, setNpcTraitsDetailsList] = useState<any[]>([]);
  const [npcActionsDetails, setNpcActionsDetails] = useState('');
  const [npcActionsDetailsList, setNpcActionsDetailsList] = useState<any[]>([]);
  const [npcLegendaryActionsDetails, setNpcLegendaryActionsDetails] = useState('');
  const [npcLegendaryActionsDetailsList, setNpcLegendaryActionsDetailsList] = useState<any[]>([]);
  const [npcEquipmentDetails, setNpcEquipmentDetails] = useState('');
  const [npcEquipmentDetailsList, setNpcEquipmentDetailsList] = useState<any[]>([]);
  const [npcNotesDetails, setNpcNotesDetails] = useState('');
  const [npcNotesDetailsList, setNpcNotesDetailsList] = useState<any[]>([]);
  const [npcSpellsDetails, setNpcSpellsDetails] = useState('');
  const [npcSpellsDetailsList, setNpcSpellsDetailsList] = useState<any[]>([]);
  const [npcCr, setNpcCr] = useState('');
  const [npcCrList, setNpcCrList] = useState<any[]>([]);
  const [npcCrDetailsName, setNpcCrDetailsName] = useState('');
  const [npcCrDetailsDescription, setNpcCrDetailsDescription] = useState('');
  const [npcCrDetailsAttackBonus, setNpcCrDetailsAttackBonus] = useState('');
  const [npcCrDetailsDamagePerRound, setNpcCrDetailsDamagePerRound] = useState('');
  const [npcCrDetailsArmorClass, setNpcCrDetailsArmorClass] = useState('');
  const [npcCrDetailsHitPoints, setNpcCrDetailsHitPoints] = useState('');
  const [npcCrDetailsExperiencePoints, setNpcCrDetailsExperiencePoints] = useState('');
  const [npcCrDetailsProficiencyBonus, setNpcCrDetailsProficiencyBonus] = useState('');
  const [npcCrDetailsSaves, setNpcCrDetailsSaves] = useState('');
  const [npcCrDetailsSkills, setNpcCrDetailsSkills] = useState('');
  const [npcCrDetailsSenses, setNpcCrDetailsSenses] = useState('');
  const [npcCrDetailsLanguages, setNpcCrDetailsLanguages] = useState('');
  const [npcCrDetailsDamageImmunities, setNpcCrDetailsDamageImmunities] = useState('');
  const [npcCrDetailsDamageResistances, setNpcCrDetailsDamageResistances] = useState('');
  const [npcCrDetailsDamageVulnerabilities, setNpcCrDetailsDamageVulnerabilities] = useState('');
  const [npcCrDetailsConditionImmunities, setNpcCrDetailsConditionImmunities] = useState('');
  const [npcCrDetailsReactions, setNpcCrDetailsReactions] = useState('');
  const [npcCrDetailsTraits, setNpcCrDetailsTraits] = useState('');
  const [npcCrDetailsActions, setNpcCrDetailsActions] = useState('');
  const [npcCrDetailsLegendaryActions, setNpcCrDetailsLegendaryActions] = useState('');
  const [npcCrDetailsEquipment, setNpcCrDetailsEquipment] = useState('');
  const [npcCrDetailsNotes, setNpcCrDetailsNotes] = useState('');
  const [npcCrDetailsSpells, setNpcCrDetailsSpells] = useState('');
  const [npcCrDetailsImage, setNpcCrDetailsImage] = useState('');
  const [npcCrDetailsImageDetails, setNpcCrDetailsImageDetails] = useState('');
  const [npcCrDetailsSensesDetails, setNpcCrDetailsSensesDetails] = useState('');
  const [npcCrDetailsLanguagesDetails, setNpcCrDetailsLanguagesDetails] = useState('');
  const [npcCrDetailsDamageImmunitiesDetails, setNpcCrDetailsDamageImmunitiesDetails] = useState('');
  const [npcCrDetailsDamageResistancesDetails, setNpcCrDetailsDamageResistancesDetails] = useState('');
  const [npcCrDetailsDamageVulnerabilitiesDetails, setNpcCrDetailsDamageVulnerabilitiesDetails] = useState('');
  const [npcCrDetailsConditionImmunitiesDetails, setNpcCrDetailsConditionImmunitiesDetails] = useState('');
  const [npcCrDetailsReactionsDetails, setNpcCrDetailsReactionsDetails] = useState('');
  const [npcCrDetailsTraitsDetails, setNpcCrDetailsTraitsDetails] = useState('');
  const [npcCrDetailsActionsDetails, setNpcCrDetailsActionsDetails] = useState('');
  const [npcCrDetailsLegendaryActionsDetails, setNpcCrDetailsLegendaryActionsDetails] = useState('');
  const [npcCrDetailsEquipmentDetails, setNpcCrDetailsEquipmentDetails] = useState('');
  const [npcCrDetailsNotesDetails, setNpcCrDetailsNotesDetails] = useState('');
  const [npcCrDetailsSpellsDetails, setNpcCrDetailsSpellsDetails] = useState('');
  const [npcCrDetailsCr, setNpcCrDetailsCr] = useState('');
  const [npcCrDetailsCrList, setNpcCrDetailsCrList] = useState<any[]>([]);
  const [npcCrDetailsCrDetailsName, setNpcCrDetailsCrDetailsName] = useState('');
  const [npcCrDetailsCrDetailsDescription, setNpcCrDetailsCrDetailsDescription] = useState('');
  const [npcCrDetailsCrDetailsAttackBonus, setNpcCrDetailsCrDetailsAttackBonus] = useState('');
  const [npcCrDetailsCrDetailsDamagePerRound, setNpcCrDetailsCrDetailsDamagePerRound] = useState('');
  const [npcCrDetailsCrDetailsArmorClass, setNpcCrDetailsCrDetailsArmorClass] = useState('');
  const [npcCrDetailsCrDetailsHitPoints, setNpcCrDetailsCrDetailsHitPoints] = useState('');
  const [npcCrDetailsCrDetailsExperiencePoints, setNpcCrDetailsCrDetailsExperiencePoints] = useState('');
  const [npcCrDetailsCrDetailsProficiencyBonus, setNpcCrDetailsCrDetailsProficiencyBonus] = useState('');
  const [npcCrDetailsCrDetailsSaves, setNpcCrDetailsCrDetailsSaves] = useState('');
  const [npcCrDetailsCrDetailsSkills, setNpcCrDetailsCrDetailsSkills] = useState('');
  const [npcCrDetailsCrDetailsSenses, setNpcCrDetailsCrDetailsSenses] = useState('');
  const [npcCrDetailsCrDetailsLanguages, setNpcCrDetailsCrDetailsLanguages] = useState('');
  const [npcCrDetailsCrDetailsDamageImmunities, setNpcCrDetailsCrDetailsDamageImmunities] = useState('');
  const [npcCrDetailsCrDetailsDamageResistances, setNpcCrDetailsCrDetailsDamageResistances] = useState('');
  const [npcCrDetailsCrDetailsDamageVulnerabilities, setNpcCrDetailsCrDetailsDamageVulnerabilities] = useState('');
  const [npcCrDetailsCrDetailsConditionImmunities, setNpcCrDetailsCrDetailsConditionImmunities] = useState('');
  const [npcCrDetailsCrDetailsReactions, setNpcCrDetailsCrDetailsReactions] = useState('');
  const [npcCrDetailsCrDetailsTraits, setNpcCrDetailsCrDetailsTraits] = useState('');
  const [npcCrDetailsCrDetailsActions, setNpcCrDetailsCrDetailsActions] = useState('');
  const [npcCrDetailsCrDetailsLegendaryActions, setNpcCrDetailsCrDetailsLegendaryActions] = useState('');
  const [npcCrDetailsCrDetailsEquipment, setNpcCrDetailsCrDetailsEquipment] = useState('');
  const [npcCrDetailsCrDetailsNotes, setNpcCrDetailsCrDetailsNotes] = useState('');
  const [npcCrDetailsCrDetailsSpells, setNpcCrDetailsCrDetailsSpells] = useState('');
  const [npcCrDetailsCrDetailsImage, setNpcCrDetailsCrDetailsImage] = useState('');
  const [npcCrDetailsCrDetailsImageDetails, setNpcCrDetailsCrDetailsImageDetails] = useState('');
  const [npcCrDetailsCrDetailsSensesDetails, setNpcCrDetailsCrDetailsSensesDetails] = useState('');
  const [npcCrDetailsCrDetailsLanguagesDetails, setNpcCrDetailsCrDetailsLanguagesDetails] = useState('');
  const [npcCrDetailsCrDetailsDamageImmunitiesDetails, setNpcCrDetailsCrDetailsDamageImmunitiesDetails] = useState('');
  const [npcCrDetailsCrDetailsDamageResistancesDetails, setNpcCrDetailsCrDetailsDamageResistancesDetails] = useState('');
  const [npcCrDetailsCrDetailsDamageVulnerabilitiesDetails, setNpcCrDetailsCrDetailsDamageVulnerabilitiesDetails] = useState('');
  const [npcCrDetailsCrDetailsConditionImmunitiesDetails, setNpcCrDetailsCrDetailsConditionImmunitiesDetails] = useState('');
  const [npcCrDetailsCrDetailsReactionsDetails, setNpcCrDetailsCrDetailsReactionsDetails] = useState('');
  const [npcCrDetailsCrDetailsTraitsDetails, setNpcCrDetailsCrDetailsTraitsDetails] = useState('');
  const [npcCrDetailsCrDetailsActionsDetails, setNpcCrDetailsCrDetailsActionsDetails] = useState('');
  const [npcCrDetailsCrDetailsLegendaryActionsDetails, setNpcCrDetailsCrDetailsLegendaryActionsDetails] = useState('');
  const [npcCrDetailsCrDetailsEquipmentDetails, setNpcCrDetailsCrDetailsEquipmentDetails] = useState('');
  const [npcCrDetailsCrDetailsNotesDetails, setNpcCrDetailsCrDetailsNotesDetails] = useState('');
  const [npcCrDetailsCrDetailsSpellsDetails, setNpcCrDetailsCrDetailsSpellsDetails] = useState('');
  const [npcCrDetailsCrDetailsCr, setNpcCrDetailsCrDetailsCr] = useState('');
  const [npcCrDetailsCrDetailsCrList, setNpcCrDetailsCrDetailsCrList] = useState<any[]>([]);
  const [npcCrDetailsCrDetailsCrDetailsName, setNpcCrDetailsCrDetailsCrDetailsName] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsDescription, setNpcCrDetailsCrDetailsCrDetailsDescription] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsAttackBonus, setNpcCrDetailsCrDetailsCrDetailsAttackBonus] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsDamagePerRound, setNpcCrDetailsCrDetailsCrDetailsDamagePerRound] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsArmorClass, setNpcCrDetailsCrDetailsCrDetailsArmorClass] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsHitPoints, setNpcCrDetailsCrDetailsCrDetailsHitPoints] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsExperiencePoints, setNpcCrDetailsCrDetailsCrDetailsExperiencePoints] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsProficiencyBonus, setNpcCrDetailsCrDetailsCrDetailsProficiencyBonus] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsSaves, setNpcCrDetailsCrDetailsCrDetailsSaves] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsSkills, setNpcCrDetailsCrDetailsCrDetailsSkills] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsSenses, setNpcCrDetailsCrDetailsCrDetailsSenses] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsLanguages, setNpcCrDetailsCrDetailsCrDetailsLanguages] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsDamageImmunities, setNpcCrDetailsCrDetailsCrDetailsDamageImmunities] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsDamageResistances, setNpcCrDetailsCrDetailsCrDetailsDamageResistances] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsDamageVulnerabilities, setNpcCrDetailsCrDetailsCrDetailsDamageVulnerabilities] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsConditionImmunities, setNpcCrDetailsCrDetailsCrDetailsConditionImmunities] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsReactions, setNpcCrDetailsCrDetailsCrDetailsReactions] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsTraits, setNpcCrDetailsCrDetailsCrDetailsTraits] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsActions, setNpcCrDetailsCrDetailsCrDetailsActions] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsLegendaryActions, setNpcCrDetailsCrDetailsCrDetailsLegendaryActions] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsEquipment, setNpcCrDetailsCrDetailsCrDetailsEquipment] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsNotes, setNpcCrDetailsCrDetailsCrDetailsNotes] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsSpells, setNpcCrDetailsCrDetailsCrDetailsSpells] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsImage, setNpcCrDetailsCrDetailsCrDetailsImage] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsImageDetails, setNpcCrDetailsCrDetailsCrDetailsImageDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsSensesDetails, setNpcCrDetailsCrDetailsCrDetailsSensesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsLanguagesDetails, setNpcCrDetailsCrDetailsCrDetailsLanguagesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsDamageImmunitiesDetails, setNpcCrDetailsCrDetailsCrDetailsDamageImmunitiesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsDamageResistancesDetails, setNpcCrDetailsCrDetailsCrDetailsDamageResistancesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsDamageVulnerabilitiesDetails, setNpcCrDetailsCrDetailsCrDetailsDamageVulnerabilitiesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsConditionImmunitiesDetails, setNpcCrDetailsCrDetailsCrDetailsConditionImmunitiesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsReactionsDetails, setNpcCrDetailsCrDetailsCrDetailsReactionsDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsTraitsDetails, setNpcCrDetailsCrDetailsCrDetailsTraitsDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsActionsDetails, setNpcCrDetailsCrDetailsCrDetailsActionsDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsLegendaryActionsDetails, setNpcCrDetailsCrDetailsCrDetailsLegendaryActionsDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsEquipmentDetails, setNpcCrDetailsCrDetailsCrDetailsEquipmentDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsNotesDetails, setNpcCrDetailsCrDetailsCrDetailsNotesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsSpellsDetails, setNpcCrDetailsCrDetailsCrDetailsSpellsDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCr, setNpcCrDetailsCrDetailsCrDetailsCr] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrList, setNpcCrDetailsCrDetailsCrDetailsCrList] = useState<any[]>([]);
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsName, setNpcCrDetailsCrDetailsCrDetailsCrDetailsName] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsDescription, setNpcCrDetailsCrDetailsCrDetailsCrDetailsDescription] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsAttackBonus, setNpcCrDetailsCrDetailsCrDetailsCrDetailsAttackBonus] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsDamagePerRound, setNpcCrDetailsCrDetailsCrDetailsCrDetailsDamagePerRound] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsArmorClass, setNpcCrDetailsCrDetailsCrDetailsCrDetailsArmorClass] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsHitPoints, setNpcCrDetailsCrDetailsCrDetailsCrDetailsHitPoints] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsExperiencePoints, setNpcCrDetailsCrDetailsCrDetailsCrDetailsExperiencePoints] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsProficiencyBonus, setNpcCrDetailsCrDetailsCrDetailsCrDetailsProficiencyBonus] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsSaves, setNpcCrDetailsCrDetailsCrDetailsCrDetailsSaves] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsSkills, setNpcCrDetailsCrDetailsCrDetailsCrDetailsSkills] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsSenses, setNpcCrDetailsCrDetailsCrDetailsCrDetailsSenses] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsLanguages, setNpcCrDetailsCrDetailsCrDetailsCrDetailsLanguages] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsDamageImmunities, setNpcCrDetailsCrDetailsCrDetailsCrDetailsDamageImmunities] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsDamageResistances, setNpcCrDetailsCrDetailsCrDetailsCrDetailsDamageResistances] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsDamageVulnerabilities, setNpcCrDetailsCrDetailsCrDetailsCrDetailsDamageVulnerabilities] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsConditionImmunities, setNpcCrDetailsCrDetailsCrDetailsConditionImmunities] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsReactions, setNpcCrDetailsCrDetailsCrDetailsReactions] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsTraits, setNpcCrDetailsCrDetailsCrDetailsTraits] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsActions, setNpcCrDetailsCrDetailsCrDetailsActions] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsLegendaryActions, setNpcCrDetailsCrDetailsCrDetailsLegendaryActions] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsEquipment, setNpcCrDetailsCrDetailsCrDetailsEquipment] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsNotes, setNpcCrDetailsCrDetailsCrDetailsNotes] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsSpells, setNpcCrDetailsCrDetailsCrDetailsSpells] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsImage, setNpcCrDetailsCrDetailsCrDetailsImage] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsImageDetails, setNpcCrDetailsCrDetailsCrDetailsImageDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsSensesDetails, setNpcCrDetailsCrDetailsCrDetailsCrDetailsSensesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsLanguagesDetails, setNpcCrDetailsCrDetailsCrDetailsLanguagesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsDamageImmunitiesDetails, setNpcCrDetailsCrDetailsCrDetailsCrDetailsDamageImmunitiesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsDamageResistancesDetails, setNpcCrDetailsCrDetailsCrDetailsCrDetailsDamageResistancesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsDamageVulnerabilitiesDetails, setNpcCrDetailsCrDetailsCrDetailsCrDetailsDamageVulnerabilitiesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsConditionImmunitiesDetails, setNpcCrDetailsCrDetailsCrDetailsConditionImmunitiesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsReactionsDetails, setNpcCrDetailsCrDetailsCrDetailsReactionsDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsTraitsDetails, setNpcCrDetailsCrDetailsCrDetailsTraitsDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsActionsDetails, setNpcCrDetailsCrDetailsCrDetailsActionsDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsLegendaryActionsDetails, setNpcCrDetailsCrDetailsCrDetailsLegendaryActionsDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsEquipmentDetails, setNpcCrDetailsCrDetailsCrDetailsEquipmentDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsNotesDetails, setNpcCrDetailsCrDetailsCrDetailsNotesDetails] = useState('');
  const [npcCrDetailsCrDetailsCrDetailsCrDetailsSpellsDetails, setNpcCrDetailsCrDetailsCrDetailsSpellsDetails] = useState('');
  
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Персонажи игроков</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Characters list */}
              {characters && characters.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  {characters.map((character) => (
                    <div
                      key={character.id}
                      className={`p-2 mb-1 rounded cursor-pointer ${
                        selectedCharacterId === character.id ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                      onClick={() => {
                        setSelectedCharacterId(character.id);
                        setShowCharacterDetails(true);
                      }}
                    >
                      {character.name} ({character.race} {character.class})
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Пока нет созданных персонажей
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>НПС</CardTitle>
            </CardHeader>
            <CardContent>
              {/* NPC Creation */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="npc-name">Имя НПС</Label>
                  <Input
                    id="npc-name"
                    value={npcName}
                    onChange={(e) => setNpcName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="npc-description">Описание</Label>
                  <Textarea
                    id="npc-description"
                    value={npcDescription}
                    onChange={(e) => setNpcDescription(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (npcName) {
                      const newNpc = {
                        id: uuidv4(),
                        name: npcName,
                        description: npcDescription,
                        createdAt: new Date().toISOString(),
                      };
                      setNpcList((prev) => [...prev, newNpc]);
                      setNpcName('');
                      setNpcDescription('');
                    }
                  }}
                >
                  Добавить НПС
                </Button>
              </div>

              {/* NPCs list */}
              {npcList.length > 0 ? (
                <ScrollArea className="h-[200px] mt-4">
                  {npcList.map((npc) => (
                    <div
                      key={npc.id}
                      className={`p-2 mb-1 rounded cursor-pointer ${
                        selectedNpcId === npc.id ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                      onClick={() => {
                        setSelectedNpcId(npc.id);
                        setShowNpcDetails(true);
                      }}
                    >
                      {npc.name}
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <div className="text-center p-4 text-muted-foreground mt-4">
                  Пока нет НПС
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Инициатива</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Значение инициативы"
                    value={initiativeValue}
                    onChange={(e) => setInitiativeValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (selectedCharacterId || selectedNpcId) {
                        const entity = selectedCharacterId
                          ? characters.find(c => c.id === selectedCharacterId)
                          : npcList.find(n => n.id === selectedNpcId);
                        
                        if (entity) {
                          const newEntry = {
                            id: entity.id,
                            name: entity.name,
                            initiative: parseInt(initiativeValue) || 0,
                            type: selectedCharacterId ? 'character' : 'npc'
                          };
                          
                          setInitiativeOrder(prev => 
                            [...prev.filter(i => i.id !== entity.id), newEntry]
                              .sort((a, b) => b.initiative - a.initiative)
                          );
                          
                          setInitiativeValue('');
                        }
                      }
                    }}
                  >
                    Добавить
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Roll d20 automatically for all characters and NPCs
                      setIsRollingInitiative(true);
                      const results: number[] = [];
                      
                      setTimeout(() => {
                        const allEntities = [
                          ...characters.map(c => ({...c, type: 'character'})),
                          ...npcList.map(n => ({...n, type: 'npc'}))
                        ];
                        
                        const newOrder = allEntities.map(entity => {
                          const roll = Math.floor(Math.random() * 20) + 1;
                          results.push(roll);
                          return {
                            id: entity.id,
                            name: entity.name,
                            initiative: roll,
                            type: entity.type
                          };
                        }).sort((a, b) => b.initiative - a.initiative);
                        
                        setInitiativeOrder(newOrder);
                        setRollResults(results);
                        setShowRollResults(true);
                        setIsRollingInitiative(false);
                      }, 1000);
                    }}
                  >
                    {isRollingInitiative ? 'Бросаем...' : 'Бросить для всех'}
                  </Button>
                </div>
                
                {showRollResults && (
                  <div className="bg-muted p-2 rounded text-sm mb-4">
                    <p className="font-medium mb-1">Результаты бросков:</p>
                    {rollResults.map((roll, index) => (
                      <span key={index} className="inline-block mr-2">
                        {roll}
                      </span>
                    ))}
                    <Button 
                      variant="link" 
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => setShowRollResults(false)}
                    >
                      Скрыть
                    </Button>
                  </div>
                )}
                
                <div className="space-y-2">
                  {initiativeOrder.map((entity, index) => (
                    <div 
                      key={entity.id}
                      className={`p-2 rounded flex justify-between items-center 
                        ${currentTurnIndex === index ? 'bg-primary/20 border border-primary' : 'bg-muted'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="font-mono w-6 h-6 flex items-center justify-center bg-background rounded">
                          {entity.initiative}
                        </div>
                        <span>{entity.name}</span>
                        <span className="text-xs px-2 bg-primary/10 rounded">
                          {entity.type === 'character' ? 'Игрок' : 'НПС'}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => {
                          setInitiativeOrder(prev => prev.filter(e => e.id !== entity.id));
                          if (index < currentTurnIndex) {
                            setCurrentTurnIndex(prev => Math.max(0, prev - 1));
                          }
                        }}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>

                {initiativeOrder.length > 0 && (
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentTurnIndex(prev => 
                          prev > 0 ? prev - 1 : initiativeOrder.length - 1
                        );
                      }}
                    >
                      Предыдущий
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentTurnIndex(prev => 
                          prev < initiativeOrder.length - 1 ? prev + 1 : 0
                        );
                      }}
                    >
                      Следующий
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Кубики</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Формула (например, 2d6+3)"
                    value={diceFormula}
                    onChange={(e) => setDiceFormula(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      setIsRollingDice(true);
                      setTimeout(() => {
                        try {
                          // Простой парсер формулы с костями
                          const formulaMatch = diceFormula.match(/(\d+)d(\d+)(?:([+-])(\d+))?/i);
                          if (formulaMatch) {
                            const [_, count, sides, operator, modifier] = formulaMatch;
                            const diceCount = parseInt(count) || 1;
                            const diceSides = parseInt(sides) || 6;
                            
                            // Бросаем кубики
                            let result = 0;
                            for (let i = 0; i < diceCount; i++) {
                              result += Math.floor(Math.random() * diceSides) + 1;
                            }
                            
                            // Применяем модификатор, если есть
                            if (operator && modifier) {
                              const mod = parseInt(modifier) || 0;
                              result = operator === '+' ? result + mod : result - mod;
                            }
                            
                            setDiceRollResult(result);
                            
                            // Сохраняем историю бросков
                            const rollText = `${diceFormula}: ${result}` + 
                              (diceRollDescription ? ` (${diceRollDescription})` : '');
                            
                            setDiceRollHistory(prev => [rollText, ...prev.slice(0, 9)]);
                          }
                        } catch (error) {
                          console.error('Ошибка при броске:', error);
                        }
                        setIsRollingDice(false);
                      }, 500);
                    }}
                  >
                    {isRollingDice ? 'Бросаем...' : 'Бросить'}
                  </Button>
                </div>
                
                <div>
                  <Label htmlFor="dice-description">Описание броска</Label>
                  <Input
                    id="dice-description"
                    placeholder="Атака мечом, урон и т.д."
                    value={diceRollDescription}
                    onChange={(e) => setDiceRollDescription(e.target.value)}
                  />
                </div>
                
                {diceRollResult !== null && (
                  <div className="bg-primary/10 p-4 rounded text-center">
                    <div className="text-lg font-bold">{diceRollResult}</div>
                    <div className="text-sm text-muted-foreground">{diceFormula}</div>
                    {diceRollDescription && (
                      <div className="text-sm">{diceRollDescription}</div>
                    )}
                  </div>
                )}
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>История бросков</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto py-1"
                      onClick={() => setShowDiceRollHistory(!showDiceRollHistory)}
                    >
                      {showDiceRollHistory ? 'Скрыть' : 'Показать'}
                    </Button>
                  </div>
                  
                  {showDiceRollHistory && (
                    <ScrollArea className="h-[150px] border rounded">
                      {diceRollHistory.length > 0 ? (
                        <ul className="space-y-1 p-2">
                          {diceRollHistory.map((roll, index) => (
                            <li key={index} className="text-sm py-1 border-b last:border-0">
                              {roll}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          История пуста
                        </div>
                      )}
                    </ScrollArea>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {['1d4', '1d6', '1d8', '1d10', '1d12', '1d20', '1d100', '2d6', '4d6'].map((dice) => (
                    <Button 
                      key={dice} 
                      variant="outline"
                      size="sm"
                      onClick={() => setDiceFormula(dice)}
                    >
                      {dice}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Заметки сессии</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="min-h-[300px]"
                placeholder="Важные заметки о текущей сессии..."
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Детали</CardTitle>
            </CardHeader>
            <CardContent>
              {showCharacterDetails && selectedCharacterId && (
                <div>
                  {characters && characters.find(c => c.id === selectedCharacterId) ? (
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg">
                        {characters.find(c => c.id === selectedCharacterId)?.name}
                      </h3>
                      
                      {/* Character details would go here */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Класс:</span>
                          <span>{characters.find(c => c.id === selectedCharacterId)?.class}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Уровень:</span>
                          <span>{characters.find(c => c.id === selectedCharacterId)?.level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Раса:</span>
                          <span>{characters.find(c => c.id === selectedCharacterId)?.race}</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => setShowCharacterDetails(false)}
                      >
                        Скрыть детали
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      Персонаж не найден
                    </div>
                  )}
                </div>
              )}
              
              {showNpcDetails && selectedNpcId && (
                <div>
                  {npcList && npcList.find(n => n.id === selectedNpcId) ? (
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg">
                        {npcList.find(n => n.id === selectedNpcId)?.name}
                      </h3>
                      
                      <p className="text-sm">
                        {npcList.find(n => n.id === selectedNpcId)?.description}
                      </p>
                      
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => setShowNpcDetails(false)}
                      >
                        Скрыть детали
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      НПС не найден
                    </div>
                  )}
                </div>
              )}
              
              {!showCharacterDetails && !showNpcDetails && (
                <div className="text-center p-4 text-muted-foreground">
                  Выберите персонажа или НПС для просмотра деталей
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DMSessionPage;
