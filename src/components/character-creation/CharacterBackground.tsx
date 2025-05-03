
import React, { useState } from "react";
import NavigationButtons from "./NavigationButtons";
import { 
  SelectionCard, 
  SelectionCardGrid 
} from "@/components/ui/selection-card";
import SectionHeader from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  character: {
    background: string;
  };
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
};

const backgroundOptions = [
  { 
    id: "acolyte", 
    name: "Служитель культа", 
    description: "Вы провели свою жизнь, служа в храме, посвящённом тому или иному богу. Вы носили кадило на религиозных церемониях, и приносили жертвы, прося о благословении и чудесах." 
  },
  { 
    id: "criminal", 
    name: "Преступник", 
    description: "Вы - опытный преступник, имеющий историю преступлений за своими плечами. Вы всегда были близки к насилию, и не понаслышке знаете, что значит убийство." 
  },
  { 
    id: "folk_hero", 
    name: "Народный герой", 
    description: "Вы поднялись из народа благодаря какому-то происшествию. Народ верит в то, что у вас великое будущее." 
  },
  { 
    id: "noble", 
    name: "Благородный", 
    description: "Вы знаете, что значит богатство, власть и привилегии. Вы имеете титул, земли, собираете налоги, и обладаете значительным политическим влиянием." 
  },
  { 
    id: "sage", 
    name: "Мудрец", 
    description: "Вы провели годы, изучая мультивселенную. Вы выучили скрипты и языки, проводили дни в книжной пыли, и пропустили через свои руки сотни свитков." 
  },
  { 
    id: "soldier", 
    name: "Солдат", 
    description: "Война была вашей жизнью с юности. Вы проходили тренировки, изучали оружие, и доспехи, узнавали техники выживания, включая то, как оставаться живым на поле боя." 
  },
];

export default function CharacterBackground({ character, updateCharacter, nextStep, prevStep }: Props) {
  const [customBackground, setCustomBackground] = useState(character.background || "");
  const [selectedBackgroundId, setSelectedBackgroundId] = useState("");

  const handleBackgroundSelect = (id: string) => {
    setSelectedBackgroundId(id);
    const selectedBackground = backgroundOptions.find(b => b.id === id);
    if (selectedBackground) {
      setCustomBackground(selectedBackground.description);
      updateCharacter({ background: selectedBackground.description });
    }
  };

  const handleCustomBackgroundChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomBackground(e.target.value);
    updateCharacter({ background: e.target.value });
  };

  return (
    <div>
      <SectionHeader
        title="Предыстория персонажа"
        description="Выберите готовую предысторию или создайте свою собственную."
      />

      <SelectionCardGrid className="mb-6">
        {backgroundOptions.map((bg) => (
          <SelectionCard
            key={bg.id}
            title={bg.name}
            description={bg.description}
            selected={selectedBackgroundId === bg.id}
            onClick={() => handleBackgroundSelect(bg.id)}
          />
        ))}
      </SelectionCardGrid>

      <Card className="mb-6">
        <CardContent className="p-6">
          <label className="block text-lg font-medium mb-2">
            Опишите предысторию вашего персонажа
          </label>
          <Textarea
            value={customBackground}
            onChange={handleCustomBackgroundChange}
            className="w-full h-40 bg-background/70 border border-primary/30 rounded-md p-3 text-foreground"
            placeholder="Расскажите историю вашего персонажа, его происхождение, мотивы и цели..."
          />
        </CardContent>
      </Card>

      <NavigationButtons 
        allowNext={true} 
        nextStep={nextStep} 
        prevStep={prevStep} 
      />
    </div>
  );
}
