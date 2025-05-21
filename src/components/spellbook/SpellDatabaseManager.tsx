
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpellData } from '@/types/spells';
import { useToast } from '@/hooks/use-toast';
import { parseSpell } from '@/utils/spellParser';

// Импортируем сохранение заклинания из соответствующего сервиса
import { saveSpellToDatabase } from '@/services/spellService';

const SpellDatabaseManager: React.FC = () => {
  const [spellText, setSpellText] = useState('');
  const { toast } = useToast();

  const handleSaveSpell = async () => {
    if (!spellText.trim()) {
      toast({
        title: "Пустое заклинание",
        description: "Пожалуйста, введите текст заклинания для добавления",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedSpell = parseSpell(spellText);
      
      if (!parsedSpell || !parsedSpell.name) {
        toast({
          title: "Ошибка парсинга",
          description: "Не удалось распознать заклинание из текста",
          variant: "destructive",
        });
        return;
      }
      
      // Второй аргумент может быть null или userId
      await saveSpellToDatabase(parsedSpell, null);
      
      toast({
        title: "Заклинание добавлено",
        description: `Заклинание "${parsedSpell.name}" успешно добавлено в базу данных`,
      });
      
      setSpellText('');
    } catch (error) {
      console.error('Error saving spell:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить заклинание в базу данных",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить заклинание в базу</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="spellText">Текст заклинания</Label>
          <Textarea 
            id="spellText"
            value={spellText}
            onChange={(e) => setSpellText(e.target.value)}
            placeholder="Вставьте текст заклинания здесь..."
            className="min-h-[200px]"
          />
        </div>
        <Button onClick={handleSaveSpell}>Добавить заклинание</Button>
      </CardContent>
    </Card>
  );
};

export default SpellDatabaseManager;
