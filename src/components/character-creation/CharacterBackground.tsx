
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { backgrounds } from '@/data/backgrounds';
import { alignments } from '@/data/alignments';
import NavigationButtons from '@/components/ui/NavigationButtons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

interface BackgroundInfo {
  name: string;
  description: string;
  featureTitle: string;
  featureDescription: string;
  proficiencies: string[];
  characteristicsDescription: string;
}

const CharacterBackground = ({ prevStep, nextStep }: { prevStep: () => void, nextStep: () => void }) => {
  const { character, updateCharacter } = useCharacterCreation();
  const { toast } = useToast();
  const [personalityTraits, setPersonalityTraits] = useState(character.personalityTraits || '');
  const [ideals, setIdeals] = useState(character.ideals || '');
  const [bonds, setBonds] = useState(character.bonds || '');
  const [flaws, setFlaws] = useState(character.flaws || '');
  const [backstory, setBackstory] = useState(character.backstory || '');
  const [alignment, setAlignment] = useState(character.alignment || '');
  const [background, setBackground] = useState(character.background || '');
  const [appearance, setAppearance] = useState(character.appearance || '');
  
  const selectedBackground: BackgroundInfo | undefined = backgrounds.find((bg) => bg.name === background);
  
  const handleBackgroundChange = (value: string) => {
    setBackground(value);
    
    // Если выбран новый бэкграунд, устанавливаем его профессии
    const bgInfo = backgrounds.find((bg) => bg.name === value);
    if (bgInfo) {
      // Добавляем профессии бэкграунда к существующим
      const existingProficiencies = character.proficiencies || [];
      
      // Фильтруем только уникальные профессии
      const uniqueProficiencies = [
        ...existingProficiencies,
        ...bgInfo.proficiencies
      ].filter((value, index, self) => self.indexOf(value) === index);
      
      updateCharacter({
        proficiencies: uniqueProficiencies
      });
      
      // Показываем уведомление о добавленных профессиях
      toast({
        title: "Профессии обновлены",
        description: `Добавлены профессии: ${bgInfo.proficiencies.join(", ")}`
      });
    }
  };
  
  const handleSave = () => {
    if (!background) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите предысторию персонажа",
        variant: "destructive"
      });
      return;
    }
    
    if (!alignment) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите мировоззрение персонажа",
        variant: "destructive"
      });
      return;
    }
    
    if (!backstory || backstory.length < 10) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, добавьте историю персонажа (минимум 10 символов)",
        variant: "destructive"
      });
      return;
    }
    
    updateCharacter({
      background,
      alignment,
      personalityTraits,
      ideals,
      bonds,
      flaws,
      backstory,
      appearance
    });
    
    toast({
      title: "Предыстория сохранена",
      description: "Информация о предыстории персонажа обновлена"
    });
    
    nextStep();
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>История персонажа</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Колонка для основных выборов */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="background">Предыстория</Label>
                <Select
                  value={background}
                  onValueChange={handleBackgroundChange}
                >
                  <SelectTrigger id="background">
                    <SelectValue placeholder="Выберите предысторию" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgrounds.map((bg) => (
                      <SelectItem key={bg.name} value={bg.name}>
                        {bg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alignment">Мировоззрение</Label>
                <Select
                  value={alignment}
                  onValueChange={setAlignment}
                >
                  <SelectTrigger id="alignment">
                    <SelectValue placeholder="Выберите мировоззрение" />
                  </SelectTrigger>
                  <SelectContent>
                    {alignments.map((align) => (
                      <SelectItem key={align.value} value={align.value}>
                        {align.label} - {align.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appearance">Внешний вид</Label>
                <Textarea
                  id="appearance"
                  placeholder="Опишите внешность персонажа"
                  value={appearance}
                  onChange={(e) => setAppearance(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            
            {/* Колонка для детальной информации о предыстории */}
            <div>
              {selectedBackground ? (
                <Accordion type="single" collapsible>
                  <AccordionItem value="description">
                    <AccordionTrigger>Описание предыстории</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">{selectedBackground.description}</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="feature">
                    <AccordionTrigger>Умение: {selectedBackground.featureTitle}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">{selectedBackground.featureDescription}</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="proficiencies">
                    <AccordionTrigger>Владения</AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-sm list-disc pl-5">
                        {selectedBackground.proficiencies.map((prof, idx) => (
                          <li key={idx}>{prof}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted-foreground">Выберите предысторию для просмотра деталей</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Характеристики персонажа */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="personalityTraits">Черты характера</Label>
              <Textarea
                id="personalityTraits"
                placeholder="Опишите черты характера вашего персонажа"
                value={personalityTraits}
                onChange={(e) => setPersonalityTraits(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ideals">Идеалы</Label>
              <Textarea
                id="ideals"
                placeholder="Опишите идеалы и ценности вашего персонажа"
                value={ideals}
                onChange={(e) => setIdeals(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bonds">Привязанности</Label>
              <Textarea
                id="bonds"
                placeholder="Опишите привязанности вашего персонажа"
                value={bonds}
                onChange={(e) => setBonds(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="flaws">Слабости</Label>
              <Textarea
                id="flaws"
                placeholder="Опишите недостатки и слабости вашего персонажа"
                value={flaws}
                onChange={(e) => setFlaws(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          {/* История персонажа */}
          <div className="mt-6 space-y-2">
            <Label htmlFor="backstory">История персонажа</Label>
            <Textarea
              id="backstory"
              placeholder="Опишите историю жизни вашего персонажа"
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              rows={6}
            />
          </div>
        </CardContent>
      </Card>
      
      <NavigationButtons prevStep={prevStep} nextStep={handleSave} nextDisabled={!background || !alignment || !backstory} />
    </div>
  );
};

export default CharacterBackground;
