import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dices, Calculator, List } from 'lucide-react';

export type AbilityRollMethod = "pointbuy" | "standard" | "roll" | "manual";

interface AbilityScoreMethodSelectorProps {
  selectedMethod: AbilityRollMethod;
  onChange: (method: AbilityRollMethod) => void;
}

const AbilityScoreMethodSelector: React.FC<AbilityScoreMethodSelectorProps> = ({
  selectedMethod,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Выберите метод распределения характеристик</h3>

      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onChange(value as AbilityRollMethod)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Стандартный набор */}
        <div className={`relative flex items-center space-x-2 rounded-md border p-4 shadow-sm transition-all 
          ${selectedMethod === 'standard' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
          <RadioGroupItem value="standard" id="standard" className="sr-only" />
          <Label htmlFor="standard" className="flex flex-col gap-1 cursor-pointer w-full">
            <div className="flex items-center justify-between">
              <span className="font-medium">Стандартный набор</span>
              <Badge variant="outline">Начинающим</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Предопределенный набор чисел: 15, 14, 13, 12, 10, 8
            </p>
            <div className="mt-2 flex gap-1 flex-wrap">
              {[15, 14, 13, 12, 10, 8].map((val) => (
                <Badge key={val} variant="secondary">{val}</Badge>
              ))}
            </div>
          </Label>
        </div>

        {/* Point Buy */}
        <div className={`relative flex items-center space-x-2 rounded-md border p-4 shadow-sm transition-all 
          ${selectedMethod === 'pointbuy' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
          <RadioGroupItem value="pointbuy" id="pointbuy" className="sr-only" />
          <Label htmlFor="pointbuy" className="flex flex-col gap-1 cursor-pointer w-full">
            <div className="flex items-center justify-between">
              <span className="font-medium">Point Buy</span>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Распределите очки между характеристиками</p>
            <div className="mt-2 flex items-center gap-1">
              <Badge variant="outline">27 очков</Badge>
              <span className="text-xs text-muted-foreground">(8-15 для каждой характеристики)</span>
            </div>
          </Label>
        </div>

        {/* Roll */}
        <div className={`relative flex items-center space-x-2 rounded-md border p-4 shadow-sm transition-all 
          ${selectedMethod === 'roll' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
          <RadioGroupItem value="roll" id="roll" className="sr-only" />
          <Label htmlFor="roll" className="flex flex-col gap-1 cursor-pointer w-full">
            <div className="flex items-center justify-between">
              <span className="font-medium">Броски кубиков</span>
              <Dices className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Классический метод 4d6, отбрасывая наименьшее
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Бросьте 4d6 шесть раз, каждый раз убирая наименьший результат
            </div>
          </Label>
        </div>

        {/* Manual */}
        <div className={`relative flex items-center space-x-2 rounded-md border p-4 shadow-sm transition-all 
          ${selectedMethod === 'manual' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
          <RadioGroupItem value="manual" id="manual" className="sr-only" />
          <Label htmlFor="manual" className="flex flex-col gap-1 cursor-pointer w-full">
            <div className="flex items-center justify-between">
              <span className="font-medium">Ручной ввод</span>
              <List className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Введите значения характеристик вручную</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Подходит для импорта персонажа или опытных игроков
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default AbilityScoreMethodSelector;
