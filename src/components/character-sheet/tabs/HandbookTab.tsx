
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

interface HandbookTabProps {
  character: Character;
}

export const HandbookTab: React.FC<HandbookTabProps> = ({ character }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('rules');
  
  const rulesContent = `
# Правила D&D 5e

## Основы
- **Проверки характеристик**: бросок d20 + модификатор характеристики
- **Спасброски**: бросок d20 + модификатор характеристики + бонус мастерства (если есть)
- **Атаки**: бросок d20 + модификатор характеристики + бонус мастерства
- **Сложность проверки (DC)**: число, которое нужно превысить при броске

## Бой
- **Инициатива**: бросок d20 + модификатор Ловкости
- **Действия в бою**: Действие, бонусное действие, движение, реакция
- **Укрытие**: +2 к AC (половинное), +5 к AC (три четверти), полное укрытие

## Заклинания
- **Уровни заклинаний**: от 0 (заговоры) до 9
- **Компоненты**: вербальный (V), соматический (S), материальный (M)
- **Время накладывания**: от 1 действия до нескольких часов
- **Дистанция**: от прикосновения до сотен километров
- **Длительность**: мгновенная, концентрация, минуты, часы, дни

## Отдых
- **Короткий отдых**: 1 час, восстанавливает Кость Хит-Поинтов
- **Продолжительный отдых**: 8 часов, восстанавливает HP, половину Костей Хит-Поинтов, заклинания
`;

  const classesContent = `
# Классы в D&D 5e

## Воин (Fighter)
Специалист в военном деле и владении оружием. Обладает высокой выживаемостью и наносит стабильный урон.

## Варвар (Barbarian)
Свирепый воин, полагающийся на ярость для усиления в бою. Имеет высокое здоровье и способность переносить урон.

## Плут (Rogue)
Мастер скрытности и манипуляций. Наносит высокий урон по одиночной цели благодаря скрытой атаке.

## Монах (Monk)
Мастер боевых искусств, использующий ки для выполнения невероятных физических подвигов.

## Паладин (Paladin)
Святой воин, сочетающий боевые навыки и божественную магию. Обладает способностью исцелять и защищать.

## Следопыт (Ranger)
Охотник и разведчик, использующий знания природы для выслеживания врагов.

## Чародей (Sorcerer)
Врожденный заклинатель, магические силы которого идут изнутри.

## Волшебник (Wizard)
Ученый маг, изучающий тайны магии и записывающий заклинания в книгу.

## Колдун (Warlock)
Заклинатель, получивший силы от могущественного покровителя.

## Бард (Bard)
Вдохновляющий исполнитель, сочетающий музыку с магией.

## Жрец (Cleric)
Проводник божественной воли, носитель веры и силы своего божества.

## Друид (Druid)
Хранитель природы, способный принимать формы животных.
`;

  const racesContent = `
# Расы в D&D 5e

## Человек (Human)
Универсальная раса с бонусом ко всем характеристикам.

## Эльф (Elf)
Долгоживущая раса с бонусом к Ловкости, обладающая острым зрением и устойчивостью к очарованию.

## Дварф (Dwarf)
Крепкие и выносливые, с бонусом к Телосложению и устойчивостью к яду.

## Полурослик (Halfling)
Маленькая раса с бонусом к Ловкости и возможностью перебросить результат 1 на d20.

## Гном (Gnome)
Маленькая и изобретательная раса с бонусом к Интеллекту.

## Полуэльф (Half-Elf)
Сочетает черты людей и эльфов, получает бонус к Харизме и двум другим характеристикам.

## Полуорк (Half-Orc)
Физически сильная раса с бонусом к Силе и Телосложению, обладает стойкостью и усиленными критическими атаками.

## Тифлинг (Tiefling)
Потомки демонов с бонусом к Интеллекту и Харизме, обладают врожденной магией и сопротивлением к огню.

## Драконорожденный (Dragonborn)
Раса с драконьими чертами, имеющая бонус к Силе и Харизме, обладает дыхательной атакой.
`;

  const filteredContent = () => {
    const content = {
      rules: rulesContent,
      classes: classesContent,
      races: racesContent,
    }[activeTab as 'rules' | 'classes' | 'races'] || '';
    
    if (!searchTerm) return content;
    
    // Простая фильтрация по поисковому запросу
    return content
      .split('\n')
      .filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()))
      .join('\n');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Справочник D&D 5e</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по справочнику..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rules" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="rules">Правила</TabsTrigger>
            <TabsTrigger value="classes">Классы</TabsTrigger>
            <TabsTrigger value="races">Расы</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] whitespace-pre-wrap">
            <div className="handbook-content prose prose-sm max-w-none dark:prose-invert">
              {filteredContent()}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};
