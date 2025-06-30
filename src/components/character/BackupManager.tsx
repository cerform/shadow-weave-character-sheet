
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Download, Trash2 } from 'lucide-react';
import { Character } from '@/types/character';
import { getAllBackups, restoreFromBackup } from '@/services/characterService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface BackupManagerProps {
  onRestore?: (character: Character) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ onRestore }) => {
  const [backups, setBackups] = useState<Array<{ id: string; character: Character; timestamp: string }>>([]);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    const allBackups = getAllBackups();
    setBackups(allBackups);
  };

  const handleRestore = (backup: { id: string; character: Character; timestamp: string }) => {
    try {
      if (onRestore) {
        onRestore(backup.character);
        toast.success(`Персонаж "${backup.character.name}" восстановлен из резервной копии`);
      }
    } catch (error) {
      console.error('Ошибка восстановления:', error);
      toast.error('Ошибка при восстановлении персонажа');
    }
  };

  const handleDeleteBackup = (id: string) => {
    try {
      localStorage.removeItem(`character_backup_${id}`);
      loadBackups();
      toast.success('Резервная копия удалена');
    } catch (error) {
      console.error('Ошибка удаления резервной копии:', error);
      toast.error('Ошибка при удалении резервной копии');
    }
  };

  if (backups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Резервные копии
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Резервные копии персонажей не найдены.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Резервные копии ({backups.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{backup.character.name}</span>
                    <Badge variant="secondary">
                      Уровень {backup.character.level}
                    </Badge>
                    <Badge variant="outline">
                      {backup.character.race} {backup.character.class}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Сохранено {formatDistanceToNow(new Date(backup.timestamp), { 
                      addSuffix: true, 
                      locale: ru 
                    })}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(backup)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Восстановить
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteBackup(backup.id)}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BackupManager;
