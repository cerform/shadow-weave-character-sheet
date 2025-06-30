
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Save } from 'lucide-react';
import { Character } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';
import { toast } from 'sonner';

interface CharacterImportExportProps {
  character: Character;
  onImport?: (character: Character) => void;
}

const CharacterImportExport: React.FC<CharacterImportExportProps> = ({ 
  character, 
  onImport 
}) => {
  const { updateCharacter } = useCharacter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToJSON = () => {
    try {
      const dataStr = JSON.stringify(character, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${character.name || 'character'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('Персонаж экспортирован в JSON');
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      toast.error('Ошибка при экспорте персонажа');
    }
  };

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const importedCharacter: Character = JSON.parse(jsonData);
        
        // Валидация основных полей
        if (!importedCharacter.name) {
          toast.error('Неверный формат файла: отсутствует имя персонажа');
          return;
        }

        // Обновляем ID и временные метки
        const updatedCharacter = {
          ...importedCharacter,
          id: character.id || importedCharacter.id,
          updatedAt: new Date().toISOString(),
          userId: character.userId
        };

        if (onImport) {
          onImport(updatedCharacter);
        } else {
          updateCharacter(updatedCharacter);
        }
        
        toast.success(`Персонаж "${importedCharacter.name}" успешно импортирован`);
      } catch (error) {
        console.error('Ошибка импорта:', error);
        toast.error('Ошибка при импорте файла. Проверьте формат JSON.');
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  const saveToLocalStorage = () => {
    try {
      const key = `character_backup_${character.id || 'temp'}`;
      localStorage.setItem(key, JSON.stringify(character));
      toast.success('Персонаж сохранен в локальное хранилище');
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error);
      toast.error('Ошибка при сохранении в локальное хранилище');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Импорт/Экспорт персонажа
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button onClick={exportToJSON} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Экспорт в JSON
          </Button>
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Импорт из JSON
          </Button>
          
          <Button onClick={saveToLocalStorage} variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Сохранить локально
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={importFromJSON}
          className="hidden"
        />
        
        <p className="text-sm text-muted-foreground">
          JSON файлы позволят вам делиться персонажами или создавать резервные копии.
        </p>
      </CardContent>
    </Card>
  );
};

export default CharacterImportExport;
