
import React from 'react';
import { ABILITY_SCORE_CAPS } from '@/types/character';

// Update the getMaxAbilityScore function:
export const getMaxAbilityScore = (level?: number, maxAbilityScoreOverride?: number): number => {
  if (maxAbilityScoreOverride) return maxAbilityScoreOverride;
  
  if (level && level >= 16) return ABILITY_SCORE_CAPS.ABSOLUTE_MAX;
  if (level && level >= 10) return 22; // Middle value between MAX and ABSOLUTE_MAX
  return ABILITY_SCORE_CAPS.MAX;
};
