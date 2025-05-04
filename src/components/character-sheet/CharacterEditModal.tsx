
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CharacterEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: any;
  updateCharacter: (updates: any) => void;
}

const CharacterEditModal: React.FC<CharacterEditModalProps> = ({
  open,
  onOpenChange,
  character,
  updateCharacter
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Create state for each editable field
  const [formState, setFormState] = useState({
    name: character?.name || '',
    race: character?.race || '',
    class: character?.class || '',
    level: character?.level || 1,
    background: character?.background || '',
    alignment: character?.alignment || ''
  });
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: name === 'level' ? parseInt(value) : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCharacter(formState);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Редактировать персонажа</SheetTitle>
          <SheetDescription>
            Внесите изменения в информацию о персонаже
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input 
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="race">Раса</Label>
              <Input 
                id="race"
                name="race"
                value={formState.race}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="class">Класс</Label>
              <Input 
                id="class"
                name="class"
                value={formState.class}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Уровень</Label>
              <Input 
                id="level"
                name="level"
                type="number"
                min="1"
                max="20"
                value={formState.level}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="background">Предыстория</Label>
              <Input 
                id="background"
                name="background"
                value={formState.background}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alignment">Мировоззрение</Label>
              <Input 
                id="alignment"
                name="alignment"
                value={formState.alignment}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CharacterEditModal;
