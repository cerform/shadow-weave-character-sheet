
import React, { useState } from 'react';
import { CharacterSheet } from '@/types/character';
import NavigationButtons from '@/components/character-creation/NavigationButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface CharacterEquipmentProps {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  prevStep: () => void;
  nextStep: () => void;
}

const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({
  character,
  updateCharacter,
  prevStep,
  nextStep,
}) => {
  const [equipment, setEquipment] = useState<string[]>(character.equipment || []);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim() === '') return;
    setEquipment([...equipment, newItem.trim()]);
    setNewItem('');
  };

  const removeItem = (index: number) => {
    const newEquipment = [...equipment];
    newEquipment.splice(index, 1);
    setEquipment(newEquipment);
  };

  const handleNext = () => {
    updateCharacter({ equipment });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Снаряжение персонажа</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-4">
            <Label htmlFor="newItem">Добавить предмет снаряжения</Label>
            <div className="flex mt-2 gap-2">
              <Input 
                id="newItem" 
                value={newItem} 
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Введите название предмета"
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
              />
              <Button onClick={addItem} type="button">
                <Plus className="h-4 w-4 mr-1" /> Добавить
              </Button>
            </div>
          </div>
          
          {equipment.length > 0 ? (
            <div className="space-y-2">
              <Label>Текущее снаряжение:</Label>
              <div className="border rounded-md p-2">
                <ul className="space-y-2">
                  {equipment.map((item, index) => (
                    <li key={index} className="flex justify-between items-center py-1 px-2 bg-muted/30 rounded">
                      <span>{item}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeItem(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Добавьте снаряжение для вашего персонажа
            </p>
          )}
        </CardContent>
      </Card>

      <NavigationButtons
        prevStep={prevStep}
        nextStep={handleNext}
        allowNext={true}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterEquipment;
