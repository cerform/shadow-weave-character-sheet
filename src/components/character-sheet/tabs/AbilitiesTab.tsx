import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Character } from '@/types/character';
import { calculateProficiencyBonus, getAbilityModifier } from '@/utils/characterUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Minus, Shield, Brain, Footprints } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const ABILITY_NAMES = {
  strength: "Сила",
  dexterity: "Ловкость",
  constitution: "Телосложение",
  intelligence: "Интеллект",
  wisdom: "Мудрость",
  charisma: "Харизма"
};

const ABILITY_DESCRIPTIONS = {
  strength: "Физическая мощь, атлетизм и грубая сила",
  dexterity: "Проворство, рефлексы и равновесие",
  constitution: "Выносливость, жизненная сила и здоровье",
  intelligence: "Память, рассудительность и дедукция",
  wisdom: "Восприятие, интуиция и проницательность",
  charisma: "Сила личности, убедительность и лидерство"
};

const SKILLS = {
  acrobatics: { name: "Акробатика", ability: "dexterity" },
  animalHandling: { name: "Обращение с животными", ability: "wisdom" },
  arcana: { name: "Магия", ability: "intelligence" },
  athletics: { name: "Атлетика", ability: "strength" },
  deception: { name: "Обман", ability: "charisma" },
  history: { name: "История", ability: "intelligence" },
  insight: { name: "Проницательность", ability: "wisdom" },
  intimidation: { name: "Запугивание", ability: "charisma" },
  investigation: { name: "Расследование", ability: "intelligence" },
  medicine: { name: "Медицина", ability: "wisdom" },
  nature: { name: "Природа", ability: "intelligence" },
  perception: { name: "Восприятие", ability: "wisdom" },
  performance: { name: "Выступление", ability: "charisma" },
  persuasion: { name: "Убеждение", ability: "charisma" },
  religion: { name: "Религия", ability: "intelligence" },
  sleightOfHand: { name: "Ловкость рук", ability: "dexterity" },
  stealth: { name: "Скрытность", ability: "dexterity" },
  survival: { name: "Выживание", ability: "wisdom" }
};

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("abilities");
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [skillBonus, setSkillBonus] = useState<number>(0);
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Вычисляем бонус мастерства
  const proficiencyBonus = useMemo(() => {
    return calculateProficiencyBonus(character.level || 1);
  }, [character.level]);

  // Обработчик изменения значения характеристики
  const handleAbilityChange = (ability: string, value: number) => {
    if (value < 1) value = 1;
    if (value > 30) value = 30;
    
    onUpdate({ [ability]: value });
  };

  // Обработчик переключения владения спасброском
  const toggleSavingThrowProficiency = (ability: string) => {
    const currentProficiencies = character.savingThrowProficiencies || [];
    
    if (currentProficiencies.includes(ability)) {
      onUpdate({
        savingThrowProficiencies: currentProficiencies.filter(a => a !== ability)
      });
    } else {
      onUpdate({
        savingThrowProficiencies: [...currentProficiencies, ability]
      });
    }
  };

  // Обработчик переключения владения навыком
  const toggleSkillProficiency = (skill: string) => {
    const currentProficiencies = character.skillProficiencies || [];
    const currentExpertise = character.expertise || [];
    
    // Если уже есть экспертиза, удаляем и навык и экспертизу
    if (currentExpertise.includes(skill)) {
      onUpdate({
        skillProficiencies: currentProficiencies.filter(s => s !== skill),
        expertise: currentExpertise.filter(s => s !== skill)
      });
    }
    // Если есть владение, но нет экспертизы, добавляем экспертизу
    else if (currentProficiencies.includes(skill)) {
      onUpdate({
        expertise: [...currentExpertise, skill]
      });
    }
    // Если нет ни владения, ни экспертизы, добавляем владение
    else {
      onUpdate({
        skillProficiencies: [...currentProficiencies, skill]
      });
    }
  };

  // Обработчик добавления бонуса к навыку
  const addSkillBonus = (skill: string, bonus: number) => {
    const currentBonuses = character.skillBonuses || {};
    
    onUpdate({
      skillBonuses: {
        ...currentBonuses,
        [skill]: bonus
      }
    });
    
    setEditingSkill(null);
    
    toast({
      title: "Бонус добавлен",
      description: `Бонус ${bonus > 0 ? '+' : ''}${bonus} добавлен к навыку ${SKILLS[skill as keyof typeof SKILLS].name}`
    });
  };

  // Получаем модификатор характеристики
  const getModifier = (ability: string): number => {
    const abilityScore = character[ability as keyof Character] as number || 10;
    return getAbilityModifier(abilityScore);
  };

  // Получаем бонус спасброска
  const getSavingThrowBonus = (ability: string): number => {
    const abilityModifier = getModifier(ability);
    const isProficient = character.savingThrowProficiencies?.includes(ability) || false;
    
    return abilityModifier + (isProficient ? proficiencyBonus : 0);
  };

  // Получаем бонус навыка
  const getSkillBonus = (skill: string): number => {
    const skillInfo = SKILLS[skill as keyof typeof SKILLS];
    const abilityModifier = getModifier(skillInfo.ability);
    const isProficient = character.skillProficiencies?.includes(skill) || false;
    const isExpert = character.expertise?.includes(skill) || false;
    const additionalBonus = character.skillBonuses?.[skill] || 0;
    
    return abilityModifier + 
           (isProficient ? proficiencyBonus : 0) + 
           (isExpert ? proficiencyBonus : 0) + 
           additionalBonus;
  };

  // Получаем статус владения навыком
  const getSkillProficiencyStatus = (skill: string): 'none' | 'proficient' | 'expert' => {
    const isProficient = character.skillProficiencies?.includes(skill) || false;
    const isExpert = character.expertise?.includes(skill) || false;
    
    if (isExpert) return 'expert';
    if (isProficient) return 'proficient';
    return 'none';
  };

  // Форматируем бонус для отображения
  const formatBonus = (bonus: number): string => {
    return bonus >= 0 ? `+${bonus}` : `${bonus}`;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="abilities" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="abilities">Характеристики</TabsTrigger>
          <TabsTrigger value="saves">Спасброски</TabsTrigger>
          <TabsTrigger value="skills">Навыки</TabsTrigger>
        </TabsList>
        
        {/* Вкладка характеристик */}
        <TabsContent value="abilities" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(ABILITY_NAMES).map(([ability, name]) => (
              <Card key={ability} className="overflow-hidden">
                <CardHeader className="p-3 bg-accent/10">
                  <CardTitle className="text-center text-lg">{name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center items-center mb-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-r-none"
                      onClick={() => handleAbilityChange(ability, (character[ability as keyof Character] as number || 10) - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="px-4 py-1 border-y border-x-0 text-xl font-bold">
                      {Number(character[ability as keyof Character]) || 10}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-l-none"
                      onClick={() => handleAbilityChange(ability, (character[ability as keyof Character] as number || 10) + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatBonus(getModifier(ability))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {ABILITY_DESCRIPTIONS[ability as keyof typeof ABILITY_DESCRIPTIONS]}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Properly render character skills as a ReactNode */}
          {character.skills && typeof character.skills === 'object' && character.skills !== null ? (
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium">Character Skills:</h4>
              {Object.entries(character.skills).map(([skill, value]) => (
                <div key={skill} className="text-sm p-2 border rounded">
                  <span className="font-medium">{skill}:</span>{' '}
                  {typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : String(value)}
                </div>
              ))}
            </div>
          ) : null}
          
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-lg">Пассивные характеристики</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground">Пассивное восприятие</div>
                  <div className="text-2xl font-bold">
                    {10 + getSkillBonus('perception')}
                  </div>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground">Пассивное расследование</div>
                  <div className="text-2xl font-bold">
                    {10 + getSkillBonus('investigation')}
                  </div>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground">Пассивная проницательность</div>
                  <div className="text-2xl font-bold">
                    {10 + getSkillBonus('insight')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Вкладка спасбросков */}
        <TabsContent value="saves">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Спасброски
                <Badge className="ml-auto">Бонус мастерства: {formatBonus(proficiencyBonus)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {Object.entries(ABILITY_NAMES).map(([ability, name]) => {
                  const isProficient = character.savingThrowProficiencies?.includes(ability) || false;
                  const bonus = getSavingThrowBonus(ability);
                  
                  return (
                    <div 
                      key={ability} 
                      className={cn(
                        "flex items-center p-2 rounded-md",
                        isProficient ? "bg-accent/20" : "hover:bg-muted/50"
                      )}
                      onClick={() => toggleSavingThrowProficiency(ability)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center mr-3",
                        isProficient ? "bg-primary text-primary-foreground" : "border"
                      )}>
                        {isProficient && <Check className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-muted-foreground">
                          {ABILITY_DESCRIPTIONS[ability as keyof typeof ABILITY_DESCRIPTIONS]}
                        </div>
                      </div>
                      <div className="text-xl font-bold">
                        {formatBonus(bonus)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Вкладка навыков */}
        <TabsContent value="skills">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Навыки
                <Badge className="ml-auto">Бонус мастерства: {formatBonus(proficiencyBonus)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-1">
                  {Object.entries(SKILLS).map(([skillKey, skill]) => {
                    const profStatus = getSkillProficiencyStatus(skillKey);
                    const bonus = getSkillBonus(skillKey);
                    const additionalBonus = character.skillBonuses?.[skillKey] || 0;
                    
                    return (
                      <div 
                        key={skillKey} 
                        className={cn(
                          "flex items-center p-2 rounded-md",
                          profStatus === 'expert' ? "bg-primary/20" : 
                          profStatus === 'proficient' ? "bg-accent/20" : 
                          "hover:bg-muted/50"
                        )}
                      >
                        <div 
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center mr-3",
                            profStatus === 'expert' ? "bg-primary text-primary-foreground" : 
                            profStatus === 'proficient' ? "bg-accent text-accent-foreground" : 
                            "border"
                          )}
                          onClick={() => toggleSkillProficiency(skillKey)}
                          style={{ cursor: 'pointer' }}
                        >
                          {profStatus !== 'none' && <Check className="h-4 w-4" />}
                          {profStatus === 'expert' && <span className="absolute -bottom-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full w-3 h-3 flex items-center justify-center">+</span>}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex items-center">
                            {skill.name}
                            <span className="text-xs text-muted-foreground ml-2">
                              ({ABILITY_NAMES[skill.ability as keyof typeof ABILITY_NAMES]})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {additionalBonus !== 0 && (
                            <Badge variant="outline" className="mr-2">
                              {formatBonus(additionalBonus)}
                            </Badge>
                          )}
                          <div className="text-xl font-bold mr-2">
                            {formatBonus(bonus)}
                          </div>
                          <Popover open={editingSkill === skillKey} onOpenChange={(open) => {
                            if (open) setEditingSkill(skillKey);
                            else setEditingSkill(null);
                          }}>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-4">
                                <h4 className="font-medium">Добавить бонус к навыку</h4>
                                <div className="space-y-2">
                                  <Label htmlFor="bonus">Бонус</Label>
                                  <Input 
                                    id="bonus" 
                                    type="number" 
                                    value={skillBonus} 
                                    onChange={(e) => setSkillBonus(parseInt(e.target.value) || 0)}
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <Button onClick={() => addSkillBonus(skillKey, skillBonus)}>
                                    Добавить
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      {/* Секция особенностей и умений */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Footprints className="mr-2 h-5 w-5" />
          Особенности и умения
        </h3>
        
        <Accordion type="multiple" className="w-full">
          {/* Особенности расы */}
          <AccordionItem value="race-features">
            <AccordionTrigger>
              Особенности расы
              {character.race && <Badge variant="outline" className="ml-2">{character.race}</Badge>}
            </AccordionTrigger>
            <AccordionContent>
              {character.raceFeatures && character.raceFeatures.length > 0 ? (
                <div className="space-y-2">
                  {character.raceFeatures.map((feature, index) => {
                    // Проверяем, что feature является объектом и имеет свойство name
                    if (feature && typeof feature === 'object' && 'name' in feature) {
                      return (
                        <div key={index} className="p-2 border rounded-md">
                          <div className="font-medium">{feature.name}</div>
                          {feature.description && (
                            <div className="text-sm text-muted-foreground">
                              {feature.description}
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    // Для случая, когда feature является строкой
                    if (typeof feature === 'string') {
                      return (
                        <div key={index} className="p-2 border rounded-md">
                          {feature}
                        </div>
                      );
                    }
                    
                    // Возвращаем null для невалидных данных
                    return null;
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Нет особенностей расы
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          
          {/* Особенности класса */}
          <AccordionItem value="class-features">
            <AccordionTrigger>
              Особенности класса
              {character.class && <Badge variant="outline" className="ml-2">{character.class}</Badge>}
            </AccordionTrigger>
            <AccordionContent>
              {character.classFeatures && character.classFeatures.length > 0 ? (
                <div className="space-y-2">
                  {character.classFeatures.map((feature, index) => {
                    // Проверяем, что feature является объектом и имеет свойство name
                    if (feature && typeof feature === 'object' && 'name' in feature) {
                      return (
                        <div key={index} className="p-2 border rounded-md">
                          <div className="font-medium">{feature.name}</div>
                          {feature.description && (
                            <div className="text-sm text-muted-foreground">
                              {feature.description}
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    // Для случая, когда feature является строкой
                    if (typeof feature === 'string') {
                      return (
                        <div key={index} className="p-2 border rounded-md">
                          {feature}
                        </div>
                      );
                    }
                    
                    // Возвращаем null для невалидных данных
                    return null;
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Нет особенностей класса
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          
          {/* Особенности предыстории */}
          <AccordionItem value="background-features">
            <AccordionTrigger>
              Особенности предыстории
              {character.background && <Badge variant="outline" className="ml-2">{character.background}</Badge>}
            </AccordionTrigger>
            <AccordionContent>
              {character.backgroundFeatures && character.backgroundFeatures.length > 0 ? (
                <div className="space-y-2">
                  {character.backgroundFeatures.map((feature, index) => {
                    // Проверяем, что feature является объектом и имеет свойство name
                    if (feature && typeof feature === 'object' && 'name' in feature) {
                      return (
                        <div key={index} className="p-2 border rounded-md">
                          <div className="font-medium">{feature.name}</div>
                          {feature.description && (
                            <div className="text-sm text-muted-foreground">
                              {feature.description}
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    // Для случая, когда feature является строкой
                    if (typeof feature === 'string') {
                      return (
                        <div key={index} className="p-2 border rounded-md">
                          {feature}
                        </div>
                      );
                    }
                    
                    // Возвращаем null для невалидных данных
                    return null;
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Нет особенностей предыстории
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          
          {/* Черты */}
          <AccordionItem value="feats">
            <AccordionTrigger>
              Черты
              {character.feats && <Badge variant="outline" className="ml-2">{character.feats.length}</Badge>}
            </AccordionTrigger>
            <AccordionContent>
              {character.feats && character.feats.length > 0 ? (
                <div className="space-y-2">
                  {character.feats.map((feat, index) => {
                    // Проверяем, что feat является объектом и имеет свойство name
                    if (feat && typeof feat === 'object' && 'name' in feat) {
                      return (
                        <div key={index} className="p-2 border rounded-md">
                          <div className="font-medium">{feat.name}</div>
                          {feat.description && (
                            <div className="text-sm text-muted-foreground">
                              {feat.description}
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    // Для случая, когда feat является строкой
                    if (typeof feat === 'string') {
                      return (
                        <div key={index} className="p-2 border rounded-md">
                          {feat}
                        </div>
                      );
                    }
                    
                    // Возвращаем null для невалидных данных
                    return null;
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Нет черт
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default AbilitiesTab;
