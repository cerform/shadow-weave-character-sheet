
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeaturesTabProps {
  character: any;
  isDM: boolean;
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ character, isDM }) => {
  const [newFeature, setNewFeature] = useState('');
  const { toast } = useToast();
  const features = character?.features || [];

  const handleAddFeature = () => {
    if (!newFeature.trim()) {
      toast({
        title: 'Поле не может быть пустым',
        variant: 'destructive',
      });
      return;
    }

    // В реальном приложении здесь должен быть код для сохранения нового свойства
    toast({
      title: 'Особенность добавлена',
      description: 'Новая особенность успешно добавлена',
    });

    setNewFeature('');
  };

  const handleRemoveFeature = (index: number) => {
    // В реальном приложении здесь должен быть код для удаления свойства
    toast({
      title: 'Особенность удалена',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Особенности и черты</h3>
      
      {features.length === 0 ? (
        <p className="text-muted-foreground italic">Нет доступных особенностей.</p>
      ) : (
        <div className="space-y-2">
          {features.map((feature: string, index: number) => (
            <div key={index} className="p-3 bg-primary/5 rounded-md flex justify-between items-start">
              <div>
                <p className="font-medium">{feature}</p>
              </div>
              {isDM && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveFeature(index)}
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
            placeholder="Добавить новую особенность"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
          />
          <Button onClick={handleAddFeature}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeaturesTab;
