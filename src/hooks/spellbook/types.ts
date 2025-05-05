
export interface SpellData {
  id?: string | number;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  description?: string;
  higherLevels?: string;
  higherLevel?: string; // Альтернативное имя в некоторых структурах данных
  classes?: string[] | string;
  prepared?: boolean; // Опциональное свойство
  concentration?: boolean;
  ritual?: boolean;
  duration?: string;
  [key: string]: any; // Индексная сигнатура для совместимости
}
