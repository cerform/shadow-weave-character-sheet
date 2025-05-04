
import React, { useState, useEffect } from "react";
import { CharacterSheet } from "@/types/character.d";
import NavigationButtons from "./NavigationButtons";
import SectionHeader from "@/components/ui/section-header";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import HitPointsRoller from "./HitPointsRoller";

interface CharacterHitPointsCalculatorProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterHitPointsCalculator: React.FC<CharacterHitPointsCalculatorProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [isReady, setIsReady] = useState<boolean>(false);

  // Вычисляем модификатор Телосложения
  const getConModifier = (): number => {
    if (!character.abilities) return 0;
    return Math.floor((character.abilities.constitution - 10) / 2);
  };

  // Обработчик завершения броска HP
  const handleHitPointsRolled = (hp: number) => {
    updateCharacter({ maxHp: hp, currentHp: hp });
    setIsReady(true);
  };

  // Если HP уже рассчитаны, считаем шаг готовым
  useEffect(() => {
    if (character.maxHp && character.maxHp > 0) {
      setIsReady(true);
    }
  }, [character.maxHp]);

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Очки здоровья" 
        description="Рассчитайте количество очков здоровья вашего персонажа на основе класса, уровня и модификатора телосложения."
      />

      {!character.class ? (
        <Alert variant="destructive">
          <AlertTitle>Не выбран класс</AlertTitle>
          <AlertDescription>
            Необходимо выбрать класс персонажа перед расчетом очков здоровья.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <HitPointsRoller
            characterClass={character.class}
            level={character.level || 1}
            constitutionModifier={getConModifier()}
            onHitPointsRolled={handleHitPointsRolled}
            initialHp={character.maxHp}
          />
          
          <Alert className="bg-black/60 border-primary/20">
            <AlertDescription>
              Модификатор телосложения ({getConModifier() >= 0 ? `+${getConModifier()}` : getConModifier()}) влияет на количество здоровья, 
              получаемое при каждом повышении уровня. Минимальный прирост - 1 HP за уровень.
            </AlertDescription>
          </Alert>
        </>
      )}

      <NavigationButtons
        allowNext={isReady}
        nextStep={nextStep}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterHitPointsCalculator;
