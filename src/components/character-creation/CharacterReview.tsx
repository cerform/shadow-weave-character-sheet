import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CharacterSheet } from '@/types/character.d';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Save, Eye, Edit, Info, Check, AlertTriangle, Bookmark, BookOpen, Shield, Swords, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/services/firebase';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ExtendedTooltipContent
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CharacterContext } from '@/contexts/CharacterContext';
import { useContext } from 'react';
import { getModifierFromAbilityScore } from '@/utils/characterUtils';
import NavigationButtons from './NavigationButtons';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { isOfflineMode } from '@/utils/authHelpers';
import { CharacterSpell } from '@/types/character';

interface CharacterReviewProps {
  character: CharacterSheet;
  prevStep: () => void;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  setCurrentStep: (step: number) => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({ 
  character, 
  prevStep, 
  updateCharacter, 
  setCurrentStep 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const { saveCurrentCharacter } = useContext(CharacterContext);

  // Функция для валидации персонажа перед сохранением
  const validateCharacter = () => {
    if (!character.name || !character.name.trim()) {
      toast({
        title: "Отсутствует имя персонажа",
        description: "Пожалуйста, укажите имя для вашего персонажа",
        variant: "destructive"
      });
      setCurrentStep(7); // Переход к шагу с базовой информацией
      return false;
    }
    
    if (!character.race) {
      toast({
        title: "Не выбрана раса",
        description: "Пожалуйста, выберите расу для вашего персонажа",
        variant: "destructive"
      });
      setCurrentStep(0); // Переход к шагу выбора расы
      return false;
    }
    
    if (!character.class) {
      toast({
        title: "Не выбран класс",
        description: "Пожалуйста, выберите класс для вашего персонажа",
        variant: "destructive"
      });
      setCurrentStep(1); // Переход к шагу выбора класса
      return false;
    }
    
    if (!character.abilities || 
        !character.abilities.strength || 
        !character.abilities.dexterity || 
        !character.abilities.constitution || 
        !character.abilities.intelligence || 
        !character.abilities.wisdom || 
        !character.abilities.charisma) {
      toast({
        title: "Не распредел��ны характеристики",
        description: "Пожалуйста, распределите значения характеристик",
        variant: "destructive"
      });
      setCurrentStep(3); // Переход к шагу распределения характеристик
      return false;
    }
    
    if (!character.maxHp || character.maxHp <= 0) {
      toast({
        title: "Не рассчитаны хиты",
        description: "Пожалуйста, рассчитайте хиты вашего персонажа",
        variant: "destructive"
      });
      setCurrentStep(5); // Переход к шагу расчёта хитов
      return false;
    }
    
    return true;
  };

  // Функция для перехода к редактированию определенного шага
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Функция для сохранения персонажа в базу данных
  const saveCharacter = async () => {
    // Проверка валидации
    if (!validateCharacter()) {
      return;
    }
    
    setIsSaving(true);
    try {
      // Присваиваем ID персонажу, если его нет
      const characterId = character.id || uuidv4();
      
      // Обновляем персонажа с ID
      if (!character.id) {
        updateCharacter({ id: characterId });
      }
      
      // Проверяем авторизацию
      const currentUser = auth.currentUser;
      console.log("Текущий пользователь:", currentUser ? currentUser.email : "Не авторизован");
      
      // Добавляем userId к персонажу, если пользователь авторизован
      if (currentUser) {
        console.log("Сохраняем персонажа для пользователя:", currentUser.uid);
        updateCharacter({ userId: currentUser.uid });
      } else {
        console.log("Пользователь не авторизован, сохраняем локально");
      }
      
      // Сохраняем в локальное хранилище
      const savedCharacters = localStorage.getItem('dnd-characters');
      let characters = savedCharacters ? JSON.parse(savedCharacters) : [];
      
      // Если персонаж с таким ID уже существует, заменяем его
      const existingIndex = characters.findIndex((c: any) => c.id === characterId);
      
      // Устанавливаем текущие HP равными максимальным при создании
      if (!character.currentHp) {
        character.currentHp = character.maxHp;
      }
      
      const characterWithTimestamp = {
        ...character, 
        id: characterId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        characters[existingIndex] = characterWithTimestamp;
      } else {
        characters.push(characterWithTimestamp);
      }
      
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
      localStorage.setItem('last-selected-character', characterId);
      
      console.log("Персонаж сохранен локально:", characterId);
      
      // Сохраняем через контекст для синхронизации с Firebase
      if (saveCurrentCharacter) {
        await saveCurrentCharacter();
      }
      
      toast({
        title: "Персонаж создан",
        description: `${character.name} теперь готов к приключениям!`,
      });
      
      // Переходим к просмотру персонажа с небольшой задержкой
      setTimeout(() => {
        navigate('/character/' + characterId);
      }, 500);
      
    } catch (error) {
      console.error("Ошибка сохранения персонажа:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить персонажа. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      setSaveDialogOpen(false);
    }
  };

  // Функция для просмотра персонажа
  const viewCharacter = () => {
    // Валидация перед просмотром
    if (!validateCharacter()) {
      return;
    }
    
    // Пробуем сначала сохранить персонажа, если у него нет ID
    if (!character.id) {
      saveCharacter();
    } else {
      // Если у персонажа есть ID, переходим к его просмотру
      navigate(`/character/${character.id}`);
    }
  };
  
  // Функция для форматирования модификатора способности
  const formatModifier = (score: number) => {
    const mod = getModifierFromAbilityScore(score);
    if (typeof mod === 'number') {
      return mod >= 0 ? `+${mod}` : `${mod}`;
    }
    return mod;
  };
  
  // Проверка, является ли пользователь мастером
  const isDM = isOfflineMode() || (auth.currentUser && auth.currentUser.uid && auth.currentUser.uid !== '');
  
  const handleStartSession = () => {
    if (!character.id) {
      toast({
        title: "Требуется сохранение",
        description: "Пожалуйста, сначала сохраните персонажа",
        variant: "destructive"
      });
      return;
    }
    
    // Сохраняем ID в localStorage для использования в сессии
    localStorage.setItem("session-character-id", character.id);
    
    navigate("/create-session");
  };

  // Вспомогательная функция для безопасной проверки заклинаний
  const isSpellMatchingType = (spell: any, type: string): boolean => {
    if (!spell || !spell.name) return false;
    const spellName = spell.name.toLowerCase();
    return spellName.includes(type.toLowerCase());
  };

  // Выводим информацию по вкладкам для лучшей организации
  return (
    <div className="space-y-6 min-h-[600px] relative pb-20">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Check className="size-5" />
        Просмотр и завершение создания
      </h2>
      
      <div className="p-4 bg-primary/10 rounded-lg mb-6 flex items-center gap-3">
        <Info className="size-5 text-primary" />
        <p className="text-sm">
          Проверьте созданного персонажа перед сохранением. После сохранения вы сможете просмотреть и отредактировать 
          его в разделе "Мои персонажи".
        </p>
      </div>
      
      <div className="relative">
        <div className="absolute top-0 right-0 flex gap-2 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 h-auto"
                  style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}
                  onClick={() => goToStep(0)}
                >
                  <Edit className="size-3.5" />
                  <span className="text-xs">Раса</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Редактировать расу персонажа</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 h-auto"
                  style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}
                  onClick={() => goToStep(1)}
                >
                  <Edit className="size-3.5" />
                  <span className="text-xs">Класс</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Редактировать класс персонажа</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 h-auto"
                  style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}
                  onClick={() => goToStep(3)}
                >
                  <Edit className="size-3.5" />
                  <span className="text-xs">Характеристики</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Редактировать характеристики персонажа</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="basic">Основное</TabsTrigger>
            <TabsTrigger value="abilities">Характеристики</TabsTrigger>
            <TabsTrigger value="features">Особенности</TabsTrigger>
            <TabsTrigger value="equipment">Снаряжение</TabsTrigger>
            <TabsTrigger value="spells">Заклинания</TabsTrigger>
          </TabsList>
          
          {/* Вкладка с основной информацией */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="p-6 bg-primary/5 border border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold border-b border-primary/10 pb-2 flex items-center gap-2">
                    <Bookmark className="size-4" />
                    Базовая информация
                  </h3>
                  
                  <div className="grid grid-cols-[120px_1fr] gap-y-2">
                    <div className="font-medium">Имя:</div>
                    <div>{character.name || <span className="text-red-400">Не указано</span>}</div>
                    
                    <div className="font-medium">Пол:</div>
                    <div>{character.gender || "Не указан"}</div>
                    
                    <div className="font-medium">Раса:</div>
                    <div className="flex items-center gap-2">
                      {character.race}
                      {character.subrace && <Badge variant="outline">{character.subrace}</Badge>}
                    </div>
                    
                    <div className="font-medium">Класс:</div>
                    <div className="flex items-center gap-2">
                      {character.class}
                      {character.subclass && <Badge variant="outline">{character.subclass}</Badge>}
                    </div>
                    
                    <div className="font-medium">Уровень:</div>
                    <div>{character.level || 1}</div>
                    
                    <div className="font-medium">Предыстория:</div>
                    <div>{character.background || "Не указана"}</div>
                    
                    <div className="font-medium">Мировоззрение:</div>
                    <div>{character.alignment || "Не указано"}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold border-b border-primary/10 pb-2 flex items-center gap-2">
                    <Shield className="size-4" />
                    Боевые параметры
                  </h3>
                  
                  <div className="grid grid-cols-[140px_1fr] gap-y-2">
                    <div className="font-medium">Класс доспеха:</div>
                    <div>{10 + Math.floor((character.abilities?.dexterity || 10) - 10) / 2}</div>
                    
                    <div className="font-medium">Максимум хитов:</div>
                    <div>
                      {character.maxHp || 
                      <span className="text-red-400">Не рассчитано</span>}
                    </div>
                    
                    <div className="font-medium">Кубик хитов:</div>
                    <div>
                      {(() => {
                        switch(character.class) {
                          case "Варвар": return `d12`;
                          case "Воин": case "Паладин": case "Следопыт": return `d10`;
                          case "Жрец": case "Друид": case "Монах": case "Плут": case "Бард": case "Колдун": case "Чернокнижник": return `d8`;
                          case "Волшебник": case "Чародей": return `d6`;
                          default: return `d8`;
                        }
                      })()}
                    </div>
                    
                    <div className="font-medium">Бонус мастерства:</div>
                    <div>+{Math.ceil(2 + ((character.level || 1) - 1) / 4)}</div>
                    
                    <div className="font-medium">Инициатива:</div>
                    <div>{formatModifier(character.abilities?.dexterity || 10)}</div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Дополнительная информация о внешности и предыстории */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="appearance">
                <AccordionTrigger className="text-base font-medium">
                  Внешность и характер
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 px-4 py-2">
                    <div>
                      <p className="font-medium mb-1">Внешность:</p>
                      <p className="text-sm">{character.appearance || "Не указана"}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-1">Черты характера:</p>
                      <p className="text-sm">{character.personalityTraits || "Не указаны"}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-1">Идеалы:</p>
                      <p className="text-sm">{character.ideals || "Не указаны"}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-1">Привязанности:</p>
                      <p className="text-sm">{character.bonds || "Не указаны"}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-1">Слабости:</p>
                      <p className="text-sm">{character.flaws || "Не указаны"}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="backstory">
                <AccordionTrigger className="text-base font-medium">
                  Предыстория
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 py-2">
                    <p className="text-sm whitespace-pre-wrap">{character.backstory || "История персонажа не указана"}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          {/* Вкладка с характеристиками */}
          <TabsContent value="abilities" className="space-y-6">
            <Card className="p-6 bg-primary/5 border border-primary/20">
              <h3 className="text-lg font-semibold border-b border-primary/10 pb-2 mb-4 flex items-center gap-2">
                <BookOpen className="size-4" />
                Характеристики
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 text-center rounded-lg border border-primary/20 bg-card/10">
                        <p className="font-medium text-sm text-primary/80">СИЛА</p>
                        <p className="text-2xl font-bold">
                          {character.abilities?.STR || character.abilities?.strength || 10}
                        </p>
                        <p className="text-sm">
                          {formatModifier(character.abilities?.STR || character.abilities?.strength || 10)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <ExtendedTooltipContent style={{ borderColor: currentTheme.accent }}>
                      <p className="font-bold mb-1">Сила</p>
                      <p className="text-xs opacity-80 mb-2">Физическая мощь и атлетические способности</p>
                      <ul className="text-xs space-y-1">
                        <li>• Рукопашные атаки</li>
                        <li>• Подъем, толкание и ломание</li>
                        <li>• Атлетика</li>
                      </ul>
                    </ExtendedTooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 text-center rounded-lg border border-primary/20 bg-card/10">
                        <p className="font-medium text-sm text-primary/80">ЛОВКОСТЬ</p>
                        <p className="text-2xl font-bold">
                          {character.abilities?.DEX || character.abilities?.dexterity || 10}
                        </p>
                        <p className="text-sm">
                          {formatModifier(character.abilities?.DEX || character.abilities?.dexterity || 10)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <ExtendedTooltipContent style={{ borderColor: currentTheme.accent }}>
                      <p className="font-bold mb-1">Ловкость</p>
                      <p className="text-xs opacity-80 mb-2">Проворство, рефлексы и равновесие</p>
                      <ul className="text-xs space-y-1">
                        <li>• Дальнобойные атаки</li>
                        <li>• Инициатива</li>
                        <li>• Акробатика, ловкость рук</li>
                        <li>• Скрытность</li>
                      </ul>
                    </ExtendedTooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 text-center rounded-lg border border-primary/20 bg-card/10">
                        <p className="font-medium text-sm text-primary/80">ТЕЛОСЛОЖЕНИЕ</p>
                        <p className="text-2xl font-bold">
                          {character.abilities?.CON || character.abilities?.constitution || 10}
                        </p>
                        <p className="text-sm">
                          {formatModifier(character.abilities?.CON || character.abilities?.constitution || 10)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <ExtendedTooltipContent style={{ borderColor: currentTheme.accent }}>
                      <p className="font-bold mb-1">Телосложение</p>
                      <p className="text-xs opacity-80 mb-2">Здоровье, выносливость и жизненные силы</p>
                      <ul className="text-xs space-y-1">
                        <li>• Хиты за уровень</li>
                        <li>• Концентрация на заклинаниях</li>
                        <li>• Сопротивление ядам</li>
                      </ul>
                    </ExtendedTooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 text-center rounded-lg border border-primary/20 bg-card/10">
                        <p className="font-medium text-sm text-primary/80">ИНТЕЛЛЕКТ</p>
                        <p className="text-2xl font-bold">
                          {character.abilities?.INT || character.abilities?.intelligence || 10}
                        </p>
                        <p className="text-sm">
                          {formatModifier(character.abilities?.INT || character.abilities?.intelligence || 10)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <ExtendedTooltipContent style={{ borderColor: currentTheme.accent }}>
                      <p className="font-bold mb-1">Интеллект</p>
                      <p className="text-xs opacity-80 mb-2">Рассуждение и память</p>
                      <ul className="text-xs space-y-1">
                        <li>• Заклинания волшебников</li>
                        <li>• Расследование, история</li>
                        <li>• Природа, религия, магия</li>
                      </ul>
                    </ExtendedTooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 text-center rounded-lg border border-primary/20 bg-card/10">
                        <p className="font-medium text-sm text-primary/80">МУДРОСТЬ</p>
                        <p className="text-2xl font-bold">
                          {character.abilities?.WIS || character.abilities?.wisdom || 10}
                        </p>
                        <p className="text-sm">
                          {formatModifier(character.abilities?.WIS || character.abilities?.wisdom || 10)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <ExtendedTooltipContent style={{ borderColor: currentTheme.accent }}>
                      <p className="font-bold mb-1">Мудрость</p>
                      <p className="text-xs opacity-80 mb-2">Внимательность и интуиция</p>
                      <ul className="text-xs space-y-1">
                        <li>• Заклинания жрецов, друидов</li>
                        <li>• Внимательность, проницательность</li>
                        <li>• Уход за животными, медицина</li>
                        <li>• Выживание</li>
                      </ul>
                    </ExtendedTooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 text-center rounded-lg border border-primary/20 bg-card/10">
                        <p className="font-medium text-sm text-primary/80">ХАРИЗМА</p>
                        <p className="text-2xl font-bold">
                          {character.abilities?.CHA || character.abilities?.charisma || 10}
                        </p>
                        <p className="text-sm">
                          {formatModifier(character.abilities?.CHA || character.abilities?.charisma || 10)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <ExtendedTooltipContent style={{ borderColor: currentTheme.accent }}>
                      <p className="font-bold mb-1">Харизма</p>
                      <p className="text-xs opacity-80 mb-2">Сила личности, обаяние и лидерство</p>
                      <ul className="text-xs space-y-1">
                        <li>• Заклинания бардов, чародеев, паладинов</li>
                        <li>• Обман, запугивание, убеждение</li>
                        <li>• Выступление</li>
                      </ul>
                    </ExtendedTooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Владение навыками */}
              <div className="mt-6">
                <h4 className="font-medium border-b border-primary/10 pb-2 mb-3">Владение навыками:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {character.skills && Object.keys(character.skills).map((skillName, index) => {
                    // Правильный способ проверки владения навыком
                    const skill = character.skills?.[skillName];
                    const isProficient = skill?.proficient === true;
                    
                    if (isProficient) {
                      return (
                        <div key={index} className="py-1 px-3 bg-primary/5 rounded flex items-center gap-1.5">
                          <Check className="size-3.5 text-primary/80" />
                          <span className="text-sm">{skillName}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  
                  {(!character.skills || Object.keys(character.skills).length === 0) && (
                    <div className="text-sm text-muted-foreground">Нет выбранных навыков</div>
                  )}
                </div>
              </div>
              
              {/* Владение языками */}
              <div className="mt-6">
                <h4 className="font-medium border-b border-primary/10 pb-2 mb-3">Владение языками:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {character.languages && character.languages.map((language, index) => (
                    <div key={index} className="py-1 px-3 bg-primary/5 rounded flex items-center gap-1.5">
                      <span className="text-sm">{language}</span>
                    </div>
                  ))}
                  
                  {(!character.languages || character.languages.length === 0) && (
                    <div className="text-sm text-muted-foreground">Нет известных языков</div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Вкладка с особенностями */}
          <TabsContent value="features" className="space-y-6">
            <Card className="p-6 bg-primary/5 border border-primary/20">
              <h3 className="text-lg font-semibold border-b border-primary/10 pb-2 mb-4 flex items-center gap-2">
                <BookOpen className="size-4" />
                Особенности и черты
              </h3>
              
              <div className="space-y-5">
                {/* Особенности расы */}
                <div>
                  <h4 className="font-medium text-primary/90 mb-2">
                    Расовые особенности {character.subrace ? `(${character.subrace})` : ''}
                  </h4>
                  <div className="space-y-2">
                    {/* Здесь отображаются расовые особенности */}
                    <div className="py-2 px-3 bg-card/10 rounded-md border border-primary/20">
                      <p className="text-sm font-medium mb-1">Черты расы {character.race}</p>
                      <p className="text-xs opacity-80">
                        {character.race === "Эльф" && "Тёмное зрение 60 футов, Наследие фей, Транс"}
                        {character.race === "Дварф" && "Тёмное зрение 60 футов, Дварфская устойчивость, Дварфский боевой тренинг"}
                        {character.race === "Человек" && "Универсальное увеличение характеристик, Дополнительный язык"}
                        {character.race === "Полурослик" && "Удачливый, Храбрость, Ловкость полуросликов"}
                        {character.race === "Драконорождённый" && "Наследие драконов, Сопротивление, Оружие дыхания"}
                        {character.race === "Гном" && "Тёмное зрение 60 футов, Гномья хитрость, Природная иллюзия"}
                        {character.race === "Полуэльф" && "Тёмное зрение 60 футов, Наследие фей, Универсальность"}
                        {character.race === "Полуорк" && "Тёмное зрение 60 футов, Грозный, Неукротимость, Дикие атаки"}
                        {character.race === "Тифлинг" && "Тёмное зрение 60 футов, Адское сопротивление, Дьявольское наследие"}
                        {!["Эльф", "Дварф", "Человек", "Полурослик", "Драконорождённый", "Гном", "Полуэльф", "Полуорк", "Тифлинг"].includes(character.race || "") && 
                          "Информация о расовых особенностях будет добавлена при сохранении персонажа"
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Особенности класса */}
                <div>
                  <h4 className="font-medium text-primary/90 mb-2">
                    Классовые особенности {character.subclass ? `(${character.subclass})` : ''}
                  </h4>
                  <div className="space-y-2">
                    {/* Особенности в зависимости от уровня */}
                    <div className="py-2 px-3 bg-card/10 rounded-md border border-primary/20">
                      <p className="text-sm font-medium mb-1">Особенности {character.level} уровня</p>
                      <p className="text-xs opacity-80">
                        {character.class === "Воин" && character.level >= 1 && "Боевой стиль, Второе дыхание"}
                        {character.class === "Воин" && character.level >= 2 && ", Всплеск действий"}
                        {character.class === "Варвар" && character.level >= 1 && "Ярость, Защита без доспехов"}
                        {character.class === "Варвар" && character.level >= 2 && ", Безрассудная атака"}
                        {character.class === "Жрец" && character.level >= 1 && "Заклинания, Божественный домен"}
                        {character.class === "Жрец" && character.level >= 2 && ", Божественный канал"}
                        {character.class === "Бард" && character.level >= 1 && "Заклинания, Бардское вдохновение"}
                        {character.class === "Бард" && character.level >= 2 && ", Мастер на все руки"}
                        {character.class === "Волшебник" && character.level >= 1 && "Заклинания, Магическое восстановление"}
                        {character.class === "Волшебник" && character.level >= 2 && ", Магическая традиция"}
                        {character.class === "Паладин" && character.level >= 1 && "Божественное чувство, Исцеляющие руки"}
                        {character.class === "Паладин" && character.level >= 2 && ", Божественный удар, Божественная защита"}
                        {character.class === "Плут" && character.level >= 1 && "Компетентность, Скрытая атака, Воровской жаргон"}
                        {character.class === "Плут" && character.level >= 2 && ", Хитрое действие"}
                        {character.class === "Следопыт" && character.level >= 1 && "Избранный враг, Исследователь природы"}
                        {character.class === "Следопыт" && character.level >= 2 && ", Боевой стиль"}
                        {!["Воин", "Варвар", "Жрец", "Бард", "Волшебник", "Паладин", "Плут", "Следопыт"].includes(character.class || "") && 
                          "Информация о классовых особенностях будет добавлена при сохранении персонажа"
                        }
                      </p>
                    </div>
                    
                    {/* Особенности подкласса */}
                    {character.subclass && (
                      <div className="py-2 px-3 bg-card/10 rounded-md border border-primary/20">
                        <p className="text-sm font-medium mb-1">Особенности {character.subclass}</p>
                        <p className="text-xs opacity-80">
                          Особенности подкласса будут доступны после сохранения персонажа
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Дополнительные черты */}
                <div>
                  <h4 className="font-medium text-primary/90 mb-2">
                    Черты из предыстории
                  </h4>
                  <div className="py-2 px-3 bg-card/10 rounded-md border border-primary/20">
                    <p className="text-sm font-medium mb-1">{character.background || "Предыстория"}</p>
                    <p className="text-xs opacity-80">
                      {character.background === "Благородный" && "Привилегия положения, Верный слуга"}
                      {character.background === "Чужеземец" && "Странник, Знание племён"}
                      {character.background === "Преступник" && "Криминальные связи, Воровской жаргон"}
                      {character.background === "Народный герой" && "Деревенское гостеприимство"}
                      {character.background === "Мудрец" && "Исследователь, Обширные знания"}
                      {character.background === "Солдат" && "Военный чин, Ветеран"}
                      {!["Благородный", "Чужеземец", "Преступник", "Народный герой", "Мудрец", "Солдат"].includes(character.background || "") && 
                        "Информация о чертах предыстории будет добавлена при сохранении персонажа"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Вкладка с снаряжением */}
          <TabsContent value="equipment" className="space-y-6">
            <Card className="p-6 bg-primary/5 border border-primary/20">
              <h3 className="text-lg font-semibold border-b border-primary/10 pb-2 mb-4 flex items-center gap-2">
                <Swords className="size-4" />
                Снаряжение
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Оружие */}
                  <div>
                    <h4 className="font-medium border-b border-primary/10 pb-2 mb-2">Оружие</h4>
                    <div className="space-y-2">
                      {character.equipment?.filter(item => 
                        typeof item === 'string' && (
                          item.toLowerCase().includes('меч') || 
                          item.toLowerCase().includes('топор') || 
                          item.toLowerCase().includes('копьё') || 
                          item.toLowerCase().includes('лук') || 
                          item.toLowerCase().includes('кинжал') ||
                          item.toLowerCase().includes('булава')
                        )
                      ).map((weapon, index) => (
                        <div key={index} className="py-1.5 px-3 bg-card/10 rounded-md border border-primary/10 flex justify-between">
                          <span className="text-sm">{weapon}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="size-4 text-primary/60" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Подробности будут доступны в листе персонажа</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))}
                      
                      {!(character.equipment?.filter(item => 
                        typeof item === 'string' && (
                          item.toLowerCase().includes('меч') || 
                          item.toLowerCase().includes('топор') || 
                          item.toLowerCase().includes('копьё') || 
                          item.toLowerCase().includes('лук') || 
                          item.toLowerCase().includes('кинжал') ||
                          item.toLowerCase().includes('булава')
                        )
                      ).length > 0) && (
                        <div className="py-1.5 px-3 bg-card/30 rounded-md text-muted-foreground text-sm">
                          Нет оружия в инвентаре
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Доспехи */}
                  <div>
                    <h4 className="font-medium border-b border-primary/10 pb-2 mb-2">Доспехи и защита</h4>
                    <div className="space-y-2">
                      {character.equipment?.filter(item => 
                        typeof item === 'string' && (
                          item.toLowerCase().includes('доспех') || 
                          item.toLowerCase().includes('кольчуга') || 
                          item.toLowerCase().includes('щит') ||
                          item.toLowerCase().includes('шлем')
                        )
                      ).map((armor, index) => (
                        <div key={index} className="py-1.5 px-3 bg-card/10 rounded-md border border-primary/10 flex justify-between">
                          <span className="text-sm">{armor}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="size-4 text-primary/60" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Подробности будут доступны в листе персонажа</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))}
                      
                      {!(character.equipment?.filter(item => 
                        typeof item === 'string' && (
                          item.toLowerCase().includes('доспех') || 
                          item.toLowerCase().includes('кольчуга') || 
                          item.toLowerCase().includes('щит') ||
                          item.toLowerCase().includes('шлем')
                        )
                      ).length > 0) && (
                        <div className="py-1.5 px-3 bg-card/30 rounded-md text-muted-foreground text-sm">
                          Нет доспехов в инвентаре
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Прочие предметы */}
                <div>
                  <h4 className="font-medium border-b border-primary/10 pb-2 mb-2">Прочие предметы</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {character.equipment?.filter(item => 
                      typeof item === 'string' && 
                      !item.toLowerCase().includes('меч') && 
                      !item.toLowerCase().includes('топор') && 
                      !item.toLowerCase().includes('копьё') && 
                      !item.toLowerCase().includes('лук') && 
                      !item.toLowerCase().includes('кинжал') &&
                      !item.toLowerCase().includes('булава') &&
                      !item.toLowerCase().includes('доспех') && 
                      !item.toLowerCase().includes('кольчуга') && 
                      !item.toLowerCase().includes('щит') &&
                      !item.toLowerCase().includes('шлем')
                    ).map((item, index) => (
                      <div key={index} className="py-1.5 px-3 bg-card/10 rounded-md">
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                    
                    {!(character.equipment?.filter(item => 
                      typeof item === 'string' && 
                      !item.toLowerCase().includes('меч') && 
                      !item.toLowerCase().includes('топор') && 
                      !item.toLowerCase().includes('копьё') && 
                      !item.toLowerCase().includes('лук') && 
                      !item.toLowerCase().includes('кинжал') &&
                      !item.toLowerCase().includes('булава') &&
                      !item.toLowerCase().includes('доспех') && 
                      !item.toLowerCase().includes('кольчуга') && 
                      !item.toLowerCase().includes('щит') &&
                      !item.toLowerCase().includes('шлем')
                    ).length > 0) && (
                      <div className="py-1.5 px-3 bg-card/30 rounded-md text-muted-foreground text-sm col-span-full">
                        Нет дополнительных предметов в инвентаре
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Вкладка с заклинаниями */}
          <TabsContent value="spells" className="space-y-6">
            <Card className="p-6 bg-primary/5 border border-primary/20">
              <h3 className="text-lg font-semibold border-b border-primary/10 pb-2 mb-4 flex items-center gap-2">
                <BookOpen className="size-4" />
                Заклинания
              </h3>
              
              {character.spells && character.spells.length > 0 ? (
                <div className="space-y-4">
                  {/* Заговоры */}
                  <div>
                    <h4 className="font-medium border-b border-primary/10 pb-2 mb-2">Заговоры</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {character.spells.filter(spell => 
                        isSpellMatchingType(spell, 'заговор') || 
                        isSpellMatchingType(spell, 'уровень 0')
                      ).map((spell, index) => (
                        <div key={index} className="py-1.5 px-3 bg-card/10 rounded-md border border-primary/10">
                          <span className="text-sm">{spell}</span>
                        </div>
                      ))}
                      
                      {character.spells.filter(spell => 
                        isSpellMatchingType(spell, 'заговор') || 
                        isSpellMatchingType(spell, 'уровень 0')
                      ).length === 0 && (
                        <div className="py-1.5 px-3 bg-card/30 rounded-md text-muted-foreground text-sm col-span-full">
                          Нет выбранных заговоров
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Заклинания 1 уровня */}
                  <div>
                    <h4 className="font-medium border-b border-primary/10 pb-2 mb-2">Заклинания 1 уровня</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {character.spells.filter(spell => 
                        isSpellMatchingType(spell, 'уровень 1') || 
                        isSpellMatchingType(spell, '1 уровень')
                      ).map((spell, index) => (
                        <div key={index} className="py-1.5 px-3 bg-card/10 rounded-md border border-primary/10">
                          <span className="text-sm">{spell}</span>
                        </div>
                      ))}
                      
                      {character.spells.filter(spell => 
                        isSpellMatchingType(spell, 'уровень 1') || 
                        isSpellMatchingType(spell, '1 уровень')
                      ).length === 0 && (
                        <div className="py-1.5 px-3 bg-card/30 rounded-md text-muted-foreground text-sm col-span-full">
                          Нет заклинаний 1 уровня
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Заклинания 2 уровня */}
                  {character.level >= 3 && (
                    <div>
                      <h4 className="font-medium border-b border-primary/10 pb-2 mb-2">Заклинания 2 уровня</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {character.spells.filter(spell => 
                          isSpellMatchingType(spell, 'уровень 2') || 
                          isSpellMatchingType(spell, '2 уровень')
                        ).map((spell, index) => (
                          <div key={index} className="py-1.5 px-3 bg-card/10 rounded-md border border-primary/10">
                            <span className="text-sm">{spell}</span>
                          </div>
                        ))}
                        
                        {character.spells.filter(spell => 
                          isSpellMatchingType(spell, 'уровень 2') || 
                          isSpellMatchingType(spell, '2 уровень')
                        ).length === 0 && (
                          <div className="py-1.5 px-3 bg-card/30 rounded-md text-muted-foreground text-sm col-span-full">
                            Нет заклинаний 2 уровня
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center">
                  {character.class && ["Волшебник", "Жрец", "Бард", "Чародей", "Колдун", "Паладин", "Следопыт", "Друид"].includes(character.class) ? (
                    <>
                      <AlertTriangle className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                      <p className="text-sm">
                        Вы не выб��али за��линания. Рекомендуем вернуться к шагу выбора заклинаний.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-3"
                        style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}
                        onClick={() => goToStep(8)}
                      >
                        <Edit className="mr-1 size-3.5" />
                        Выбрать заклинания
                      </Button>
                    </>
                  ) : (
                    <>
                      <Info className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Заклинания недоступны для вашего класса или не выбраны.
                      </p>
                    </>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-card/70 backdrop-blur-md border-t border-primary/20">
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl mx-auto">
          <div className="flex justify-between md:justify-start items-center gap-4 flex-1">
            <Button
              onClick={prevStep}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 bg-black/70 text-white hover:bg-gray-800 border-gray-700 hover:border-gray-500"
            >
              {/* Back button */}
              <ArrowLeft className="size-4" /> Назад
            </Button>
            
            {/* Если пользователь Мастер, показываем кнопку создания сессии */}
            {isDM && (
              <Button
                onClick={handleStartSession}
                variant="outline"
                style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}
                className="flex items-center gap-2"
              >
                <BookOpen className="size-4" /> 
                Создать сессию
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setSaveDialogOpen(true)}
              disabled={isSaving}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2"
            >
              <Save className="size-4" />
              {isSaving ? "Сохранение..." : "Сохранить персонажа"}
            </Button>
            
            <Button
              onClick={viewCharacter}
              variant="outline"
              style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}
            >
              <Eye className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Диалог подтверждения сохранения */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохранение персонажа</DialogTitle>
            <DialogDescription>
              Проверьте данные персонажа перед сохранением.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">
              Вы создали персонажа <strong>{character.name || "без имени"}</strong>:{' '}
              {character.race} {character.class}, {character.level} уровень.
            </p>
            
            {(!character.name || !character.name.trim()) && (
              <p className="text-red-500 mb-2 text-sm">
                ⚠️ Персонаж не имеет имени. Рекомендуется указать имя.
              </p>
            )}
            
            {(!character.maxHp || character.maxHp <= 0) && (
              <p className="text-red-500 mb-2 text-sm">
                ⚠️ Не рассчитаны хиты персонажа.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={saveCharacter}
              disabled={isSaving}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {isSaving ? "Сохранение..." : "Подтвердить сохранение"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Создаём пустой компонент CharacterSkillsDisplay для исправления ошибки импорта
const CharacterSkillsDisplay = () => <div />;

export default CharacterReview;
