import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Save,
  X,
  Upload,
  Eye,
  EyeOff,
  Shield,
  Heart,
  Sword,
  Zap,
  Target,
  Users,
  Tag,
  Image
} from 'lucide-react';

export interface TokenData {
  id: string;
  name: string;
  avatar?: string;
  token_type: 'player' | 'npc' | 'monster' | 'object';
  max_hp?: number;
  current_hp?: number;
  armor_class?: number;
  position_x: number;
  position_y: number;
  size: number;
  color: string;
  is_hidden_from_players: boolean;
  conditions: string[];
  notes?: string;
  controlled_by?: string;
  tags: string[];
  // Дополнительные D&D характеристики
  initiative_bonus?: number;
  speed?: number;
  abilities?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

interface TokenEditorProps {
  token: TokenData | null;
  isOpen: boolean;
  onSave: (token: TokenData) => void;
  onCancel: () => void;
  onDelete?: (tokenId: string) => void;
}

const TokenEditor: React.FC<TokenEditorProps> = ({
  token,
  isOpen,
  onSave,
  onCancel,
  onDelete
}) => {
  const [formData, setFormData] = useState<TokenData>(
    token || {
      id: '',
      name: '',
      token_type: 'monster',
      position_x: 0,
      position_y: 0,
      size: 1,
      color: '#ef4444',
      is_hidden_from_players: false,
      conditions: [],
      tags: []
    }
  );

  const [newCondition, setNewCondition] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  const addCondition = () => {
    if (newCondition.trim() && !formData.conditions.includes(newCondition.trim())) {
      setFormData(prev => ({
        ...prev,
        conditions: [...prev.conditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c !== condition)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const tokenTypes = [
    { value: 'player', label: 'Player Character', color: '#3b82f6' },
    { value: 'npc', label: 'NPC', color: '#10b981' },
    { value: 'monster', label: 'Monster/Enemy', color: '#ef4444' },
    { value: 'object', label: 'Object/Prop', color: '#6b7280' }
  ];

  const commonConditions = [
    'Poisoned', 'Charmed', 'Frightened', 'Paralyzed', 'Stunned',
    'Prone', 'Grappled', 'Restrained', 'Blinded', 'Deafened'
  ];

  const commonTags = [
    'Humanoid', 'Beast', 'Undead', 'Fiend', 'Celestial',
    'Boss', 'Minion', 'Elite', 'Spellcaster', 'Ranged'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            {token?.id ? 'Edit Token' : 'Create New Token'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="basic" className="text-white">Basic Info</TabsTrigger>
              <TabsTrigger value="stats" className="text-white">Combat Stats</TabsTrigger>
              <TabsTrigger value="advanced" className="text-white">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Avatar Section */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Avatar</Label>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-24 h-24 bg-slate-700 border-2 border-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
                      {formData.avatar ? (
                        <img 
                          src={formData.avatar} 
                          alt="Token Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Basic Fields */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-300">Name*</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Token name"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Type</Label>
                    <Select
                      value={formData.token_type}
                      onValueChange={(value: any) => {
                        const tokenType = tokenTypes.find(t => t.value === value);
                        setFormData(prev => ({ 
                          ...prev, 
                          token_type: value,
                          color: tokenType?.color || prev.color
                        }));
                      }}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {tokenTypes.map(type => (
                          <SelectItem key={type.value} value={type.value} className="text-white">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: type.color }}
                              />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">Size</Label>
                    <Select
                      value={formData.size.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, size: parseInt(value) }))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="0.5" className="text-white">Tiny (0.5x)</SelectItem>
                        <SelectItem value="1" className="text-white">Medium (1x)</SelectItem>
                        <SelectItem value="2" className="text-white">Large (2x)</SelectItem>
                        <SelectItem value="3" className="text-white">Huge (3x)</SelectItem>
                        <SelectItem value="4" className="text-white">Gargantuan (4x)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Controlled By</Label>
                <Input
                  value={formData.controlled_by || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, controlled_by: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Player name or DM"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Hidden from Players</Label>
                <Switch
                  checked={formData.is_hidden_from_players}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_hidden_from_players: checked }))}
                />
              </div>
            </TabsContent>

            {/* Combat Stats Tab */}
            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-400" />
                    Max HP
                  </Label>
                  <Input
                    type="number"
                    value={formData.max_hp || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      max_hp: parseInt(e.target.value) || undefined,
                      current_hp: prev.current_hp || parseInt(e.target.value) || undefined
                    }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 flex items-center gap-1">
                    <Heart className="h-4 w-4 text-green-400" />
                    Current HP
                  </Label>
                  <Input
                    type="number"
                    value={formData.current_hp || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_hp: parseInt(e.target.value) || undefined }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 flex items-center gap-1">
                    <Shield className="h-4 w-4 text-blue-400" />
                    Armor Class
                  </Label>
                  <Input
                    type="number"
                    value={formData.armor_class || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, armor_class: parseInt(e.target.value) || undefined }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    Initiative Bonus
                  </Label>
                  <Input
                    type="number"
                    value={formData.initiative_bonus || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, initiative_bonus: parseInt(e.target.value) || undefined }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="+0"
                  />
                </div>
              </div>

              {/* Ability Scores */}
              <div>
                <Label className="text-slate-300 mb-2 block">Ability Scores</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(ability => (
                    <div key={ability}>
                      <Label className="text-xs text-slate-400 capitalize">{ability.slice(0, 3)}</Label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={formData.abilities?.[ability as keyof typeof formData.abilities] || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          abilities: {
                            ...prev.abilities,
                            [ability]: parseInt(e.target.value) || 10
                          } as any
                        }))}
                        className="bg-slate-700 border-slate-600 text-white text-sm h-8"
                        placeholder="10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              {/* Conditions */}
              <div>
                <Label className="text-slate-300 mb-2 block">Conditions</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                    className="bg-slate-700 border-slate-600 text-white flex-1"
                    placeholder="Add condition..."
                  />
                  <Button onClick={addCondition} size="sm" className="bg-green-600 hover:bg-green-700">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {commonConditions.map(condition => (
                    <Button
                      key={condition}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!formData.conditions.includes(condition)) {
                          setFormData(prev => ({
                            ...prev,
                            conditions: [...prev.conditions, condition]
                          }));
                        }
                      }}
                      className="text-xs border-slate-600 text-slate-300 h-6"
                    >
                      {condition}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.conditions.map(condition => (
                    <Badge
                      key={condition}
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => removeCondition(condition)}
                    >
                      {condition} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-slate-300 mb-2 block">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="bg-slate-700 border-slate-600 text-white flex-1"
                    placeholder="Add tag..."
                  />
                  <Button onClick={addTag} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Tag className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {commonTags.map(tag => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!formData.tags.includes(tag)) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag]
                          }));
                        }
                      }}
                      className="text-xs border-slate-600 text-slate-300 h-6"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer bg-blue-600/20 text-blue-300"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-slate-300">Notes (DM Only)</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Private notes for DM..."
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Action Buttons */}
        <Separator className="bg-slate-700" />
        <div className="flex justify-between">
          <div>
            {token?.id && onDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete(token.id)}
                className="bg-red-600/20 text-red-400 border-red-600/50"
              >
                <X className="h-4 w-4 mr-2" />
                Delete Token
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Token
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenEditor;