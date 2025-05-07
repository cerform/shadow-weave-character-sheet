
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SubraceProps {
  name: string;
  description: string;
  traits?: string[];
  abilityScoreIncrease?: Record<string, number>;
  selected: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const SubraceCard: React.FC<SubraceProps> = ({
  name,
  description,
  traits,
  selected,
  onClick,
  children
}) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-md",
        selected
          ? "border-primary/70 bg-primary/5 shadow-sm"
          : "border-muted/30 hover:border-primary/30"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{description}</p>
        
        {traits && traits.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium">Особенности:</h4>
            <ul className="list-disc list-inside text-sm mt-1">
              {traits.map((trait, i) => (
                <li key={i}>{trait}</li>
              ))}
            </ul>
          </div>
        )}
        
        {children}
      </CardContent>
    </Card>
  );
};

export default SubraceCard;
