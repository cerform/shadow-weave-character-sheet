
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CharacterSpell } from '@/types/character';
import { getAllSpells } from '@/data/spells';

const SpellDatabaseManager: React.FC = () => {
  const [newSpell, setNewSpell] = useState<Partial<CharacterSpell>>({
    name: '',
    level: 0,
    school: '',
    castingTime: '1 действие',
    range: '',
    components: '',
    duration: '',
    description: '',
    prepared: false
  });
  
  const [spells, setSpells] = useState<CharacterSpell[]>([]);
  const [batchInput, setBatchInput] = useState<string>('');
  
  useEffect(() => {
    // Загружаем существующие заклинания при инициализации компонента
    setSpells(getAllSpells());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSpell(prev => ({
      ...prev,
      [name]: name === 'level' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleAddSpell = () => {
    if (!newSpell.name || !newSpell.school) {
      alert('Пожалуйста, заполните обязательные поля: название и школа магии');
      return;
    }
    
    // Добавляем новое заклинание
    const completeSpell: CharacterSpell = {
      ...newSpell as CharacterSpell,
      prepared: false
    };
    
    setSpells(prev => [...prev, completeSpell]);
    
    // Очищаем форму
    setNewSpell({
      name: '',
      level: 0,
      school: '',
      castingTime: '1 действие',
      range: '',
      components: '',
      duration: '',
      description: '',
      prepared: false
    });
  };

  // Обработка пакетного добавления заклинаний
  const handleBatchImport = () => {
    // Здесь должна быть логика обработки пакетного ввода
    console.log('Batch import not implemented yet');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Управление базой заклинаний</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Добавить новое заклинание</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Название*</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={newSpell.name} 
                    onChange={handleInputChange} 
                    placeholder="Название заклинания" 
                  />
                </div>
                <div>
                  <Label htmlFor="level">Уровень</Label>
                  <Input 
                    id="level" 
                    name="level" 
                    type="number" 
                    min="0"
                    max="9"
                    value={newSpell.level} 
                    onChange={handleInputChange} 
                    placeholder="0" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school">Школа магии*</Label>
                  <Input 
                    id="school" 
                    name="school" 
                    value={newSpell.school} 
                    onChange={handleInputChange} 
                    placeholder="Школа" 
                  />
                </div>
                <div>
                  <Label htmlFor="castingTime">Время накладывания</Label>
                  <Input 
                    id="castingTime" 
                    name="castingTime" 
                    value={newSpell.castingTime} 
                    onChange={handleInputChange} 
                    placeholder="1 действие" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="range">Дистанция</Label>
                  <Input 
                    id="range" 
                    name="range" 
                    value={newSpell.range} 
                    onChange={handleInputChange} 
                    placeholder="Дистанция" 
                  />
                </div>
                <div>
                  <Label htmlFor="components">Компоненты</Label>
                  <Input 
                    id="components" 
                    name="components" 
                    value={newSpell.components} 
                    onChange={handleInputChange} 
                    placeholder="В, С, М" 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Длительность</Label>
                <Input 
                  id="duration" 
                  name="duration" 
                  value={newSpell.duration} 
                  onChange={handleInputChange} 
                  placeholder="Длительность" 
                />
              </div>
              
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={newSpell.description} 
                  onChange={handleInputChange} 
                  placeholder="Описание заклинания..." 
                  rows={5}
                />
              </div>
              
              <Button onClick={handleAddSpell}>Добавить заклинание</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Пакетное добавление</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="batchInput">Вставьте список заклинаний</Label>
                <Textarea 
                  id="batchInput" 
                  value={batchInput} 
                  onChange={(e) => setBatchInput(e.target.value)} 
                  placeholder="[0] Название заклинания ВСМ..." 
                  rows={10}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Формат: [уровень] Название компоненты
                </p>
              </div>
              
              <Button onClick={handleBatchImport}>Импортировать</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Существующие заклинания ({spells.length})</h2>
        
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left">Название</th>
                <th className="px-4 py-2 text-left">Уровень</th>
                <th className="px-4 py-2 text-left">Школа</th>
                <th className="px-4 py-2 text-left">Действия</th>
              </tr>
            </thead>
            <tbody>
              {spells.map((spell, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{spell.name}</td>
                  <td className="px-4 py-2">{spell.level}</td>
                  <td className="px-4 py-2">{spell.school}</td>
                  <td className="px-4 py-2">
                    <Button variant="outline" size="sm">Просмотреть</Button>
                  </td>
                </tr>
              ))}
              {spells.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-center text-muted-foreground">
                    Заклинания не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpellDatabaseManager;
