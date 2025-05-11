
import { SpellData } from "@/types/spells";
import { CharacterSpell } from "@/types/character";
import { parseComponents } from "@/utils/spellProcessors";
import { generateSpellId } from "@/utils/spellHelpers";

// Function to fix character sheet spell data
export const fixSpellDataImport = (data: any[]): CharacterSpell[] => {
  if (!data || !Array.isArray(data)) return [];

  return data.map(spell => {
    // Convert to the proper format
    return {
      id: spell.id || generateSpellId(spell),
      name: spell.name || "Unnamed Spell",
      level: typeof spell.level === 'number' ? spell.level : 0,
      school: spell.school || "Universal",
      castingTime: spell.castingTime || spell.casting_time || "1 action",
      range: spell.range || "Self",
      components: spell.components || "",
      duration: spell.duration || "Instantaneous",
      description: spell.description || "",
      prepared: !!spell.prepared,
      verbal: !!spell.verbal,
      somatic: !!spell.somatic,
      material: !!spell.material,
      ritual: !!spell.ritual,
      concentration: !!spell.concentration,
      classes: spell.classes || [],
      source: spell.source || "PHB"
    };
  });
};

// Function to normalize spell data from various sources
export const normalizeSpellData = (spell: any): SpellData => {
  // Extract components
  let verbal = false,
      somatic = false,
      material = false,
      ritual = false,
      concentration = false;

  // Check for component flags
  if (typeof spell.verbal === 'boolean') verbal = spell.verbal;
  if (typeof spell.somatic === 'boolean') somatic = spell.somatic;
  if (typeof spell.material === 'boolean') material = spell.material;
  if (typeof spell.ritual === 'boolean') ritual = spell.ritual;
  if (typeof spell.concentration === 'boolean') concentration = spell.concentration;

  // Parse components string if available
  if (typeof spell.components === 'string' && spell.components) {
    const parsed = parseComponents(spell.components);
    verbal = parsed.verbal || verbal;
    somatic = parsed.somatic || somatic;
    material = parsed.material || material;
    ritual = parsed.ritual || ritual;
    concentration = parsed.concentration || concentration;
  }

  // Parse classes
  let classes: string[] = [];
  if (Array.isArray(spell.classes)) {
    classes = spell.classes;
  } else if (typeof spell.classes === 'string') {
    classes = spell.classes.split(',').map(c => c.trim());
  }

  // Create normalized spell data
  const normalizedSpell: SpellData = {
    id: spell.id || generateSpellId(spell),
    name: spell.name,
    level: typeof spell.level === 'number' ? spell.level : 0,
    school: spell.school || "Universal",
    castingTime: spell.castingTime || spell.casting_time || "1 action",
    range: spell.range || "Self",
    components: spell.components || "",
    duration: spell.duration || "Instantaneous",
    description: spell.description || "",
    classes,
    verbal,
    somatic,
    material,
    ritual,
    concentration,
    prepared: !!spell.prepared
  };

  return normalizedSpell;
};

// Function to convert DnD Beyond spell data to our format
export const convertDndBeyondSpell = (spell: any): CharacterSpell => {
  // Create a spell ID
  const spellId = generateSpellId(spell);
  
  // Convert class list
  let classes: string[] = [];
  if (spell.classes && Array.isArray(spell.classes.fromClassList)) {
    classes = spell.classes.fromClassList.map((c: any) => c.name);
  }

  return {
    id: spellId,
    name: spell.name,
    level: spell.level,
    school: spell.school || "",
    castingTime: spell.castingTime || "",
    range: spell.range || "",
    components: spell.components || "",
    duration: spell.duration || "",
    description: spell.description || "",
    classes,
    verbal: spell.componentsVerbal || false,
    somatic: spell.componentsSomatic || false,
    material: spell.componentsMaterial || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false
  };
};
