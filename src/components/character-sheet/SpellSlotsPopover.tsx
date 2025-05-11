
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export interface SpellSlotsPopoverProps {
  level: number;
  currentSlots: number;
  maxSlots: number;
  onSlotsChange: (newSlots: number) => void;
  disabled?: boolean;
}

export const SpellSlotsPopover: React.FC<SpellSlotsPopoverProps> = ({
  level,
  currentSlots,
  maxSlots,
  onSlotsChange,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentSlots);

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue[0]);
  };

  const handleCommit = () => {
    onSlotsChange(value);
    setOpen(false);
  };

  return (
    <Popover open={open && !disabled} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={disabled}
          className={disabled ? "opacity-50 cursor-not-allowed" : ""}
        >
          {currentSlots} / {maxSlots}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium text-center">
            Ячейки заклинаний {level} уровня
          </h4>
          
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="outline" className="text-lg h-8 w-8 flex items-center justify-center">
              {value}
            </Badge>
            <span className="mx-2">из</span>
            <Badge variant="outline" className="text-lg h-8 w-8 flex items-center justify-center">
              {maxSlots}
            </Badge>
          </div>
          
          <Slider
            defaultValue={[currentSlots]}
            max={maxSlots}
            min={0}
            step={1}
            value={[value]}
            onValueChange={handleValueChange}
            className="my-4"
          />
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button size="sm" onClick={handleCommit}>
              Применить
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
