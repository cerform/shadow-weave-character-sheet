
export interface SpellData {
  id: string;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description: string[] | string;
  classes?: string[] | string;
  ritual?: boolean;
  concentration?: boolean;
  prepared?: boolean;
}
