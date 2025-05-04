
import React, { useState } from 'react';
import { CharacterSheet } from '@/types/character';
import NavigationButtons from '@/components/character-creation/NavigationButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CharacterClassProps {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  prevStep: () => void;
  nextStep: () => void;
}

const CharacterClass: React.FC<CharacterClassProps> = ({
  character,
  updateCharacter,
  prevStep,
  nextStep,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(character.class || '');

  const handleNext = () => {
    updateCharacter({
      class: selectedClass,
    });
    nextStep();
  };

  const classes = [
    { name: "Бард", description: "Барды - универсальные мастера, сочетающие магию и боевые искусства с помощью музыки." },
    { name: "Варвар", description: "Варвары - свирепые воины, полагающиеся на инстинкт и ярость в бою." },
    { name: "Воин", description: "Воины - эксперты военного искусства и мастера многих видов оружия." },
    { name: "Волшебник", description: "Волшебники - исследователи мистических искусств, обладающие обширными знаниями о магии." },
    { name: "Друид", description: "Друиды - хранители природы, способные превращаться в животных и управлять стихиями." },
    { name: "Жрец", description: "Жрецы - посланники богов, наделённые божественной силой для исцеления и защиты." },
    { name: "Колдун", description: "Колдуны - маги, получившие силу от могущественного покровителя." },
    { name: "Монах", description: "Монахи - мастера боевых искусств, использующие энергию ци для удивительных подвигов." },
    { name: "Паладин", description: "Паладины - благородные воины, клянущиеся защищать добро и справедливость." },
    { name: "Плут", description: "Плуты - ловкие и хитрые авантюристы, мастера скрытности и обмана." },
    { name: "Следопыт", description: "Следопыты - смертельно опасные охотники и проводники в дикой местности." },
    { name: "Чародей", description: "Чародеи - маги с врожденным даром к магии, текущей в их крови." }
  ];

  const selectedClassInfo = classes.find(c => c.name === selectedClass);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выбор класса</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="class" className="block mb-2">Выберите класс персонажа</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="class">
                <SelectValue placeholder="Выберите класс" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.name} value={cls.name}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedClassInfo && (
            <div className="mt-6 p-4 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{selectedClassInfo.name}</h3>
              <p className="text-muted-foreground">{selectedClassInfo.description}</p>
              
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Обзор</TabsTrigger>
                  <TabsTrigger value="abilities">Способности</TabsTrigger>
                  <TabsTrigger value="proficiencies">Владения</TabsTrigger>
                </TabsList>
                <ScrollArea className="h-64 mt-2">
                  <TabsContent value="overview" className="p-2">
                    <p>Описание класса {selectedClassInfo.name}</p>
                  </TabsContent>
                  <TabsContent value="abilities" className="p-2">
                    <p>Способности класса {selectedClassInfo.name}</p>
                  </TabsContent>
                  <TabsContent value="proficiencies" className="p-2">
                    <p>Владения класса {selectedClassInfo.name}</p>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      <NavigationButtons
        prevStep={prevStep}
        nextStep={handleNext}
        allowNext={selectedClass !== ''}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterClass;
