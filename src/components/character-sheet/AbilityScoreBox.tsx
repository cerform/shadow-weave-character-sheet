
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AbilityScoreBoxProps {
  name: string;
  fullName: string;
  value: number;
  modifier: number;
  onChange: (value: number) => void;
}

const AbilityScoreBox: React.FC<AbilityScoreBoxProps> = ({
  name,
  fullName,
  value,
  modifier,
  onChange,
}) => {
  return (
    <Card className="relative group overflow-visible">
      <CardContent className="p-2 text-center">
        <div className="mb-1 font-semibold">{name}</div>
        <div className="text-sm text-muted-foreground mb-2">{fullName}</div>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="text-center font-bold w-full mb-2"
          min={1}
          max={30}
        />
        <div className="text-xl font-bold">
          {modifier >= 0 ? `+${modifier}` : modifier}
        </div>
      </CardContent>
    </Card>
  );
};

export default AbilityScoreBox;
