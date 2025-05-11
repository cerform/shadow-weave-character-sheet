
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Dice1, Shield, Swords, Scroll, Users, User, FileText, Layers } from 'lucide-react';

// Define NPC type
interface NPC {
  id: string;
  name: string;
  type: string;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  initiativeBonus: number;
  cr: string;
  description: string;
  token?: string;
  stats?: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  meta?: {
    size: string;
    alignment: string;
  };
  speed?: string;
  damageResistances?: string[];
  damageVulnerabilities?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  languages?: string[];
  senses?: string;
  actions?: { name: string; description: string }[];
  reactions?: { name: string; description: string }[];
  traits?: { name: string; description: string }[];
  legendaryActions?: { name: string; description: string }[];
  equipment?: { name: string; description: string }[];
  spells?: { name: string; description: string }[];
  notes?: string;
}

const DMSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // State for NPCs
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [editingNpc, setEditingNpc] = useState<boolean>(false);
  
  // State for NPC form
  const [npcName, setNpcName] = useState<string>('');
  const [npcType, setNpcType] = useState<string>('Humanoid');
  const [npcHp, setNpcHp] = useState<number>(10);
  const [npcMaxHp, setNpcMaxHp] = useState<number>(10);
  const [npcAc, setNpcAc] = useState<number>(10);
  const [npcInitiative, setNpcInitiative] = useState<number>(0);
  const [npcInitiativeBonus, setNpcInitiativeBonus] = useState<number>(0);
  const [npcCr, setNpcCr] = useState<string>('1/4');
  const [npcDescription, setNpcDescription] = useState<string>('');
  const [npcToken, setNpcToken] = useState<string>('');
  
  // State for NPC stats
  const [npcStr, setNpcStr] = useState<number>(10);
  const [npcDex, setNpcDex] = useState<number>(10);
  const [npcCon, setNpcCon] = useState<number>(10);
  const [npcInt, setNpcInt] = useState<number>(10);
  const [npcWis, setNpcWis] = useState<number>(10);
  const [npcCha, setNpcCha] = useState<number>(10);
  
  // State for NPC meta
  const [npcSize, setNpcSize] = useState<string>('Medium');
  const [npcAlignment, setNpcAlignment] = useState<string>('Neutral');
  
  // State for NPC additional details
  const [npcSpeed, setNpcSpeed] = useState<string>('30 ft.');
  const [npcDamageResistances, setNpcDamageResistances] = useState<string[]>([]);
  const [npcDamageVulnerabilities, setNpcDamageVulnerabilities] = useState<string[]>([]);
  const [npcDamageImmunities, setNpcDamageImmunities] = useState<string[]>([]);
  const [npcConditionImmunities, setNpcConditionImmunities] = useState<string[]>([]);
  const [npcLanguages, setNpcLanguages] = useState<string[]>(['Common']);
  const [npcSenses, setNpcSenses] = useState<string>('');
  
  // State for details lists
  const [npcDamageResistancesInput, setNpcDamageResistancesInput] = useState<string>('');
  const [npcDamageVulnerabilitiesInput, setNpcDamageVulnerabilitiesInput] = useState<string>('');
  const [npcDamageImmunitiesInput, setNpcDamageImmunitiesInput] = useState<string>('');
  const [npcConditionImmunitiesInput, setNpcConditionImmunitiesInput] = useState<string>('');
  const [npcLanguagesInput, setNpcLanguagesInput] = useState<string>('');
  
  // State for NPC actions, reactions, traits, etc.
  const [npcActions, setNpcActions] = useState<{ name: string; description: string }[]>([]);
  const [npcReactions, setNpcReactions] = useState<{ name: string; description: string }[]>([]);
  const [npcTraits, setNpcTraits] = useState<{ name: string; description: string }[]>([]);
  const [npcLegendaryActions, setNpcLegendaryActions] = useState<{ name: string; description: string }[]>([]);
  const [npcEquipment, setNpcEquipment] = useState<{ name: string; description: string }[]>([]);
  const [npcSpells, setNpcSpells] = useState<{ name: string; description: string }[]>([]);
  const [npcNotes, setNpcNotes] = useState<string>('');
  
  // State for action details
  const [actionName, setActionName] = useState<string>('');
  const [actionDescription, setActionDescription] = useState<string>('');
  const [reactionName, setReactionName] = useState<string>('');
  const [reactionDescription, setReactionDescription] = useState<string>('');
  const [traitName, setTraitName] = useState<string>('');
  const [traitDescription, setTraitDescription] = useState<string>('');
  const [legendaryActionName, setLegendaryActionName] = useState<string>('');
  const [legendaryActionDescription, setLegendaryActionDescription] = useState<string>('');
  const [equipmentName, setEquipmentName] = useState<string>('');
  const [equipmentDescription, setEquipmentDescription] = useState<string>('');
  const [spellName, setSpellName] = useState<string>('');
  const [spellDescription, setSpellDescription] = useState<string>('');
  
  // Add an NPC to the list
  const handleAddNpc = () => {
    const newNpc: NPC = {
      id: Math.random().toString(36).substr(2, 9),
      name: npcName || 'Unnamed NPC',
      type: npcType,
      hp: npcHp,
      maxHp: npcMaxHp,
      ac: npcAc,
      initiative: npcInitiative,
      initiativeBonus: npcInitiativeBonus,
      cr: npcCr,
      description: npcDescription,
      token: npcToken,
      stats: {
        str: npcStr,
        dex: npcDex,
        con: npcCon,
        int: npcInt,
        wis: npcWis,
        cha: npcCha
      },
      meta: {
        size: npcSize,
        alignment: npcAlignment
      },
      speed: npcSpeed,
      damageResistances: npcDamageResistances,
      damageVulnerabilities: npcDamageVulnerabilities,
      damageImmunities: npcDamageImmunities,
      conditionImmunities: npcConditionImmunities,
      languages: npcLanguages,
      senses: npcSenses,
      actions: npcActions,
      reactions: npcReactions,
      traits: npcTraits,
      legendaryActions: npcLegendaryActions,
      equipment: npcEquipment,
      spells: npcSpells,
      notes: npcNotes
    };
    
    setNpcs([...npcs, newNpc]);
    resetNpcForm();
    
    toast({
      title: 'NPC Added',
      description: `${newNpc.name} has been added to the session.`
    });
  };
  
  // Reset the NPC form
  const resetNpcForm = () => {
    setNpcName('');
    setNpcType('Humanoid');
    setNpcHp(10);
    setNpcMaxHp(10);
    setNpcAc(10);
    setNpcInitiative(0);
    setNpcInitiativeBonus(0);
    setNpcCr('1/4');
    setNpcDescription('');
    setNpcToken('');
    
    setNpcStr(10);
    setNpcDex(10);
    setNpcCon(10);
    setNpcInt(10);
    setNpcWis(10);
    setNpcCha(10);
    
    setNpcSize('Medium');
    setNpcAlignment('Neutral');
    
    setNpcSpeed('30 ft.');
    setNpcDamageResistances([]);
    setNpcDamageVulnerabilities([]);
    setNpcDamageImmunities([]);
    setNpcConditionImmunities([]);
    setNpcLanguages(['Common']);
    setNpcSenses('');
    
    setNpcActions([]);
    setNpcReactions([]);
    setNpcTraits([]);
    setNpcLegendaryActions([]);
    setNpcEquipment([]);
    setNpcSpells([]);
    setNpcNotes('');
    
    setActionName('');
    setActionDescription('');
    setReactionName('');
    setReactionDescription('');
    setTraitName('');
    setTraitDescription('');
    setLegendaryActionName('');
    setLegendaryActionDescription('');
    setEquipmentName('');
    setEquipmentDescription('');
    setSpellName('');
    setSpellDescription('');
  };
  
  // Handle adding various NPC details
  const handleAddAction = () => {
    if (actionName && actionDescription) {
      setNpcActions([...npcActions, { name: actionName, description: actionDescription }]);
      setActionName('');
      setActionDescription('');
    }
  };
  
  const handleAddReaction = () => {
    if (reactionName && reactionDescription) {
      setNpcReactions([...npcReactions, { name: reactionName, description: reactionDescription }]);
      setReactionName('');
      setReactionDescription('');
    }
  };
  
  const handleAddTrait = () => {
    if (traitName && traitDescription) {
      setNpcTraits([...npcTraits, { name: traitName, description: traitDescription }]);
      setTraitName('');
      setTraitDescription('');
    }
  };
  
  const handleAddLegendaryAction = () => {
    if (legendaryActionName && legendaryActionDescription) {
      setNpcLegendaryActions([...npcLegendaryActions, { name: legendaryActionName, description: legendaryActionDescription }]);
      setLegendaryActionName('');
      setLegendaryActionDescription('');
    }
  };
  
  const handleAddEquipment = () => {
    if (equipmentName && equipmentDescription) {
      setNpcEquipment([...npcEquipment, { name: equipmentName, description: equipmentDescription }]);
      setEquipmentName('');
      setEquipmentDescription('');
    }
  };
  
  const handleAddSpell = () => {
    if (spellName && spellDescription) {
      setNpcSpells([...npcSpells, { name: spellName, description: spellDescription }]);
      setSpellName('');
      setSpellDescription('');
    }
  };
  
  // Main component render
  return (
    <div className="container mx-auto p-4" style={{ color: currentTheme.textColor }}>
      <h1 className="text-3xl font-bold mb-6">Dungeon Master's Session</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - NPCs */}
        <div className="space-y-4">
          <Card style={{ background: currentTheme.cardBackground, borderColor: `${currentTheme.borderColor}80` }}>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">NPCs & Monsters</h2>
              
              {/* NPC List */}
              <div className="space-y-2 mb-4">
                {npcs.map(npc => (
                  <div 
                    key={npc.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-black/10 cursor-pointer"
                    onClick={() => setSelectedNpc(npc)}
                  >
                    <div>
                      <p className="font-medium">{npc.name}</p>
                      <p className="text-xs opacity-70">
                        {npc.type} • CR {npc.cr} • HP {npc.hp}/{npc.maxHp}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Delete NPC logic
                          setNpcs(npcs.filter(n => n.id !== npc.id));
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add NPC Button */}
              <Button 
                className="w-full"
                onClick={() => setEditingNpc(true)}
              >
                Add NPC
              </Button>
            </CardContent>
          </Card>
          
          {/* Additional DM tools can go here */}
        </div>
        
        {/* Middle column - Selected NPC */}
        <div className="space-y-4">
          {selectedNpc && (
            <Card style={{ background: currentTheme.cardBackground, borderColor: `${currentTheme.borderColor}80` }}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{selectedNpc.name}</h2>
                  <div className="text-sm opacity-70">
                    {selectedNpc.type} • CR {selectedNpc.cr}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-black/10 rounded">
                    <div className="text-sm opacity-70">HP</div>
                    <div className="font-bold">{selectedNpc.hp}/{selectedNpc.maxHp}</div>
                  </div>
                  <div className="text-center p-2 bg-black/10 rounded">
                    <div className="text-sm opacity-70">AC</div>
                    <div className="font-bold">{selectedNpc.ac}</div>
                  </div>
                  <div className="text-center p-2 bg-black/10 rounded">
                    <div className="text-sm opacity-70">Initiative</div>
                    <div className="font-bold">{selectedNpc.initiative}</div>
                  </div>
                </div>
                
                {/* NPC Stats */}
                <div className="grid grid-cols-6 gap-1 mb-4">
                  {selectedNpc.stats && Object.entries(selectedNpc.stats).map(([key, value]) => (
                    <div key={key} className="text-center p-2 bg-black/5 rounded">
                      <div className="uppercase text-xs opacity-70">{key}</div>
                      <div className="font-bold">{value}</div>
                    </div>
                  ))}
                </div>
                
                <p className="mb-4">{selectedNpc.description}</p>
                
                <Tabs defaultValue="actions">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                    <TabsTrigger value="traits">Traits</TabsTrigger>
                    <TabsTrigger value="spells">Spells</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="actions" className="space-y-2 mt-2">
                    {selectedNpc.actions && selectedNpc.actions.map((action, index) => (
                      <div key={index} className="p-2 bg-black/5 rounded">
                        <div className="font-semibold">{action.name}</div>
                        <div className="text-sm">{action.description}</div>
                      </div>
                    ))}
                    
                    {selectedNpc.legendaryActions && selectedNpc.legendaryActions.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Legendary Actions</h3>
                        {selectedNpc.legendaryActions.map((action, index) => (
                          <div key={index} className="p-2 bg-black/5 rounded mb-2">
                            <div className="font-semibold">{action.name}</div>
                            <div className="text-sm">{action.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="traits" className="space-y-2 mt-2">
                    {selectedNpc.traits && selectedNpc.traits.map((trait, index) => (
                      <div key={index} className="p-2 bg-black/5 rounded">
                        <div className="font-semibold">{trait.name}</div>
                        <div className="text-sm">{trait.description}</div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="spells" className="space-y-2 mt-2">
                    {selectedNpc.spells && selectedNpc.spells.map((spell, index) => (
                      <div key={index} className="p-2 bg-black/5 rounded">
                        <div className="font-semibold">{spell.name}</div>
                        <div className="text-sm">{spell.description}</div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-2">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-sm opacity-70">Size:</span> {selectedNpc.meta?.size}
                        </div>
                        <div>
                          <span className="text-sm opacity-70">Alignment:</span> {selectedNpc.meta?.alignment}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm opacity-70">Speed:</span> {selectedNpc.speed}
                      </div>
                      
                      {selectedNpc.damageResistances && selectedNpc.damageResistances.length > 0 && (
                        <div>
                          <span className="text-sm opacity-70">Damage Resistances:</span> {selectedNpc.damageResistances.join(', ')}
                        </div>
                      )}
                      
                      {selectedNpc.languages && selectedNpc.languages.length > 0 && (
                        <div>
                          <span className="text-sm opacity-70">Languages:</span> {selectedNpc.languages.join(', ')}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedNpc(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right column - Notes */}
        <div className="space-y-4">
          <Card style={{ background: currentTheme.cardBackground, borderColor: `${currentTheme.borderColor}80` }}>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Session Notes</h2>
              <textarea
                className="w-full h-64 p-2 bg-black/5 rounded"
                style={{ color: currentTheme.textColor }}
                placeholder="Write session notes here..."
              />
              <div className="mt-2 flex justify-end">
                <Button>Save Notes</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card style={{ background: currentTheme.cardBackground, borderColor: `${currentTheme.borderColor}80` }}>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Quick Reference</h2>
              <div className="space-y-2">
                <div className="p-2 bg-black/5 rounded">
                  <div className="font-semibold">Conditions</div>
                  <div className="text-sm">Blinded, Charmed, Deafened, Frightened, Grappled, Incapacitated...</div>
                </div>
                <div className="p-2 bg-black/5 rounded">
                  <div className="font-semibold">Combat Actions</div>
                  <div className="text-sm">Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide...</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* NPC Edit Modal */}
      {editingNpc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ background: currentTheme.cardBackground }}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add NPC</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Name</label>
                    <Input 
                      value={npcName}
                      onChange={(e) => setNpcName(e.target.value)}
                      placeholder="NPC Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Type</label>
                    <Input 
                      value={npcType}
                      onChange={(e) => setNpcType(e.target.value)}
                      placeholder="Humanoid, Beast, etc."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1">HP</label>
                    <Input 
                      type="number"
                      value={npcHp}
                      onChange={(e) => setNpcHp(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">AC</label>
                    <Input 
                      type="number"
                      value={npcAc}
                      onChange={(e) => setNpcAc(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">CR</label>
                    <Input 
                      value={npcCr}
                      onChange={(e) => setNpcCr(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <textarea 
                    className="w-full p-2 border rounded"
                    value={npcDescription}
                    onChange={(e) => setNpcDescription(e.target.value)}
                    rows={3}
                    placeholder="Brief description of the NPC"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingNpc(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddNpc}>
                    Save NPC
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DMSessionPage;
