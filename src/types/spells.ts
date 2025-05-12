
export interface SpellData {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes: string[] | string;
  ritual: boolean;
  concentration: boolean;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materials?: string;
  source: string;
  higherLevel?: string;
  higherLevels?: string;
  higher_level?: string;
  prepared?: boolean;
}

export interface SpellFilters {
  name: string;
  schools: string[];
  levels: number[];
  classes: string[];
  ritual: boolean | null;
  concentration: boolean | null;
}

// Функция для преобразования данных заклинаний в формат CharacterSpell
export function convertSpellDataToCharacterSpell(spell: SpellData): any {
  return {
    id: spell.id.toString(),
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materials: spell.materials,
    prepared: spell.prepared || false,
    source: spell.source
  };
}

// Для обратной совместимости
export function convertCharacterSpellToSpellData(spell: any): SpellData {
  if (typeof spell === 'string') {
    return {
      id: `spell-${Math.random().toString(36).substring(2, 11)}`,
      name: spell,
      level: 0,
      school: "Unknown",
      castingTime: "1 action",
      range: "Self",
      components: "",
      duration: "Instantaneous",
      description: "",
      classes: [],
      ritual: false,
      concentration: false,
      verbal: false,
      somatic: false,
      material: false,
      source: "Custom"
    };
  }

  return {
    id: spell.id || `spell-${Math.random().toString(36).substring(2, 11)}`,
    name: spell.name || "Unknown",
    level: spell.level !== undefined ? spell.level : 0,
    school: spell.school || "Unknown",
    castingTime: spell.castingTime || "1 action",
    range: spell.range || "Self",
    components: spell.components || "",
    duration: spell.duration || "Instantaneous",
    description: spell.description || "",
    classes: spell.classes || [],
    ritual: !!spell.ritual,
    concentration: !!spell.concentration,
    verbal: !!spell.verbal,
    somatic: !!spell.somatic,
    material: !!spell.material,
    materials: spell.materials || "",
    source: spell.source || "Custom",
    prepared: !!spell.prepared
  };
}
