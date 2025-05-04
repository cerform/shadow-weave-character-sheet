
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EquipmentTabProps {
  character?: any;
  onUpdate?: (updates: any) => void;
}

export const EquipmentTab: React.FC<EquipmentTabProps> = ({ character, onUpdate }) => {
  return (
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
                  {character?.equipment?.weapons?.join(', ') || 'Нет оружия'}
                </p>
                <p className="text-sm mt-2">
                  {character?.equipment?.armor || 'Нет доспехов'}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Снаряжение и предметы</h3>
              <div className="bg-primary/10 rounded p-3">
                <p className="text-sm">
                  {character?.equipment?.items?.join(', ') || 'Нет предметов'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-medium mb-2">Сокровища</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="bg-primary/10 rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">ММ</div>
                <div className="font-medium">{character?.money?.cp || 0}</div>
              </div>
              <div className="bg-primary/10 rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">СМ</div>
                <div className="font-medium">{character?.money?.sp || 0}</div>
              </div>
              <div className="bg-primary/10 rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">ЭМ</div>
                <div className="font-medium">{character?.money?.ep || 0}</div>
              </div>
              <div className="bg-primary/10 rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">ЗМ</div>
                <div className="font-medium">{character?.money?.gp || 0}</div>
              </div>
              <div className="bg-primary/10 rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">ПМ</div>
                <div className="font-medium">{character?.money?.pp || 0}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
