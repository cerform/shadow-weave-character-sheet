
export interface LevelFeature {
  name: string;
  description: string;
  level: number;
  className: string;
  subclassName?: string;
  isMagic?: boolean;
  isActive?: boolean;
  usesTotal?: number;
  usesCurrent?: number;
  sourceBook?: string;
  sourcePage?: number;
}

export interface ClassLevelFeatures {
  [className: string]: {
    [level: number]: LevelFeature[];
  };
}
