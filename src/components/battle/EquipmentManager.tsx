import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Shirt, Crown, ShoppingBag } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'helmet' | 'boots';
  modelPath?: string;
  stats?: {
    damage?: string;
    ac?: number;
    bonus?: string;
  };
}

interface EquipmentManagerProps {
  currentEquipment: Equipment[];
  availableEquipment: Equipment[];
  onEquipmentChange: (equipment: Equipment[]) => void;
}

const equipmentTypes = [
  { type: 'weapon', icon: Sword, label: 'Оружие' },
  { type: 'armor', icon: Shield, label: 'Броня' },
  { type: 'accessory', icon: Shirt, label: 'Аксессуары' },
  { type: 'helmet', icon: Crown, label: 'Шлем' },
  { type: 'boots', icon: ShoppingBag, label: 'Обувь' },
];

const EquipmentManager: React.FC<EquipmentManagerProps> = ({
  currentEquipment,
  availableEquipment,
  onEquipmentChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getEquippedItem = (type: string) => {
    return currentEquipment.find(item => item.type === type);
  };

  const handleEquip = (item: Equipment) => {
    const newEquipment = currentEquipment.filter(eq => eq.type !== item.type);
    newEquipment.push(item);
    onEquipmentChange(newEquipment);
  };

  const handleUnequip = (type: string) => {
    const newEquipment = currentEquipment.filter(eq => eq.type !== type);
    onEquipmentChange(newEquipment);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sword className="w-4 h-4 mr-2" />
          Экипировка
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Управление экипировкой</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {equipmentTypes.map(({ type, icon: Icon, label }) => {
            const equippedItem = getEquippedItem(type);
            const availableItems = availableEquipment.filter(item => item.type === type);
            
            return (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5" />
                  <h3 className="font-semibold">{label}</h3>
                </div>
                
                <div className="space-y-2">
                  {equippedItem ? (
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <div>
                        <span className="font-medium">{equippedItem.name}</span>
                        {equippedItem.stats && (
                          <div className="flex gap-2 mt-1">
                            {equippedItem.stats.damage && (
                              <Badge variant="secondary">Урон: {equippedItem.stats.damage}</Badge>
                            )}
                            {equippedItem.stats.ac && (
                              <Badge variant="secondary">AC: +{equippedItem.stats.ac}</Badge>
                            )}
                            {equippedItem.stats.bonus && (
                              <Badge variant="secondary">{equippedItem.stats.bonus}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUnequip(type)}
                      >
                        Снять
                      </Button>
                    </div>
                  ) : (
                    <div className="p-2 border border-dashed border-gray-300 rounded text-center text-gray-500">
                      Ничего не надето
                    </div>
                  )}
                  
                  {availableItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-600">Доступные предметы:</h4>
                      {availableItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.stats && (
                              <div className="flex gap-2 mt-1">
                                {item.stats.damage && (
                                  <Badge variant="outline" className="text-xs">Урон: {item.stats.damage}</Badge>
                                )}
                                {item.stats.ac && (
                                  <Badge variant="outline" className="text-xs">AC: +{item.stats.ac}</Badge>
                                )}
                                {item.stats.bonus && (
                                  <Badge variant="outline" className="text-xs">{item.stats.bonus}</Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleEquip(item)}
                            disabled={equippedItem?.id === item.id}
                          >
                            Надеть
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentManager;