
import React, { useState } from "react";
import { CharacterSheet, CharacterSpell } from "@/types/character.d";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  ShieldHalf, 
  Scroll, 
  BarChart2, 
  Backpack, 
  Palette, 
  Feather, 
  Flashlight, 
  Check, 
  X,
  Download,
  FileText,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { characterPdfGenerator } from "@/utils/characterPdfGenerator";
import { saveCharacterToDb } from "@/services/characterService";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface CharacterReviewProps {
  character: CharacterSheet;
  prevStep: () => void;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  setCurrentStep: (step: number) => void;
}

// Вспомогательные функции
const getAbilityModifier = (score: number): string => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

const renderSpellsList = (spells: CharacterSpell[] | undefined, level: number): React.ReactNode => {
  if (!spells || spells.length === 0) {
    return <p className="text-gray-500 italic">Нет заклинаний для этого уровня</p>;
  }
  
  // Преобразуем CharacterSpell в строки для отображения
  const filteredSpells = spells
    .filter(spell => spell.level === level)
    .map(spell => ({
      name: typeof spell.name === 'string' ? spell.name : 'Неизвестное заклинание',
      school: spell.school || 'Нет школы'
    }));
  
  if (filteredSpells.length === 0) {
    return <p className="text-gray-500 italic">Нет заклинаний для этого уровня</p>;
  }
  
  return (
    <div className="space-y-1">
      {filteredSpells.map((spell, index) => (
        <div key={index} className="flex items-center justify-between">
          <span>{spell.name}</span>
          <Badge variant="outline">{spell.school}</Badge>
        </div>
      ))}
    </div>
  );
};

