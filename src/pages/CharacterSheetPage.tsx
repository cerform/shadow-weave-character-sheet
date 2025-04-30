
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterContext } from "@/contexts/CharacterContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeSelector } from "@/components/character-sheet/ThemeSelector";
import { StatsPanel } from "@/components/character-sheet/StatsPanel";
import { ResourcePanel } from "@/components/character-sheet/ResourcePanel";
import { SpellsTab } from "@/components/character-sheet/tabs/SpellsTab";
import { DiceRoller3D } from "@/components/character-sheet/DiceRoller3D";

const CharacterSheetPage = () => {
  const { character } = useContext(CharacterContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [currentHp, setCurrentHp] = useState(character?.maxHp || 20);
  const [maxHp, setMaxHp] = useState(character?.maxHp || 20);
  const [activeTab, setActiveTab] = useState("abilities");

  if (!character) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-background text-foreground ${theme}`}>
        <h1 className="text-2xl font-bold mb-4">Нет сохранённого персонажа.</h1>
        <Button onClick={() => navigate("/create")}>Создать персонажа</Button>
      </div>
    );
  }

  // Метки для характеристик
  const abilityLabels: Record<keyof typeof character.abilities, string> = {
    STR: "Сила",
    DEX: "Ловкость",
    CON: "Телосложение",
    INT: "Интеллект",
    WIS: "Мудрость",
    CHA: "Харизма",
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className={theme}>
      <div className="p-4 bg-background">
        <div className="flex justify-between items-center mb-4">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Button>
          <ThemeSelector />
        </div>
      </div>

      <div className="min-h-screen p-4 bg-gradient-to-br from-background to-background/80">
        <div className="max-w-[1400px] mx-auto">
          <header className="mb-4 bg-card/30 backdrop-blur-sm border-primary/20 rounded-lg p-4">
            <h1 className="text-2xl font-bold">{character.name} — {character.className}</h1>
            <p className="text-muted-foreground">{character.race} • Уровень {character.level}</p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">
            {/* Left sidebar */}
            <div className="space-y-4">
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
                <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                <Button className="w-full">Изменить аватар</Button>
              </Card>
              
              <ResourcePanel 
                currentHp={currentHp}
                maxHp={maxHp}
                onHpChange={setCurrentHp}
              />
              
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
                <h3 className="text-lg font-semibold mb-2">Кубики</h3>
                <div className="h-[200px]">
                  <DiceRoller3D />
                </div>
              </Card>
              
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
                <h3 className="text-lg font-semibold mb-2">Инвентарь</h3>
                <ScrollArea className="h-48 pr-3">
                  {character.equipment && character.equipment.length > 0 ? (
                    <ul className="space-y-1">
                      {character.equipment.map((item: string, idx: number) => (
                        <li key={idx} className="p-1 hover:bg-primary/5 rounded">{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-muted-foreground">Нет снаряжения</p>
                  )}
                </ScrollArea>
              </Card>
            </div>
            
            {/* Center content */}
            <div className="flex flex-col space-y-4">
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1 min-h-[500px]">
                <Tabs defaultValue="character" className="w-full h-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="character">Персонаж</TabsTrigger>
                    <TabsTrigger value="spells">Заклинания</TabsTrigger>
                    <TabsTrigger value="combat">Бой</TabsTrigger>
                    <TabsTrigger value="background">Предыстория</TabsTrigger>
                  </TabsList>
                  
                  <ScrollArea className="h-[calc(100vh-240px)]">
                    <TabsContent value="character" className="mt-0">
                      <div className="flex flex-col items-center justify-center h-full py-10">
                        <div className="text-4xl font-bold text-primary mb-4">{character.name}</div>
                        <p className="text-center max-w-md mb-6">
                          {character.race}, {character.className}
                        </p>
                        {character.background && (
                          <div className="max-w-2xl mx-auto mt-8 p-4 bg-muted/20 rounded-lg">
                            <h3 className="font-semibold mb-2">Предыстория</h3>
                            <p>{character.background}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="spells" className="mt-0">
                      <SpellsTab />
                    </TabsContent>
                    
                    <TabsContent value="combat" className="mt-0">
                      <div className="flex flex-col items-center justify-center h-full py-10">
                        <div className="text-4xl font-bold text-primary mb-4">Боевая сцена</div>
                        <p className="text-center max-w-md">
                          Здесь будет отображаться боевая карта и позиции существ.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="background" className="mt-0">
                      <div className="p-4 bg-muted/10 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Предыстория персонажа</h3>
                        <p className="mb-3">{character.background || "У персонажа еще нет предыстории."}</p>
                      </div>
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </Card>
            </div>
            
            {/* Right sidebar */}
            <div className="space-y-4">
              <StatsPanel character={character} />
              
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
                <h3 className="text-lg font-semibold mb-2">Ячейки заклинаний</h3>
                <div className="space-y-2">
                  {Object.entries(character.spellSlots || {}).length > 0 ? (
                    Object.entries(character.spellSlots).map(([lvl, slot]: [string, any]) => (
                      <div className="flex justify-between" key={lvl}>
                        <span>Уровень {lvl}</span>
                        <span className="text-green-500">{slot.max - slot.used}/{slot.max}</span>
                      </div>
                    ))
                  ) : (
                    <p className="italic text-muted-foreground">Нет ячеек заклинаний</p>
                  )}
                </div>
              </Card>
              
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
                <h3 className="text-lg font-semibold mb-2">Известные заклинания</h3>
                <ScrollArea className="h-48 pr-3">
                  {character.spells && character.spells.length > 0 ? (
                    <ul className="space-y-1">
                      {character.spells.map((spell: string, idx: number) => (
                        <li key={idx} className="p-1 hover:bg-primary/5 rounded">{spell}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-muted-foreground">Нет известных заклинаний</p>
                  )}
                </ScrollArea>
              </Card>
              
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
                <h3 className="text-lg font-semibold mb-2">Навыки</h3>
                <ScrollArea className="h-48 pr-3">
                  {character.proficiencies && character.proficiencies.length > 0 ? (
                    <ul className="space-y-1">
                      {character.proficiencies.map((prof: string, idx: number) => (
                        <li key={idx} className="p-1 hover:bg-primary/5 rounded">{prof}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-muted-foreground">Нет навыков</p>
                  )}
                </ScrollArea>
              </Card>
              
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
                <h3 className="text-lg font-semibold mb-2">Языки</h3>
                <div className="space-y-1">
                  {character.languages && character.languages.length > 0 ? (
                    character.languages.map((lang: string, idx: number) => (
                      <div key={idx} className="p-1 hover:bg-primary/5 rounded">{lang}</div>
                    ))
                  ) : (
                    <p className="italic text-muted-foreground">Общий</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheetPage;
