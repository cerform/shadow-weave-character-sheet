
export interface Trait {
  name: string;
  description: string;
}

export interface Subrace {
  name: string;
  description: string;
  traits: Trait[];
}

export interface Race {
  name: string;
  description: string;
  traits: Trait[];
  subraces: Subrace[];
}
