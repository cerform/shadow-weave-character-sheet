
// Character creation constants

// Ability score caps for different character levels
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,      // Standard maximum for abilities (levels 1-9)
  EPIC_CAP: 22,      // Epic tier maximum (levels 10-15)
  LEGENDARY_CAP: 24  // Legendary tier maximum (levels 16-20)
};

// Standard ability array
export const STANDARD_ABILITY_ARRAY = [15, 14, 13, 12, 10, 8];

// Point buy costs
export const POINT_BUY_COSTS: { [key: number]: number } = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9
};

// Base ability score points
export const BASE_ABILITY_POINTS = 27;