const CharacterReview: React.FC<CharacterReviewProps> = ({
  character,
  prevStep,
  updateCharacter,
  setCurrentStep
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const handleSaveCharacter = async () => {
    try {
      setSaving(true);
      // Сохраняем персонажа в базу данных
      const saved = await saveCharacterToDb(character);
      
      if (saved) {
        toast({
          title: "Персонаж сохранен",
          description: `${character.name} успешно сохранен в вашей коллекции.`,
        });
      } else {
        throw new Error("Не удалось сохранить персонажа");
      }
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить персонажа. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true);
      await characterPdfGenerator(character);
      toast({
        title: "PDF файл создан",
        description: "Лист персонажа успешно сгенерирован и загружается.",
      });
    } catch (error) {
      console.error("Ошибка при генерации PDF:", error);
      toast({
        title: "Ошибка создания PDF",
        description: "Не удалось сгенерировать лист персонажа.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  // Функция для редактирования конкретного раздела
  const handleEditSection = (sectionId: number) => {
    setCurrentStep(sectionId);
  };

  // Функция для проверки владения навыком
  const isSkillProficient = (skillName: string): boolean => {
    if (!character.skills) return false;
    const skill = character.skills[skillName];
    return skill && skill.proficient;
  };

  // Получаем все слоты заклинаний и их использования
  const getSpellSlots = () => {
    if (!character.spellSlots) return null;
    
    const slots = [];
    for (let level = 1; level <= 9; level++) {
      const slotKey = level.toString();
      if (character.spellSlots[slotKey]) {
        slots.push({
          level,
          max: character.spellSlots[slotKey].max,
          used: character.spellSlots[slotKey].used
        });
      }
    }
    
    return slots;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">{character.name}</h1>
          <p className="text-muted-foreground">
            {character.race} {character.class}
            {character.subclass && `, ${character.subclass}`} {character.level} уровня
          </p>
        </div>
        
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={handleGeneratePDF} 
            disabled={generating}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {generating ? "Создание..." : "Скачать PDF"}
          </Button>
          
          <Button 
            onClick={handleSaveCharacter} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {saving ? "Сохранение..." : "Сохранить персонажа"}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-4">
          <TabsTrigger value="summary" className="flex items-center gap-1">
            <User className="h-4 w-4" /> 
            <span className="hidden sm:inline">Обзор</span>
          </TabsTrigger>
          <TabsTrigger value="abilities" className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" /> 
            <span className="hidden sm:inline">Характеристики</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-1">
            <ShieldHalf className="h-4 w-4" /> 
            <span className="hidden sm:inline">Навыки</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-1">
            <Feather className="h-4 w-4" /> 
            <span className="hidden sm:inline">Особенности</span>
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-1">
            <Backpack className="h-4 w-4" /> 
            <span className="hidden sm:inline">Снаряжение</span>
          </TabsTrigger>
          <TabsTrigger value="spells" className="flex items-center gap-1">
            <Scroll className="h-4 w-4" /> 
            <span className="hidden sm:inline">Заклинания</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1">
            <Palette className="h-4 w-4" /> 
            <span className="hidden sm:inline">Внешность</span>
          </TabsTrigger>
          <TabsTrigger value="background" className="flex items-center gap-1">
            <Flashlight className="h-4 w-4" /> 
            <span className="hidden sm:inline">Предыстория</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Вкладка общего обзора */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Основная информация</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditSection(7)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Изменить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Имя</dt>
                  <dd>{character.name}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Раса</dt>
                  <dd>{character.race} {character.subrace && `(${character.subrace})`}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Класс</dt>
                  <dd>
                    {character.class} {character.subclass && `(${character.subclass})`} {character.level} уровня
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Пол</dt>
                  <dd>{character.gender || "Не указан"}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Мировоззрение</dt>
                  <dd>{character.alignment || "Не указано"}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Предыстория</dt>
                  <dd>{character.background || "Не указана"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>Характеристики</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditSection(3)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Изменить
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {character.stats && Object.entries(character.stats).map(([stat, value]) => (
                    <div key={stat} className="text-center p-2 rounded-md bg-primary/10">
                      <div className="text-xs uppercase text-muted-foreground">{stat}</div>
                      <div className="font-bold text-xl">{value}</div>
                      <div className="text-sm">{getAbilityModifier(value)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>Боевые параметры</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditSection(5)} // Предположим, что это шаг с хитами
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Изменить
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Максимум HP</dt>
                    <dd className="font-medium">{character.maxHp || "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Кубик хитов</dt>
                    <dd className="font-medium">
                      {character.hitDice ? `${character.hitDice.value} (${character.hitDice.total - character.hitDice.used}/${character.hitDice.total})` : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Инициатива</dt>
                    <dd className="font-medium">
                      {character.stats ? getAbilityModifier(character.stats.dexterity) : "—"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>Владения</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditSection(4)} // Предыстория часто определяет владения
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Изменить
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Оружие и броня</h4>
                    <p className="text-sm">
                      {character.proficiencies?.weapons?.join(', ') || "Нет владений"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Инструменты</h4>
                    <p className="text-sm">
                      {character.proficiencies?.tools?.join(', ') || "Нет владений"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Языки</h4>
                    <p className="text-sm">
                      {(character.proficiencies?.languages || character.languages || []).join(', ') || "Нет языков"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Вкладка характеристик */}
        <TabsContent value="abilities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Характеристики</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditSection(3)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Изменить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {character.stats && Object.entries(character.stats).map(([stat, value]) => (
                  <div key={stat} className="flex flex-col items-center p-4 rounded-lg bg-primary/10">
                    <span className="text-sm uppercase tracking-wider text-muted-foreground">
                      {(() => {
                        switch(stat) {
                          case 'strength': return 'СИЛА';
                          case 'dexterity': return 'ЛОВКОСТЬ';
                          case 'constitution': return 'ТЕЛОСЛОЖЕНИЕ';
                          case 'intelligence': return 'ИНТЕЛЛЕКТ';
                          case 'wisdom': return 'МУДРОСТЬ';
                          case 'charisma': return 'ХАРИЗМА';
                          default: return stat;
                        }
                      })()}
                    </span>
                    <span className="text-3xl font-bold mt-1">{value}</span>
                    <span className="text-lg font-medium">{getAbilityModifier(value)}</span>
                    
                    {/* Спасброски */}
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Спасбросок:</span>
                      {character.savingThrows && character.savingThrows[stat] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Вкладка навыков */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Навыки</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditSection(4)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Изменить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Силовые навыки</h3>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {isSkillProficient('athletics') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Атлетика
                    </li>
                  </ul>
                  
                  <h3 className="font-medium mt-4 mb-2">Ловкостные навыки</h3>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {isSkillProficient('acrobatics') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Акробатика
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('sleightOfHand') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Ловкость рук
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('stealth') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Скрытность
                    </li>
                  </ul>
                  
                  <h3 className="font-medium mt-4 mb-2">Интеллектуальные навыки</h3>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {isSkillProficient('arcana') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Магия
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('history') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      История
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('investigation') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Расследование
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('nature') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Природа
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('religion') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Религия
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Мудростные навыки</h3>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {isSkillProficient('animalHandling') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Обращение с животными
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('insight') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Проницательность
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('medicine') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Медицина
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('perception') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Восприятие
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('survival') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Выживание
                    </li>
                  </ul>
                  
                  <h3 className="font-medium mt-4 mb-2">Харизматические навыки</h3>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {isSkillProficient('deception') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Обман
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('intimidation') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Запугивание
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('performance') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Выступление
                    </li>
                    <li className="flex items-center gap-2">
                      {isSkillProficient('persuasion') ? <Check className="h-4 w-4 text-green-500" /> : <span className="w-4" />} 
                      Убеждение
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Вкладка особенностей */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Особенности и черты</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditSection(4)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Изменить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="racial">
                  <AccordionTrigger>Расовые особенности</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {/* Здесь будут отображаться расовые особенности */}
                      <li>Даркви́дение: Вы привыкли к сумраку подземелий и ночному небу. Вы обладаете тёмным зрением в пределах 60 футов.</li>
                      <li>Природная стойкость: Вы совершаете с преимуществом спасброски от яда, и вы обладаете сопротивлением к урону ядом.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="class">
                  <AccordionTrigger>Классовые особенности</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {/* Здесь будут отображаться классовые особенности */}
                      {character.features?.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                      {character.features?.length === 0 && (
                        <li className="text-muted-foreground">Особенности не указаны</li>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="background">
                  <AccordionTrigger>Особенности предыстории</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {/* Здесь будут отображаться особенности предыстории */}
                      <li>Приют для верующих: Как адепт веры, вы получаете уважение тех, кто разделяет вашу веру, и можете проводить религиозные церемонии вашей веры.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Вкладка снаряжения */}
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Снаряжение</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditSection(6)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Изменить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <ul className="space-y-2">
                  {character.equipment && character.equipment.map((item, index) => (
                    <li key={index} className="p-2 rounded-md hover:bg-primary/5">
                      <span>{item}</span>
                    </li>
                  ))}
                  {!character.equipment || character.equipment.length === 0 && (
                    <li className="text-muted-foreground">Нет снаряжения</li>
                  )}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Вкладка заклинаний */}
        <TabsContent value="spells" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Заклинания</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditSection(8)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Изменить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {character.spells && character.spells.length > 0 ? (
                <div className="space-y-4">
                  {/* Заговоры */}
                  <div>
                    <h3 className="font-medium mb-2">Заговоры</h3>
                    {renderSpellsList(character.spells, 0)}
                  </div>
                  
                  {/* Слоты заклинаний */}
                  {getSpellSlots() && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Слоты заклинаний</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {getSpellSlots().map((slot) => (
                          <div key={slot.level} className="p-2 bg-primary/10 rounded-md text-center">
                            <span className="block text-xs text-muted-foreground">Уровень {slot.level}</span>
                            <span className="font-medium">{slot.max - slot.used}/{slot.max}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Заклинания по уровням */}
                  <Accordion type="single" collapsible className="w-full mt-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                      <AccordionItem key={level} value={`level-${level}`}>
                        <AccordionTrigger>Заклинания {level} уровня</AccordionTrigger>
                        <AccordionContent>
                          {renderSpellsList(character.spells, level)}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">У персонажа нет заклинаний</p>
                  {character.class && !['Варвар', 'Монах', 'Воин', 'Плут'].includes(character.class) && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => handleEditSection(8)}
                    >
                      Добавить заклинания
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Вкладка внешности */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Внешность</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditSection(7)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Изменить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Описание внешности</h3>
                  <p>{character.appearance || "Описание внешности не указано"}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Физические характеристики</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">Возраст</dt>
                      <dd>{character.age || "Не указан"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Рост</dt>
                      <dd>{character.height || "Не указан"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Вес</dt>
                      <dd>{character.weight || "Не указан"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Глаза</dt>
                      <dd>{character.eyes || "Не указаны"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Кожа</dt>
                      <dd>{character.skin || "Не указана"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Волосы</dt>
                      <dd>{character.hair || "Не указаны"}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Вкладка предыстории */}
        <TabsContent value="background" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Предыстория и личность</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditSection(4)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Изменить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Черты характера</h3>
                    <p>{character.personalityTraits || "Не указаны"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Идеалы</h3>
                    <p>{character.ideals || "Не указаны"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Привязанности</h3>
                    <p>{character.bonds || "Не указаны"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Слабости</h3>
                    <p>{character.flaws || "Не указаны"}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Предыстория</h3>
                  <p className="whitespace-pre-line">{character.backstory || "История персонажа не указана"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NavigationButtons
        allowNext={true}
        nextStep={() => {}} // Здесь нет следующего шага
        prevStep={prevStep}
        isFirstStep={false}
        isLastStep={true}
        hideNextButton={true}
      />
    </div>
  );
};

export default CharacterReview;
