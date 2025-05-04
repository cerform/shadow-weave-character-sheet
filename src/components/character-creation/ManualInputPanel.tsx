
import React from 'react';
import { ABILITY_SCORE_CAPS } from '@/types/character';

// Update the getMaxAbilityScore function:
export const getMaxAbilityScore = (level?: number, maxAbilityScoreOverride?: number): number => {
  if (maxAbilityScoreOverride) return maxAbilityScoreOverride;
  
  if (level && level >= 16) return ABILITY_SCORE_CAPS.LEGENDARY_CAP;
  if (level && level >= 10) return ABILITY_SCORE_CAPS.EPIC_CAP; 
  return ABILITY_SCORE_CAPS.BASE_CAP;
};
