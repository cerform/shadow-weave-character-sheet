import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { races } from '@/data/handbook/races';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HandbookTabProps {
  character: Character;
}

interface RaceDetailPageProps {
  race: any;
  onBack: () => void;
}

const RaceDetailPage: React.FC<RaceDetailPageProps> = ({ race, onBack }) => {
  const abilityBonuses = race.abilityScoreIncrease || {};
  const hasSubraces = race.subraces && race.subraces.length > 0;

  return (
    <div>
      <Button variant="outline" onClick={onBack} className="mb-4">
        Назад к списку рас
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{race.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{race.description}</p>

          <section className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Бонусы характеристик</h3>
            <ul className="list-disc pl-5">
              {abilityBonuses.all && <li>Все характеристики: +{abilityBonuses.all}</li>}
              {abilityBonuses.strength && <li>Сила: +{abilityBonuses.strength}</li>}
              {abilityBonuses.dexterity && <li>Ловкость: +{abilityBonuses.dexterity}</li>}
              {abilityBonuses.constitution && <li>Телосложение: +{abilityBonuses.constitution}</li>}
              {abilityBonuses.intelligence && <li>Интеллект: +{abilityBonuses.intelligence}</li>}
              {abilityBonuses.wisdom && <li>Мудрость: +{abilityBonuses.wisdom}</li>}
              {abilityBonuses.charisma && <li>Харизма: +{abilityBonuses.charisma}</li>}
              {abilityBonuses.custom && <li>Другое: +{abilityBonuses.custom}</li>}
            </ul>
          </section>

          {hasSubraces && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Подрасы</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {race.subraces.map((subrace, index) => (
                  <Card key={index}>
                    <CardContent>
                      <h4 className="font-medium">{subrace.name}</h4>
                      <p className="text-sm text-muted-foreground">{subrace.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const HandbookTab: React.FC<HandbookTabProps> = ({ character }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('rules');
  const [selectedRace, setSelectedRace] = useState<any>(null);

  const handleRaceClick = (race: any) => {
    setSelectedRace(race);
  };

  const handleBackToList = () => {
    setSelectedRace(null);
  };

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
  
  if (selectedRace) {
    return <RaceDetailPage race={selectedRace} onBack={handleBackToList} />;
  }

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
            {activeTab === 'races' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {races.map((race) => (
                  <Card key={race.name} className="cursor-pointer" onClick={() => handleRaceClick(race)}>
                    <CardContent>
                      <CardTitle>{race.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{race.description.substring(0, 100)}...</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="handbook-content prose prose-sm max-w-none dark:prose-invert">
                {filteredContent()}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};
