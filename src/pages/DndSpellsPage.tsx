
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Типы для заклинаний
interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  classes: string[];
  description: string;
  higherLevels?: string;
}

const DndSpellsPage: React.FC = () => {
  console.log('DndSpellsPage: Компонент загружается');
  const navigate = useNavigate();
  const [spells, setSpells] = useState<Spell[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<Spell[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [activeSpell, setActiveSpell] = useState<Spell | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Фейковые данные заклинаний из книги игрока D&D 5e
  useEffect(() => {
    const dndSpells: Spell[] = [
      {
        name: "Огненный снаряд",
        level: 0,
        school: "Воплощение",
        castingTime: "1 действие",
        range: "120 футов",
        components: "V, S",
        duration: "Мгновенная",
        classes: ["Волшебник", "Чародей"],
        description: "Вы бросаете сгусток огня в существо или предмет в пределах дистанции. Совершите дальнобойную атаку заклинанием по цели. При попадании цель получает урон огнём 1d10. Урон этого заклинания увеличивается на 1d10, когда вы достигаете 5-го уровня (2d10), 11-го уровня (3d10) и 17-го уровня (4d10)."
      },
      {
        name: "Волшебная рука",
        level: 0,
        school: "Вызов",
        castingTime: "1 действие",
        range: "30 футов",
        components: "V, S",
        duration: "1 минута",
        classes: ["Бард", "Волшебник", "Колдун", "Чародей"],
        description: "Призрачная парящая рука появляется в указанной точке, выбранной вами в пределах дистанции. Рука существует, пока заклинание активно, или пока вы не отпустите её действием. Рука исчезает, если оказывается более чем в 30 футах от вас, или когда вы накладываете это заклинание ещё раз."
      },
      {
        name: "Волшебная стрела",
        level: 1,
        school: "Воплощение",
        castingTime: "1 действие",
        range: "120 футов",
        components: "V, S",
        duration: "Мгновенная",
        classes: ["Волшебник", "Чародей"],
        description: "Вы создаёте три светящиеся стрелы из магической силы. Каждая стрела поражает существо на ваш выбор, которое вы можете видеть в пределах дистанции. Стрела наносит урон силовым полем 1d4 + 1. Стрелы бьют одновременно, и вы можете направить их в одну или разные цели.",
        higherLevels: "Если вы накладываете это заклинание, используя ячейку 2-го уровня или выше, заклинание создаёт на одну стрелу больше за каждый уровень ячейки выше 1-го."
      },
      {
        name: "Щит",
        level: 1,
        school: "Ограждение",
        castingTime: "1 реакция",
        range: "На себя",
        components: "V, S",
        duration: "1 раунд",
        classes: ["Волшебник", "Чародей"],
        description: "Невидимый барьер магической силы появляется и защищает вас. До начала вашего следующего хода вы получаете бонус +5 к КД, включая вызвавшую реакцию атаку, и вы не получаете урон от волшебной стрелы."
      },
      {
        name: "Магическое оружие",
        level: 2,
        school: "Преобразование",
        castingTime: "1 бонусное действие",
        range: "Касание",
        components: "V, S",
        duration: "Концентрация, вплоть до 1 часа",
        classes: ["Паладин", "Волшебник", "Следопыт"],
        description: "Вы касаетесь немагического оружия. Пока заклинание активно, это оружие становится магическим с бонусом +1 к броскам атаки и урона.",
        higherLevels: "Если вы накладываете это заклинание, используя ячейку 4-го уровня или выше, бонус увеличивается до +2. Если вы используете ячейку 6-го уровня или выше, бонус увеличивается до +3."
      }
    ];

    setSpells(dndSpells);
    setFilteredSpells(dndSpells);
  }, []);

  // Логика фильтрации заклинаний
  useEffect(() => {
    let result = spells;

    // Фильтр по поиску
    if (searchTerm) {
      result = result.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spell.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по уровню
    if (levelFilter !== "all") {
      result = result.filter(spell => spell.level === parseInt(levelFilter));
    }

    // Фильтр по классу
    if (classFilter !== "all") {
      result = result.filter(spell => 
        spell.classes.some(cls => cls.toLowerCase() === classFilter.toLowerCase())
      );
    }

    // Фильтр по школе
    if (schoolFilter !== "all") {
      result = result.filter(spell => 
        spell.school.toLowerCase() === schoolFilter.toLowerCase()
      );
    }

    // Фильтр по вкладкам
    if (activeTab !== "all") {
      const level = parseInt(activeTab);
      result = result.filter(spell => spell.level === level);
    }

    setFilteredSpells(result);
  }, [searchTerm, levelFilter, classFilter, schoolFilter, activeTab, spells]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Заклинания D&D 5e</h1>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          Назад на главную
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Поиск заклинаний</CardTitle>
          <CardDescription>
            Найдите заклинания из Книги игрока D&D 5 редакции
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 opacity-50" />
              <Input 
                placeholder="Поиск заклинаний..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 opacity-50" />
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все уровни</SelectItem>
                    <SelectItem value="0">Заговор</SelectItem>
                    <SelectItem value="1">1 уровень</SelectItem>
                    <SelectItem value="2">2 уровень</SelectItem>
                    <SelectItem value="3">3 уровень</SelectItem>
                    <SelectItem value="4">4 уровень</SelectItem>
                    <SelectItem value="5">5 уровень</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Класс" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все классы</SelectItem>
                  <SelectItem value="бард">Бард</SelectItem>
                  <SelectItem value="волшебник">Волшебник</SelectItem>
                  <SelectItem value="жрец">Жрец</SelectItem>
                  <SelectItem value="колдун">Колдун</SelectItem>
                  <SelectItem value="паладин">Паладин</SelectItem>
                  <SelectItem value="следопыт">Следопыт</SelectItem>
                  <SelectItem value="чародей">Чародей</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Школа" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все школы</SelectItem>
                  <SelectItem value="вызов">Вызов</SelectItem>
                  <SelectItem value="воплощение">Воплощение</SelectItem>
                  <SelectItem value="иллюзия">Иллюзия</SelectItem>
                  <SelectItem value="некромантия">Некромантия</SelectItem>
                  <SelectItem value="ограждение">Ограждение</SelectItem>
                  <SelectItem value="очарование">Очарование</SelectItem>
                  <SelectItem value="преобразование">Преобразование</SelectItem>
                  <SelectItem value="прорицание">Прорицание</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Список заклинаний</CardTitle>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">Все</TabsTrigger>
                  <TabsTrigger value="0" className="flex-1">Заговоры</TabsTrigger>
                  <TabsTrigger value="1" className="flex-1">1</TabsTrigger>
                  <TabsTrigger value="2" className="flex-1">2</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {filteredSpells.length > 0 ? (
                    filteredSpells.map((spell, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          activeSpell?.name === spell.name ? 'bg-primary/20' : 'hover:bg-secondary/50'
                        }`}
                        onClick={() => setActiveSpell(spell)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{spell.name}</div>
                          <Badge variant={spell.level === 0 ? "outline" : "default"}>
                            {spell.level === 0 ? 'Заговор' : `${spell.level} ур.`}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {spell.school} • {spell.castingTime}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {spell.classes.join(", ")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Заклинания не найдены
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {activeSpell ? activeSpell.name : "Выберите заклинание"}
              </CardTitle>
              {activeSpell && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={activeSpell.level === 0 ? "outline" : "default"}>
                    {activeSpell.level === 0 ? 'Заговор' : `${activeSpell.level} уровень`}
                  </Badge>
                  <Badge variant="secondary">{activeSpell.school}</Badge>
                  {activeSpell.classes.map((cls, index) => (
                    <Badge key={index} variant="outline">{cls}</Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {activeSpell ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-semibold">Время накладывания:</span> {activeSpell.castingTime}
                    </div>
                    <div>
                      <span className="font-semibold">Дистанция:</span> {activeSpell.range}
                    </div>
                    <div>
                      <span className="font-semibold">Компоненты:</span> {activeSpell.components}
                    </div>
                    <div>
                      <span className="font-semibold">Длительность:</span> {activeSpell.duration}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm whitespace-pre-line">{activeSpell.description}</p>
                    
                    {activeSpell.higherLevels && (
                      <>
                        <h4 className="font-semibold mt-4 mb-2">На более высоких уровнях</h4>
                        <p className="text-sm">{activeSpell.higherLevels}</p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mb-4 opacity-30" />
                  <p>Выберите заклинание из списка слева, чтобы увидеть подробное описание</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DndSpellsPage;
