import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wand2 } from 'lucide-react';
import { EnhancedToken } from '@/stores/enhancedBattleStore';

interface SummonCreatureDialogProps {
  parentToken: EnhancedToken;
  sessionId: string;
  onSummon: (token: EnhancedToken) => void;
}

const creatureTemplates = [
  { name: 'Скелет', hp: 13, ac: 13, color: '#94a3b8', class: 'undead' },
  { name: 'Зомби', hp: 22, ac: 8, color: '#64748b', class: 'undead' },
  { name: 'Волк', hp: 11, ac: 13, color: '#78716c', class: 'beast' },
  { name: 'Медведь', hp: 34, ac: 11, color: '#92400e', class: 'beast' },
  { name: 'Элементаль огня', hp: 102, ac: 13, color: '#dc2626', class: 'elemental' },
  { name: 'Элементаль воды', hp: 114, ac: 14, color: '#0ea5e9', class: 'elemental' },
  { name: 'Призрак', hp: 45, ac: 11, color: '#a855f7', class: 'undead' },
  { name: 'Бес', hp: 10, ac: 13, color: '#7c2d12', class: 'fiend' },
];

export const SummonCreatureDialog: React.FC<SummonCreatureDialogProps> = ({ 
  parentToken, 
  sessionId,
  onSummon 
}) => {
  const [open, setOpen] = useState(false);
  const [creatureName, setCreatureName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof creatureTemplates[0] | null>(null);
  const [hp, setHp] = useState(10);
  const [ac, setAc] = useState(10);
  const { toast } = useToast();

  const handleTemplateChange = (templateName: string) => {
    const template = creatureTemplates.find(t => t.name === templateName);
    if (template) {
      setSelectedTemplate(template);
      setCreatureName(template.name);
      setHp(template.hp);
      setAc(template.ac);
    }
  };

  const handleSummon = async () => {
    if (!creatureName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите имя существа",
        variant: "destructive"
      });
      return;
    }

    try {
      // Создаем токен в БД
      const { data: newToken, error } = await supabase
        .from('battle_tokens')
        .insert({
          session_id: sessionId,
          name: creatureName,
          owner_id: parentToken.owner_id,
          summoned_by: parentToken.id,
          is_summoned: true,
          current_hp: hp,
          max_hp: hp,
          armor_class: ac,
          position_x: parentToken.position[0] + 1,
          position_y: parentToken.position[2] + 1,
          color: selectedTemplate?.color || '#8b5cf6',
          token_type: 'npc',
          is_visible: true,
          is_hidden_from_players: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Добавляем в локальный стор
      const summonedToken: EnhancedToken = {
        id: newToken.id,
        name: newToken.name,
        hp: newToken.current_hp || hp,
        maxHp: newToken.max_hp || hp,
        ac: newToken.armor_class || ac,
        position: [newToken.position_x, 0, newToken.position_y],
        conditions: [],
        isEnemy: false,
        isVisible: true,
        color: newToken.color || '#8b5cf6',
        owner_id: parentToken.owner_id,
        summoned_by: parentToken.id,
        is_summoned: true,
      };

      onSummon(summonedToken);

      toast({
        title: "Существо призвано",
        description: `${creatureName} появилось на поле боя`
      });

      setOpen(false);
      setCreatureName('');
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Ошибка призыва:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось призвать существо",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wand2 className="h-4 w-4" />
          Призвать существо
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Призвать существо</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Шаблоны существ */}
          <div className="space-y-2">
            <Label>Выберите существо</Label>
            <Select onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите из списка" />
              </SelectTrigger>
              <SelectContent>
                {creatureTemplates.map((template) => (
                  <SelectItem key={template.name} value={template.name}>
                    {template.name} (HP: {template.hp}, AC: {template.ac})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Имя существа */}
          <div className="space-y-2">
            <Label htmlFor="creature-name">Имя существа</Label>
            <Input
              id="creature-name"
              value={creatureName}
              onChange={(e) => setCreatureName(e.target.value)}
              placeholder="Например: Скелет-воин"
            />
          </div>

          {/* HP */}
          <div className="space-y-2">
            <Label htmlFor="creature-hp">Хиты (HP)</Label>
            <Input
              id="creature-hp"
              type="number"
              value={hp}
              onChange={(e) => setHp(parseInt(e.target.value) || 10)}
              min={1}
            />
          </div>

          {/* AC */}
          <div className="space-y-2">
            <Label htmlFor="creature-ac">Класс брони (AC)</Label>
            <Input
              id="creature-ac"
              type="number"
              value={ac}
              onChange={(e) => setAc(parseInt(e.target.value) || 10)}
              min={1}
            />
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSummon}>
              Призвать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
