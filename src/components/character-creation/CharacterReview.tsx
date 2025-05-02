import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CharacterContext, Character } from "@/contexts/CharacterContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Check, Download, FileText } from "lucide-react";
import { CharacterSheet } from "@/types/character";
import { downloadCharacterPDF } from "@/utils/characterPdfGenerator";

type Props = {
  character: {
    race: string;
    subrace: string;
    class: string;
    subclass: string;
    spells: string[];
    equipment: string[];
    languages: string[];
    proficiencies: string[];
    name: string;
    gender: string;
    alignment: string;
    stats: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
    background: string;
  };
  prevStep: () => void;
};

export default function CharacterReview({ character, prevStep }: Props) {
  const navigate = useNavigate();
  const { setCharacter } = useContext(CharacterContext);
  const { toast } = useToast();

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleFinish = () => {
    if (!character.name) {
      toast({
        title: "Ошибка",
        description: "Персонаж должен иметь имя",
        variant: "destructive"
      });
      return;
    }

    // Convert character stats to the abilities format expected by the Character interface
    const abilities = {
      STR: character.stats.strength,
      DEX: character.stats.dexterity,
      CON: character.stats.constitution,
      INT: character.stats.intelligence,
      WIS: character.stats.wisdom,
      CHA: character.stats.charisma,
    };
    
    // Create spell slots based on class
    const spellSlots: Record<number, { max: number; used: number }> = {};
    
    if (["Волшебник", "Чародей", "Чернокнижник", "Бард", "Жрец", "Друид"].includes(character.class)) {
      spellSlots[1] = { max: 2, used: 0 };
      spellSlots[2] = { max: 0, used: 0 };
      spellSlots[3] = { max: 0, used: 0 };
    }
    
    if (["Паладин", "Следопыт"].includes(character.class)) {
      spellSlots[1] = { max: 1, used: 0 };
    }

    // Calculate HP based on class and Constitution
    const conModifier = Math.floor((character.stats.constitution - 10) / 2);
    let baseHp = 0;
    
    // Base HP by class
    switch(character.class) {
      case "Варвар": baseHp = 12; break;
      case "Воин": 
      case "Паладин":
      case "Следопыт": baseHp = 10; break;
      case "Жрец":
      case "Друид":
      case "Монах":
      case "Плут": baseHp = 8; break;
      case "Волшебник":
      case "Чародей": baseHp = 6; break;
      default: baseHp = 8;
    }
    
    const maxHp = baseHp + conModifier;
    
    // Create the character object with the correct format for the Character interface
    const charObj: Character = {
      name: character.name,
      race: character.race + (character.subrace ? ` (${character.subrace})` : ""),
      className: character.class + (character.subclass ? ` (${character.subclass})` : ""),
      level: 1,
      abilities: abilities,
      spells: character.spells || [],
      spellSlots: spellSlots,
      maxHp: maxHp,
      currentHp: maxHp,
      gender: character.gender,
      alignment: character.alignment,
      background: character.background,
      equipment: character.equipment,
      languages: character.languages,
      proficiencies: character.proficiencies,
      theme: localStorage.getItem('theme') || undefined
    };

    // Сохраняем персонажа в контексте
    setCharacter(charObj);
    
    // Показываем уведомление об успешном сохранении
    toast({
      title: "Персонаж сохранен",
      description: `${character.name} успешно создан!`
    });
    
    // Переходим к листу персонажа
    navigate("/sheet");
  };

  const handleDownloadPdf = () => {
    if (!character.name) {
      toast({
        title: "Ошибка",
        description: "Персонаж должен иметь имя",
        variant: "destructive"
      });
      return;
    }
    
    // Преобразуем character в формат CharacterSheet для PDF
    const charForPdf: CharacterSheet = {
      name: character.name,
      race: character.race,
      class: character.class,
      subclass: character.subclass,
      level: 1,
      background: character.background,
      alignment: character.alignment,
      abilities: {
        strength: character.stats.strength,
        dexterity: character.stats.dexterity,
        constitution: character.stats.constitution,
        intelligence: character.stats.intelligence,
        wisdom: character.stats.wisdom,
        charisma: character.stats.charisma
      },
      skills: [],
      languages: character.languages || [],
      equipment: character.equipment || [],
      spells: character.spells || [],
      proficiencies: character.proficiencies || [],
      features: [],
      personalityTraits: '',
      ideals: '',
      bonds: '',
      flaws: '',
      appearance: '',
      backstory: character.background || ''
    };
    
    // Скачиваем PDF
    downloadCharacterPDF(charForPdf);
    
    toast({
      title: "PDF создан",
      description: "Лист персонажа успешно скачан!"
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Проверка персонажа</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Основная информация</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg">
          <div><span className="font-medium">Имя:</span> {character.name || "—"}</div>
          <div><span className="font-medium">Пол:</span> {character.gender || "—"}</div>
          <div><span className="font-medium">Раса:</span> {character.race} {character.subrace ? `(${character.subrace})` : ""}</div>
          <div><span className="font-medium">Класс:</span> {character.class} {character.subclass ? `(${character.subclass})` : ""}</div>
          <div><span className="font-medium">Мировоззрение:</span> {character.alignment || "—"}</div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Характеристики</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(character.stats).map(([key, value]) => {
            const modifier = getModifier(value);
            const isPositiveModifier = !modifier.includes('-');
            
            return (
              <div key={key} className="text-center border rounded p-3 bg-muted/20">
                <div className="font-medium">{getStatName(key)}</div>
                <div className="text-2xl">{value}</div>
                <div className={`text-sm ${isPositiveModifier ? "text-green-500" : "text-red-500"}`}>
                  {modifier}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Заклинания</h2>
          <div className="border rounded p-3 bg-muted/20 h-full">
            {character.spells?.length > 0 ? (
              <ul className="list-disc ml-5">
                {character.spells.map((spell, idx) => (
                  <li key={idx}>{spell}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-muted-foreground">Нет известных заклинаний</p>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Снаряжение</h2>
          <div className="border rounded p-3 bg-muted/20 h-full">
            {character.equipment?.length > 0 ? (
              <ul className="list-disc ml-5">
                {character.equipment.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-muted-foreground">Нет снаряжения</p>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Языки</h2>
          <div className="border rounded p-3 bg-muted/20">
            {character.languages?.length > 0 ? (
              <ul className="list-disc ml-5">
                {character.languages.map((lang, idx) => (
                  <li key={idx}>{lang}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-muted-foreground">Общий</p>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Навыки</h2>
          <div className="border rounded p-3 bg-muted/20">
            {character.proficiencies?.length > 0 ? (
              <ul className="list-disc ml-5">
                {character.proficiencies.map((prof, idx) => (
                  <li key={idx}>{prof}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-muted-foreground">Нет профессиональных навыков</p>
            )}
          </div>
        </section>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Предыстория</h2>
        <div className="border rounded p-4 bg-muted/20">
          <p>{character.background || "—"}</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          onClick={prevStep}
          variant="outline"
          className="flex items-center gap-2"
        >
          Назад
        </Button>
        <Button
          onClick={handleDownloadPdf}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Скачать PDF
        </Button>
        <Button
          onClick={handleFinish}
          variant="default"
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          Завершить и сохранить
        </Button>
      </div>
    </div>
  );
}

// Вспомогательные функции
function getStatName(stat: string): string {
  const names: {[key: string]: string} = {
    'strength': 'Сила',
    'dexterity': 'Ловкость',
    'constitution': 'Телосложение',
    'intelligence': 'Интеллект',
    'wisdom': 'Мудрость',
    'charisma': 'Харизма'
  };
  return names[stat] || stat;
}
