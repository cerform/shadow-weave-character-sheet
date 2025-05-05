
import React from 'react';
import { Character } from '@/contexts/CharacterContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface EquipmentTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

interface Equipment {
  weapons?: string[];
  armor?: string;
  items?: string[];
}

interface Money {
  cp?: number;
  sp?: number;
  ep?: number;
  gp?: number;
  pp?: number;
}

export const EquipmentTab: React.FC<EquipmentTabProps> = ({ character, onUpdate }) => {
  // Преобразуем equipment из string[] в объект с оружием и предметами
  const equipmentItems: Equipment = typeof character.equipment === 'object' && !Array.isArray(character.equipment) 
    ? character.equipment as unknown as Equipment 
    : { weapons: [], armor: "", items: [] };

  // Получаем деньги персонажа или используем значения по умолчанию
  const money: Money = character.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

  return (
    <div>
      <h2>Снаряжение</h2>
      <div className="space-y-4">
        <Card className="border-t-4 border-t-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Снаряжение</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Оружие и доспехи</h3>
                <div className="bg-primary/10 rounded p-3">
                  <p className="text-sm">
                    {equipmentItems.weapons?.join(', ') || 'Нет оружия'}
                  </p>
                  <p className="text-sm mt-2">
                    {equipmentItems.armor || 'Нет доспехов'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Снаряжение и предметы</h3>
                <div className="bg-primary/10 rounded p-3">
                  <p className="text-sm">
                    {equipmentItems.items?.join(', ') || 'Нет предметов'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Сокровища</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="bg-primary/10 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">ММ</div>
                  <div className="font-medium">{money.cp || 0}</div>
                </div>
                <div className="bg-primary/10 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">СМ</div>
                  <div className="font-medium">{money.sp || 0}</div>
                </div>
                <div className="bg-primary/10 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">ЭМ</div>
                  <div className="font-medium">{money.ep || 0}</div>
                </div>
                <div className="bg-primary/10 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">ЗМ</div>
                  <div className="font-medium">{money.gp || 0}</div>
                </div>
                <div className="bg-primary/10 rounded p-2 text-center">
                  <div className="text-xs text-muted-foreground">ПМ</div>
                  <div className="font-medium">{money.pp || 0}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
