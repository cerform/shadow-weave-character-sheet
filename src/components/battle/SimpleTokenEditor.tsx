import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, Trash2, Upload, Image } from 'lucide-react';
import { defaultTokens } from '@/data/defaultTokens';

export interface Token {
  id: string;
  name: string;
  avatar?: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'player' | 'npc' | 'monster';
  hp?: number;
  maxHp?: number;
  ac?: number;
  speed?: number;
  controlledBy?: string;
  tags?: string[];
  notes?: string;
}

interface SimpleTokenEditorProps {
  token: Token;
  onSave: (token: Token) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const SimpleTokenEditor: React.FC<SimpleTokenEditorProps> = ({
  token,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [editedToken, setEditedToken] = useState<Token>({ ...token });

  const handleSave = () => {
    onSave(editedToken);
  };

  const updateField = <K extends keyof Token>(field: K, value: Token[K]) => {
    setEditedToken(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    updateField('tags', tags);
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Edit Token: {editedToken.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="basic" className="text-white data-[state=active]:bg-slate-600">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="combat" className="text-white data-[state=active]:bg-slate-600">
              Combat Stats
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-white data-[state=active]:bg-slate-600">
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                  id="name"
                  value={editedToken.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="type" className="text-white">Type</Label>
                <Select value={editedToken.type} onValueChange={(value: 'player' | 'npc' | 'monster') => updateField('type', value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="npc">NPC</SelectItem>
                    <SelectItem value="monster">Monster</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color" className="text-white">Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="color"
                    type="color"
                    value={editedToken.color}
                    onChange={(e) => updateField('color', e.target.value)}
                    className="w-16 h-10 bg-slate-700 border-slate-600"
                  />
                  <Input
                    value={editedToken.color}
                    onChange={(e) => updateField('color', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="#FF0000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="controlledBy" className="text-white">Controlled By</Label>
                <Input
                  id="controlledBy"
                  value={editedToken.controlledBy || ''}
                  onChange={(e) => updateField('controlledBy', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="DM, Player Name, etc."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="avatar" className="text-white">Аватар</Label>
              <div className="space-y-3">
                {/* Превью текущего аватара */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-slate-700 border-2 border-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
                    {editedToken.avatar ? (
                      <img 
                        src={editedToken.avatar} 
                        alt="Token Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.avatar-fallback')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'avatar-fallback w-full h-full flex items-center justify-center text-white font-bold text-sm';
                            fallback.style.backgroundColor = editedToken.color || '#6b7280';
                            fallback.textContent = editedToken.name.charAt(0).toUpperCase() || '?';
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <Image className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            updateField('avatar', event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      className="border-slate-600 text-slate-300"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Загрузить
                    </Button>
                    
                    {editedToken.avatar && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateField('avatar', '')}
                        className="border-slate-600 text-slate-300"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Предустановленные аватары */}
                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">Предустановленные аватары:</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {defaultTokens.map((token) => (
                      <button
                        key={token.id}
                        type="button"
                        onClick={() => {
                          updateField('avatar', token.image);
                          if (!editedToken.name || editedToken.name === 'Новый токен') {
                            updateField('name', token.name);
                          }
                        }}
                        className="w-12 h-12 bg-slate-600 border border-slate-500 rounded-lg overflow-hidden hover:border-blue-400 transition-colors"
                        title={token.name}
                      >
                        <img 
                          src={token.image} 
                          alt={token.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* URL поле как дополнительная опция */}
                <div>
                  <Label className="text-slate-300 text-sm">Или введите URL:</Label>
                  <Input
                    value={editedToken.avatar || ''}
                    onChange={(e) => updateField('avatar', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="combat" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hp" className="text-white">Current HP</Label>
                <Input
                  id="hp"
                  type="number"
                  value={editedToken.hp || ''}
                  onChange={(e) => updateField('hp', parseInt(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="maxHp" className="text-white">Max HP</Label>
                <Input
                  id="maxHp"
                  type="number"
                  value={editedToken.maxHp || ''}
                  onChange={(e) => updateField('maxHp', parseInt(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="ac" className="text-white">Armor Class</Label>
                <Input
                  id="ac"
                  type="number"
                  value={editedToken.ac || ''}
                  onChange={(e) => updateField('ac', parseInt(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="speed" className="text-white">Speed (feet)</Label>
              <Input
                id="speed"
                type="number"
                value={editedToken.speed || ''}
                onChange={(e) => updateField('speed', parseInt(e.target.value) || 0)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="30"
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label htmlFor="tags" className="text-white">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={editedToken.tags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="humanoid, goblinoid, small"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <textarea
                id="notes"
                value={editedToken.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                className="w-full h-24 p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                placeholder="Additional notes about this token..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="x" className="text-white">X Position</Label>
                <Input
                  id="x"
                  type="number"
                  value={editedToken.x}
                  onChange={(e) => updateField('x', parseInt(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="y" className="text-white">Y Position</Label>
                <Input
                  id="y"
                  type="number"
                  value={editedToken.y}
                  onChange={(e) => updateField('y', parseInt(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <div>
            {onDelete && (
              <Button
                variant="destructive"
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleTokenEditor;