
import React from 'react';
import { Character } from '@/types/character';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SpellSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  isOpen,
  onClose,
  character,
  onUpdate
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Выбор заклинаний</DialogTitle>
          <DialogDescription>
            Выберите заклинания для вашего персонажа.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <Input placeholder="Поиск заклинаний..." className="mb-4" />
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
              <TabsTrigger value="level1">1 уровень</TabsTrigger>
              <TabsTrigger value="level2">2+ уровень</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <ScrollArea className="h-[400px]">
                <div className="text-center p-8 text-muted-foreground">
                  Загрузка списка заклинаний... (Функционал в разработке)
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="cantrips">
              <ScrollArea className="h-[400px]">
                <div className="text-center p-8 text-muted-foreground">
                  Заговоры будут доступны здесь (Функционал в разработке)
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="level1">
              <ScrollArea className="h-[400px]">
                <div className="text-center p-8 text-muted-foreground">
                  Заклинания 1 уровня будут доступны здесь (Функционал в разработке)
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="level2">
              <ScrollArea className="h-[400px]">
                <div className="text-center p-8 text-muted-foreground">
                  Заклинания 2+ уровня будут доступны здесь (Функционал в разработке)
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={onClose}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
