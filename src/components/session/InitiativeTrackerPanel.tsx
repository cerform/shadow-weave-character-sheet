// Import React and required components
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Initiative, TokenData } from '@/types/session.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowUp, 
  ArrowDown, 
  Edit, 
  Trash2, 
  PlayCircle, 
  PauseCircle, 
  FastForward,
  Plus,
  Dices
} from "lucide-react";

interface InitiativeTrackerPanelProps {
  initiative: Initiative[];
  tokens: TokenData[];
  battleActive: boolean;
  sessionId: string;
  onUpdateInitiative: (initiative: Initiative[]) => void;
  onToggleBattle: () => void;
  onNextTurn: () => void;
}

const InitiativeTrackerPanel: React.FC<InitiativeTrackerPanelProps> = ({
  initiative,
  tokens,
  battleActive,
  sessionId,
  onUpdateInitiative,
  onToggleBattle,
  onNextTurn
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');
  const [newEntryRoll, setNewEntryRoll] = useState<number>(10);
  const [editingEntry, setEditingEntry] = useState<Initiative | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Handle drag-and-drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const reordered = Array.from(initiative);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    
    // Update active status if needed
    const updatedInitiative: Initiative[] = reordered.map(item => ({
      ...item
    }));
    
    onUpdateInitiative(updatedInitiative);
  };

  // Handle adding a new entry
  const handleAddEntry = () => {
    if (!newEntryName) return;
    
    const newEntry: Initiative = {
      id: `init-${Date.now()}`,
      tokenId: 0, // Default placeholder
      name: newEntryName,
      roll: newEntryRoll,
      isActive: initiative.length === 0 // First entry is active by default
    };
    
    const updatedInitiative: Initiative[] = [...initiative, newEntry];
    // Sort by initiative roll in descending order
    updatedInitiative.sort((a, b) => b.roll - a.roll);
    
    onUpdateInitiative(updatedInitiative);
    setNewEntryName('');
    setNewEntryRoll(10);
    setIsAddDialogOpen(false);
  };

  // Handle removing an entry
  const handleRemoveEntry = (id: string) => {
    const updatedInitiative: Initiative[] = initiative.filter(item => item.id !== id);
    
    // If active entry was removed, set the first entry as active
    if (updatedInitiative.length > 0 && !updatedInitiative.some(item => item.isActive)) {
      updatedInitiative[0].isActive = true;
    }
    
    onUpdateInitiative(updatedInitiative);
  };

  // Handle moving an entry up in the list
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    
    const updatedInitiative: Initiative[] = [...initiative];
    [updatedInitiative[index - 1], updatedInitiative[index]] = 
      [updatedInitiative[index], updatedInitiative[index - 1]];
    
    onUpdateInitiative(updatedInitiative);
  };

  // Handle moving an entry down in the list
  const handleMoveDown = (index: number) => {
    if (index >= initiative.length - 1) return;
    
    const updatedInitiative: Initiative[] = [...initiative];
    [updatedInitiative[index], updatedInitiative[index + 1]] = 
      [updatedInitiative[index + 1], updatedInitiative[index]];
    
    onUpdateInitiative(updatedInitiative);
  };

  // Handle setting an entry as active
  const handleSetActive = (id: string) => {
    const updatedInitiative: Initiative[] = initiative.map(item => ({
      ...item,
      isActive: item.id === id
    }));
    
    onUpdateInitiative(updatedInitiative);
  };

  // Handle opening edit dialog
  const handleEditClick = (entry: Initiative) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  // Handle saving edited entry
  const handleSaveEdit = () => {
    if (!editingEntry) return;
    
    const updatedInitiative: Initiative[] = initiative.map(item => 
      item.id === editingEntry.id ? editingEntry : item
    );
    
    onUpdateInitiative(updatedInitiative);
    setIsEditDialogOpen(false);
    setEditingEntry(null);
  };

  // Handle rolling initiative for all tokens
  const handleRollAll = () => {
    // Create entries for tokens that don't already have initiative
    const existingTokenIds = initiative.map(item => item.tokenId);
    const newEntries: Initiative[] = [];
    
    tokens.forEach(token => {
      if (!existingTokenIds.includes(token.id)) {
        // Roll 1d20
        const roll = Math.floor(Math.random() * 20) + 1;
        newEntries.push({
          id: `init-${Date.now()}-${token.id}`,
          tokenId: token.id,
          name: token.name,
          roll,
          isActive: false
        });
      }
    });
    
    const updatedInitiative: Initiative[] = [...initiative, ...newEntries];
    // Sort by initiative roll
    updatedInitiative.sort((a, b) => b.roll - a.roll);
    
    // Set the first entry as active
    if (updatedInitiative.length > 0) {
      updatedInitiative[0].isActive = true;
    }
    
    onUpdateInitiative(updatedInitiative);
  };

  

  return (
    <div className="initiative-tracker p-2 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-bold">Инициатива</h3>
          {battleActive && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Бой активен
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant={battleActive ? "destructive" : "default"} onClick={onToggleBattle}>
            {battleActive ? (
              <>
                <PauseCircle className="mr-1 h-4 w-4" /> Завершить бой
              </>
            ) : (
              <>
                <PlayCircle className="mr-1 h-4 w-4" /> Начать бой
              </>
            )}
          </Button>
        </div>
      </div>

      {battleActive && (
        <div className="my-2 flex gap-2">
          <Button variant="outline" onClick={onNextTurn} className="w-full">
            <FastForward className="mr-1 h-4 w-4" /> Следующий ход
          </Button>
          <Button variant="outline" onClick={handleRollAll} className="whitespace-nowrap">
            <Dices className="mr-1 h-4 w-4" /> Ролл всем
          </Button>
        </div>
      )}

      {battleActive ? (
        initiative.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="initiative-list">
              {(provided) => (
                <div
                  className="flex-1 overflow-y-auto space-y-2 p-1"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {initiative.map((item, index) => {
                    const token = tokens.find(t => t.id === item.tokenId);
                    
                    return (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center border rounded-lg p-2 ${
                              snapshot.isDragging ? 'bg-accent/50' : item.isActive ? 'bg-accent/30 border-primary' : 'bg-card'
                            }`}
                          >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-accent rounded-full mr-2">
                              <span className="font-bold">{item.roll}</span>
                            </div>
                            
                            {token && token.img && (
                              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                                <img src={token.img} alt={token.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                            </div>
                            
                            <div className="flex gap-1 items-center">
                              {item.isActive && (
                                <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                                  Ход
                                </span>
                              )}
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleMoveUp(index)}>
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleMoveDown(index)}>
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditClick(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRemoveEntry(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {!item.isActive && (
                                <Button size="sm" variant="outline" onClick={() => handleSetActive(item.id)}>
                                  Активный
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">Добавьте участников в список инициативы</p>
          </div>
        )
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Нажмите "Начать бой", чтобы активировать трекер инициативы</p>
        </div>
      )}

      {battleActive && (
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" /> Добавить существо
          </Button>
        </div>
      )}

      {/* Dialog for adding new initiative entry */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить в инициативу</DialogTitle>
            <DialogDescription>
              Введите имя существа и значение инициативы
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Имя</label>
              <Input
                id="name"
                value={newEntryName}
                onChange={(e) => setNewEntryName(e.target.value)}
                placeholder="Имя существа"
              />
            </div>
            <div>
              <label htmlFor="initiative" className="block text-sm font-medium mb-1">Инициатива</label>
              <Input
                id="initiative"
                type="number"
                value={newEntryRoll}
                onChange={(e) => setNewEntryRoll(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAddEntry}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing initiative entry */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium mb-1">Имя</label>
              <Input
                id="edit-name"
                value={editingEntry?.name || ''}
                onChange={(e) => setEditingEntry(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div>
              <label htmlFor="edit-initiative" className="block text-sm font-medium mb-1">Инициатива</label>
              <Input
                id="edit-initiative"
                type="number"
                value={editingEntry?.roll || 0}
                onChange={(e) => setEditingEntry(prev => prev ? { ...prev, roll: parseInt(e.target.value) || 0 } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSaveEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InitiativeTrackerPanel;
