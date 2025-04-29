
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CharacterContext, Character } from "@/contexts/CharacterContext";
import { useToast } from "@/components/ui/use-toast";

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
    }
    
    if (["Паладин", "Следопыт"].includes(character.class)) {
      spellSlots[1] = { max: 1, used: 0 };
    }
    
    // Convert spell names to Spell objects
    const spellsKnown = character.spells.map((s, idx) => ({ id: String(idx), name: s, level: 0 }));

    // Create the character object with the correct format for the Character interface
    const charObj: Character = {
      name: character.name,
      race: character.race + (character.subrace ? ` (${character.subrace})` : ""),
      className: character.class + (character.subclass ? ` (${character.subclass})` : ""),
      level: 1,
      abilities: abilities,
      spellsKnown: spellsKnown,
      spellSlots: spellSlots,
      gender: character.gender,
      alignment: character.alignment,
      background: character.background,
      equipment: character.equipment,
      languages: character.languages,
      proficiencies: character.proficiencies,
      // Get theme from localStorage to save with character
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
          {Object.entries(character.stats).map(([key, value]) => (
            <div key={key} className="text-center border rounded p-3 bg-muted/20">
              <div className="font-medium">{getStatName(key)}</div>
              <div className="text-2xl">{value}</div>
              <div className="text-sm">{getModifier(value)}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Заклинания</h2>
          <div className="border rounded p-3 bg-muted/20 h-full">
            {character.spells.length > 0 ? (
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

      <div className="flex flex-wrap gap-4">
        <button
          onClick={prevStep}
          className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded"
        >
          Назад
        </button>
        <button
          onClick={handleFinish}
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded"
        >
          Завершить и сохранить
        </button>
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
