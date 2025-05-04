
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface EquipmentPanelProps {
  character: any;
  isDM?: boolean;
}

const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ character, isDM = false }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const [newItem, setNewItem] = useState('');
  
  // Get character equipment
  const equipment = character?.equipment || [];

  // Add a new item
  const addItem = () => {
    if (!newItem.trim()) return;
    
    // This is just a placeholder, actual implementation would update the character
    console.log('Add item:', newItem);
    setNewItem('');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: currentTheme.textColor }}>
        Снаряжение
      </h2>
      
      {isDM && (
        <div className="flex items-center gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Добавить предмет..."
          />
          <Button onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>
      )}
      
      {equipment.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          Снаряжения не добавлено
        </div>
      ) : (
        <div className="space-y-1">
          {equipment.map((item: string, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
              <span>{item}</span>
              {isDM && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentPanel;
