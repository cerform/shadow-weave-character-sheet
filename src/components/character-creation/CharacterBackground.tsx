
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CharacterBackgroundProps {
  character: any;
  onUpdateCharacter: (updates: any) => void;
}

export const CharacterBackground = ({ character, onUpdateCharacter }: CharacterBackgroundProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Предыстория и личность</h2>
      <p className="mb-6 text-muted-foreground">
        Опишите предысторию, внешность и личность вашего персонажа, 
        чтобы дать ему глубину и индивидуальность.
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="backstory">Предыстория</Label>
          <Textarea 
            id="backstory"
            placeholder="Опишите историю вашего персонажа..."
            className="min-h-[100px]"
            value={character.backstory}
            onChange={(e) => onUpdateCharacter({ backstory: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="appearance">Внешность</Label>
          <Textarea 
            id="appearance"
            placeholder="Опишите внешность вашего персонажа..."
            className="min-h-[100px]"
            value={character.appearance}
            onChange={(e) => onUpdateCharacter({ appearance: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="personality-traits">Личностные черты</Label>
            <Textarea 
              id="personality-traits"
              placeholder="Какие качества отличают вашего персонажа?"
              className="min-h-[80px]"
              value={character.personalityTraits}
              onChange={(e) => onUpdateCharacter({ personalityTraits: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ideals">Идеалы</Label>
            <Textarea 
              id="ideals"
              placeholder="Во что верит ваш персонаж?"
              className="min-h-[80px]"
              value={character.ideals}
              onChange={(e) => onUpdateCharacter({ ideals: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bonds">Узы</Label>
            <Textarea 
              id="bonds"
              placeholder="С чем или кем связан ваш персонаж?"
              className="min-h-[80px]"
              value={character.bonds}
              onChange={(e) => onUpdateCharacter({ bonds: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="flaws">Слабости</Label>
            <Textarea 
              id="flaws"
              placeholder="Какие недостатки есть у вашего персонажа?"
              className="min-h-[80px]"
              value={character.flaws}
              onChange={(e) => onUpdateCharacter({ flaws: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
