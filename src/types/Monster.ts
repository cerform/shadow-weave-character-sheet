export type Size = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';

export interface BestiaryEntry {
  id: string;
  slug: string;
  name: string;
  creature_type: string;
  size: Size;
  ac: number;
  hp_average: number;
  hp_formula?: string;
  speed_walk?: number;
  speed_fly?: number;
  speed_swim?: number;
  speed_burrow?: number;
  speed_climb?: number;
  cr_or_level: string;
  str_score?: number;
  dex_score?: number;
  con_score?: number;
  int_score?: number;
  wis_score?: number;
  cha_score?: number;
  traits?: string[];
  actions?: string[];
  legendary_actions?: string[];
  reactions?: string[];
  languages?: string;
  senses?: string;
  damage_immunities?: string[];
  damage_resistances?: string[];
  damage_vulnerabilities?: string[];
  condition_immunities?: string[];
  skills?: Record<string, number>;
  saving_throws?: Record<string, number>;
}

export interface ModelRegistryEntry {
  id: string;
  slug: string;
  model_url: string;
  scale?: number;
  y_offset?: number;
  animations?: Record<string, string>;
  preview_url?: string;
  author?: string;
  license?: string;
}

export interface BattleEntity {
  id?: string;
  session_id: string;
  slug: string;
  name: string;
  model_url: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  rot_y: number;
  scale: number;
  hp_current: number;
  hp_max: number;
  ac: number;
  speed: number;
  size: Size;
  level_or_cr: string;
  creature_type: string;
  statuses?: string[];
  is_player_character?: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

import * as THREE from 'three';

export interface LoadedModel {
  root: THREE.Group;
  mixer?: THREE.AnimationMixer;
  actions?: Record<string, THREE.AnimationAction>;
}