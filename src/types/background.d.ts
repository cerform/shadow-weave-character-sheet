
export interface BackgroundIdeal {
  text: string;
  alignment?: string;
}

export interface BackgroundProficiencies {
  skills?: string[];
  tools?: string[] | string;
  languages?: string[] | string;
  weapons?: string[] | string;
}

export interface Background {
  name: string;
  description: string;
  source?: string;
  proficiencies: BackgroundProficiencies;
  feature?: { name: string; description: string };
  personalityTraits?: string[];
  ideals?: BackgroundIdeal[];
  bonds?: string[];
  flaws?: string[];
  suggestedCharacteristics?: string;
  equipment?: string[] | string;
}
