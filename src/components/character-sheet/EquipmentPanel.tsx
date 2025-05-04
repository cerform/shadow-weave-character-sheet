
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EquipmentPanelProps {
  character: any;
  isDM: boolean;
}

const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ character, isDM }) => {
  const [newItem, setNewItem] = useState('');
  const { toast } = useToast();
  const equipment = character?.equipment || [];

  const handleAddItem = () => {
    if (!newItem.trim()) {
      toast({
        title: 'Поле не может быть пустым',
        variant: 'destructive',
      });
      return;
    }

    // В реальном приложении здесь должен быть код для сохранения нового предмета
    toast({
      title: 'Предмет добавлен',
      description: 'Новый предмет успешно добавлен',
    });

    setNewItem('');
  };

  const handleRemoveItem = (index: number) => {
    // В реальном приложении здесь должен быть код для удаления предмета
    toast({
      title: 'Предмет удален',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Снаряжение</h3>
      
      {equipment.length === 0 ? (
        <p className="text-muted-foreground italic">Нет снаряжения в инвентаре.</p>
      ) : (
        <div className="space-y-2">
          {equipment.map((item: string, index: number) => (
            <div key={index} className="p-3 bg-primary/5 rounded-md flex justify-between items-start">
              <div>
                <p>{item}</p>
              </div>
              {isDM && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveItem(index)}
                  className="h-7 w-7 p-0"
                >
                  <MinusCircle className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {isDM && (
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Добавить новый предмет"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <Button onClick={handleAddItem}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        </div>
      )}
    </div>
  );
};

export default EquipmentPanel;
