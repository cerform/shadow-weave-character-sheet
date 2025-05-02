
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SavedMap } from '@/stores/sessionStore';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Save, Download, Trash } from 'lucide-react';

interface MapSaveLoadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'save' | 'load';
  onSave: (name: string) => void;
  onLoad: (mapId: string) => void;
  onDelete: (mapId: string) => void;
  maps: SavedMap[];
}

const MapSaveLoad: React.FC<MapSaveLoadProps> = ({
  open,
  onOpenChange,
  mode,
  onSave,
  onLoad,
  onDelete,
  maps
}) => {
  const [mapName, setMapName] = useState('');
  
  const handleSave = () => {
    if (mapName.trim()) {
      onSave(mapName);
      setMapName('');
      onOpenChange(false);
    }
  };
  
  const handleLoad = (mapId: string) => {
    onLoad(mapId);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'save' ? 'Сохранить карту' : 'Загрузить карту'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'save' 
              ? 'Сохраните текущее состояние карты со всеми токенами и настройками.' 
              : 'Выберите сохраненную карту для загрузки.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'save' && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="map-name" className="text-right">
                Название
              </Label>
              <Input
                id="map-name"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                placeholder="Название карты"
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
        )}
        
        {mode === 'load' && maps.length > 0 && (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {maps.map((map) => (
                <div
                  key={map.id}
                  className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{map.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(map.createdAt), { 
                        addSuffix: true, 
                        locale: ru 
                      })}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleLoad(map.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => onDelete(map.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {mode === 'load' && maps.length === 0 && (
          <div className="py-6 text-center text-muted-foreground">
            У вас пока нет сохраненных карт.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          {mode === 'save' && (
            <Button onClick={handleSave} disabled={!mapName.trim()}>
              <Save className="h-4 w-4 mr-2" /> Сохранить
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapSaveLoad;
