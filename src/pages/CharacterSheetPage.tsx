
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import OBSLayout from "@/components/OBSLayout";
import { CharacterContext } from "@/contexts/CharacterContext";
import { useTheme } from "@/contexts/ThemeContext";

const CharacterSheetPage = () => {
  const { character } = useContext(CharacterContext);
  const { theme } = useTheme();
  const navigate = useNavigate();

  if (!character) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-background text-foreground ${theme}`}>
        <h1 className="text-2xl font-bold mb-4">Нет сохранённого персонажа.</h1>
        <Button onClick={() => navigate("/create")}>Создать персонажа</Button>
      </div>
    );
  }

  // Метки для характеристик
  const abilityLabels: Record<keyof typeof character.abilities, string> = {
    STR: "Сила",
    DEX: "Ловкость",
    CON: "Телосложение",
    INT: "Интеллект",
    WIS: "Мудрость",
    CHA: "Харизма",
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className={theme}>
      <div className="p-4 bg-background">
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          На главную
        </Button>
      </div>

      <OBSLayout>
        {/* Левый сайдбар: базовая информация */}
        <div className="obs-left p-4 bg-background text-foreground overflow-y-auto">
          <h1 className="text-3xl font-bold mb-2">{character.name}</h1>
          <p className="mb-1"><strong>Раса:</strong> {character.race}</p>
          <p className="mb-1"><strong>Класс и уровень:</strong> {character.className} {character.level}</p>
          {character.gender && <p className="mb-1"><strong>Пол:</strong> {character.gender}</p>}
          {character.alignment && <p className="mb-1"><strong>Мировоззрение:</strong> {character.alignment}</p>}
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Снаряжение</h3>
            {character.equipment && character.equipment.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1">
                {character.equipment.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-muted-foreground">Нет снаряжения</p>
            )}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Языки</h3>
            {character.languages && character.languages.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1">
                {character.languages.map((lang: string, idx: number) => (
                  <li key={idx}>{lang}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-muted-foreground">Общий</p>
            )}
          </div>
        </div>

        {/* Центр: характеристики и предыстория */}
        <div className="obs-center p-4 bg-background text-foreground overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4">Характеристики</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(character.abilities).map(([key, value]) => (
              <div key={key} className="border border-border rounded p-3 bg-muted/20 text-center">
                <div className="text-lg font-semibold">
                  {abilityLabels[key as keyof typeof abilityLabels]}
                </div>
                <div className="text-2xl mt-1">
                  {value} <span className="opacity-75">({getModifier(value)})</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Навыки</h2>
            {character.proficiencies && character.proficiencies.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {character.proficiencies.map((prof: string, idx: number) => (
                  <div key={idx} className="p-2 bg-muted/20 rounded-md">
                    {prof}
                  </div>
                ))}
              </div>
            ) : (
              <p className="italic text-muted-foreground">Нет профессиональных навыков</p>
            )}
          </div>

          {character.background && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-2">Предыстория</h2>
              <div className="p-4 bg-muted/20 rounded-lg">
                <p>{character.background}</p>
              </div>
            </div>
          )}
        </div>

        {/* Правый сайдбар: заклинания и слоты */}
        <div className="obs-right p-4 bg-background text-foreground overflow-y-auto">
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Ячейки заклинаний</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(character.spellSlots).length > 0 ? (
                Object.entries(character.spellSlots).map(([lvl, slot]) => (
                  <div key={lvl} className="border border-border rounded p-2 w-28 bg-muted/20">
                    <div className="font-medium">Уровень {lvl}</div>
                    <div className="text-sm opacity-75">{slot.used} / {slot.max}</div>
                  </div>
                ))
              ) : (
                <p className="italic text-muted-foreground">Нет ячеек заклинаний</p>
              )}
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-2">Известные заклинания</h2>
            {character.spellsKnown && character.spellsKnown.length ? (
              <ul className="list-disc ml-5 space-y-1">
                {character.spellsKnown.map((sp) => (
                  <li key={sp.id}>
                    {sp.name} {sp.level > 0 && <span className="opacity-75">(ур. {sp.level})</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic opacity-75">Нет известных заклинаний.</p>
            )}
          </section>
        </div>
      </OBSLayout>
    </div>
  );
};

export default CharacterSheetPage;
