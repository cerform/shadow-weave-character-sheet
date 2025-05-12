import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Character, Item } from '@/types/character';
import { Plus, Trash2, Coins, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EquipmentTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const EquipmentTab: React.FC<EquipmentTabProps> = ({ character, onUpdate }) => {
  const [newItem, setNewItem] = useState<Item>({ name: '', quantity: 1, type: 'misc' });
  const [activeTab, setActiveTab] = useState('equipment');
  const { toast } = useToast();

  const handleAddItem = () => {
    if (!newItem.name) {
      toast({
        title: "Ошибка",
        description: "Введите название предмета",
        variant: "destructive",
      });
      return;
    }

    const updatedEquipment = [...(character.equipment || []), { ...newItem, id: `item-${Date.now()}` }];
    onUpdate({ equipment: updatedEquipment });
    setNewItem({ name: '', quantity: 1, type: 'misc' });
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedEquipment = (character.equipment || []).filter(item => item.id !== itemId);
    onUpdate({ equipment: updatedEquipment });
  };

  const handleCurrencyChange = (currency: keyof typeof character.money, value: string) => {
    const numValue = parseInt(value) || 0;
    const updatedMoney = { ...character.money, [currency]: numValue };
    onUpdate({ money: updatedMoney });
  };

  const getItemsByType = (type: string) => {
    return (character.equipment || []).filter(item => item.type === type);
  };

  const weapons = getItemsByType('weapon');
  const armor = getItemsByType('armor');
  const misc = getItemsByType('misc');

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="equipment" className="flex-1">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Снаряжение
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex-1">
            <Coins className="mr-2 h-4 w-4" />
            Валюта
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Добавить предмет</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="item-name">Название</Label>
                  <Input
                    id="item-name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Название предмета"
                  />
                </div>
                <div>
                  <Label htmlFor="item-quantity">Количество</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="item-type">Тип</Label>
                  <select
                    id="item-type"
                    className="w-full p-2 border rounded"
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  >
                    <option value="weapon">Оружие</option>
                    <option value="armor">Броня</option>
                    <option value="misc">Прочее</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleAddItem} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Добавить
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Оружие</h3>
              {weapons.length > 0 ? (
                <div className="space-y-2">
                  {weapons.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.quantity > 1 && <span className="ml-2 text-sm">({item.quantity})</span>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id as string)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Нет оружия</p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Броня</h3>
              {armor.length > 0 ? (
                <div className="space-y-2">
                  {armor.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.quantity > 1 && <span className="ml-2 text-sm">({item.quantity})</span>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id as string)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Нет брони</p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Прочие предметы</h3>
              {misc.length > 0 ? (
                <div className="space-y-2">
                  {misc.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.quantity > 1 && <span className="ml-2 text-sm">({item.quantity})</span>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id as string)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Нет предметов</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle>Валюта</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="cp">Медные (CP)</Label>
                  <Input
                    id="cp"
                    type="number"
                    min="0"
                    value={character.money?.cp || 0}
                    onChange={(e) => handleCurrencyChange('cp', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sp">Серебряные (SP)</Label>
                  <Input
                    id="sp"
                    type="number"
                    min="0"
                    value={character.money?.sp || 0}
                    onChange={(e) => handleCurrencyChange('sp', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ep">Электрум (EP)</Label>
                  <Input
                    id="ep"
                    type="number"
                    min="0"
                    value={character.money?.ep || 0}
                    onChange={(e) => handleCurrencyChange('ep', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gp">Золотые (GP)</Label>
                  <Input
                    id="gp"
                    type="number"
                    min="0"
                    value={character.money?.gp || 0}
                    onChange={(e) => handleCurrencyChange('gp', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pp">Платиновые (PP)</Label>
                  <Input
                    id="pp"
                    type="number"
                    min="0"
                    value={character.money?.pp || 0}
                    onChange={(e) => handleCurrencyChange('pp', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Курс обмена: 1 PP = 10 GP = 20 EP = 100 SP = 1000 CP
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EquipmentTab;
