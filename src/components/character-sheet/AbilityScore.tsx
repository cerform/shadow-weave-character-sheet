
import React from 'react';

interface AbilityScoreProps {
  name: string;
  score: number;
  modifier: number;
  abbr: string;
  onUpdate?: (value: number) => void;
}

const AbilityScore: React.FC<AbilityScoreProps> = ({ name, score, modifier, abbr, onUpdate }) => {
  return (
    <div className="ability-score flex flex-col items-center p-2 border rounded-md">
      <div className="text-sm text-muted-foreground">{name}</div>
      <div className="text-xl font-bold">{abbr}</div>
      <div className="text-2xl font-bold">{score}</div>
      <div className="text-lg">
        {modifier >= 0 ? `+${modifier}` : modifier}
      </div>
      {onUpdate && (
        <div className="flex mt-1 space-x-1">
          <button 
            className="w-6 h-6 text-xs flex items-center justify-center rounded bg-primary text-primary-foreground"
            onClick={() => onUpdate(score - 1)}
          >
            -
          </button>
          <button 
            className="w-6 h-6 text-xs flex items-center justify-center rounded bg-primary text-primary-foreground"
            onClick={() => onUpdate(score + 1)}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default AbilityScore;
