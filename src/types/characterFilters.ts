
export interface CharacterFilter {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  type: 'class' | 'attribute' | 'equipment' | 'campaign';
}

export interface ClassFilter extends CharacterFilter {
  type: 'class';
  classes: string[];
  subclasses: string[];
  levelRange: [number, number];
  isMulticlass?: boolean;
}

export interface AttributeFilter extends CharacterFilter {
  type: 'attribute';
  statRanges: {
    strength?: [number, number];
    dexterity?: [number, number];
    constitution?: [number, number];
    intelligence?: [number, number];
    wisdom?: [number, number];
    charisma?: [number, number];
  };
  skillProficiencies: string[];
  savingThrowProficiencies: string[];
  acRange?: [number, number];
}

export interface EquipmentFilter extends CharacterFilter {
  type: 'equipment';
  weaponTypes: ('melee' | 'ranged' | 'magical')[];
  armorTypes: string[];
  hasMagicItems: boolean;
  inventoryValueRange?: [number, number];
}

export interface CampaignFilter extends CharacterFilter {
  type: 'campaign';
  campaignNames: string[];
  playerNames: string[];
  lastModifiedRange?: [Date, Date];
  status: ('active' | 'retired' | 'deceased')[];
}

export interface FilterSet {
  id: string;
  name: string;
  description?: string;
  filters: CharacterFilter[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchOptions {
  query: string;
  fuzzyMatch: boolean;
  searchFields: ('name' | 'background' | 'notes' | 'description')[];
  tags: string[];
}
