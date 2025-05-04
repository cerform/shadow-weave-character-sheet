
import React, { useState } from "react";
import NavigationButtons from "./NavigationButtons";
import { 
  SelectionCard, 
  SelectionCardGrid 
} from "@/components/ui/selection-card";
import SectionHeader from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { backgrounds } from "@/assets";

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
  // Дополнительные предыстории из Книги Игрока
  { 
    id: "charlatan", 
    name: "Шарлатан", 
    description: "Вы всегда умели влиять на других людей своим остроумием, очарованием, или иногда хитростью. Вы знаете, как найти слабое место в характере человека и воспользоваться им." 
  },
  { 
    id: "entertainer", 
    name: "Артист", 
    description: "Вы плясали для знати, пели народные песни в тавернах, или выступали в составе странствующего цирка. Ваше искусство вызывало улыбки и завоевывало сердца." 
  },
  { 
    id: "guild_artisan", 
    name: "Гильдейский ремесленник", 
    description: "Вы являетесь членом гильдии ремесленников, опытны в конкретном ремесле и тесно связаны с другими ремесленниками. Вы зарабатываете на жизнь своим ремеслом и принадлежите к гильдии, которая защищает вас." 
  },
  { 
    id: "hermit", 
    name: "Отшельник", 
    description: "Вы жили в уединении, добровольно или вынужденно, в течение периода вашей жизни. В течение этого времени, вы искали духовную истину, прятались от преследователей или просто избегали общества." 
  },
  { 
    id: "outlander", 
    name: "Чужеземец", 
    description: "Вы выросли в глуши, вдали от цивилизации и её удобств. Вы пережили опасности кочевой жизни, жестокую погоду и атаки страшных зверей и монстров." 
  },
  { 
    id: "sailor", 
    name: "Моряк", 
    description: "Вы провели годы в море. За это время вы столкнулись со штормами, глубинными монстрами и теми, кто хочет потопить ваш корабль. Ваш первый дом - корабль, и вы тоскуете по морю, когда находитесь вдали от него." 
  },
  { 
    id: "urchin", 
    name: "Беспризорник", 
    description: "Вы выросли на улицах, предоставленные самим себе. Вы были бедны, возможно, сиротой, и общество отказалось от вас. У вас не было никого кроме себя, выживание потребовало работы, смелости и удачи."
  }
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

      <SelectionCardGrid className="mb-6" cols={3}>
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
