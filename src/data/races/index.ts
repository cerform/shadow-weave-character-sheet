
import { human } from './human';
import { elf } from './elf';
import { dwarf } from './dwarf';
import { halfling } from './halfling';
import { dragonborn } from './dragonborn';
import { gnome } from './gnome';
import { halfElf } from './half-elf';
import { halfOrc } from './half-orc';
import { tiefling } from './tiefling';
import type { Race } from '../types/races';

export const races: Race[] = [
  human,
  elf,
  dwarf,
  halfling,
  dragonborn,
  gnome,
  halfElf,
  halfOrc,
  tiefling
];

export type { Race, Trait, Subrace } from '../types/races';
