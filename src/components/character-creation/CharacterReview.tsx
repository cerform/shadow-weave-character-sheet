import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CharacterContext, Character } from "@/contexts/CharacterContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Download, FileText, ArrowDown, ArrowLeft } from "lucide-react";
import { CharacterSheet } from "@/types/character";
import { downloadCharacterPDF, downloadCharacterHTMLPDF } from "@/utils/characterPdfGenerator";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/contexts/AuthContext";

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
    level: number; // Добавляем уровень в пропсы
    background: string;
  };
  prevStep: () => void;
};

export default function CharacterReview({ character, prevStep }: Props) {
  const navigate = useNavigate();
  const { saveCharacter, setCharacter } = useContext(CharacterContext);
  const { currentUser, addCharacterToUser, isAuthenticated } = useAuth();

  const getModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleFinish = async () => {
    if (!character.name) {
      toast.error("Ошибка: Персонаж должен иметь имя");
      return;
    }

    // Проверка аутентификации
    if (!isAuthenticated) {
      const confirmAnonymous = window.confirm(
        "Вы не вошли в систему. Ваш персонаж будет сохранен только локально. Хотите войти или зарегистрироваться перед сохранением персонажа?"
      );
      
      if (confirmAnonymous) {
        // Сохраняем персонажа временно в sessionStorage
        const tmpCharData = JSON.stringify(character);
        sessionStorage.setItem('tmp_character_data', tmpCharData);
        navigate('/auth?redirectTo=/character-creation');
        return;
      }
    }

    // Используем уровень из character, или по умолчанию 1
    const level = character.level || 1;

    // Convert character stats to the abilities format expected by the Character interface
    const abilities = {
      STR: character.stats.strength,
      DEX: character.stats.dexterity,
      CON: character.stats.constitution,
      INT: character.stats.intelligence,
      WIS: character.stats.wisdom,
      CHA: character.stats.charisma,
    };
    
    // Create spell slots based on class and level
    const spellSlots: Record<number, { max: number; used: number }> = {};
    
    if (["Волшебник", "Чародей", "Чернокнижник", "Бард", "Жрец", "Друид"].includes(character.class)) {
      // Создаем слоты заклинаний в зависимости от уровня
      if (level >= 1) spellSlots[1] = { max: level >= 3 ? 4 : (level === 2 ? 3 : 2), used: 0 };
      if (level >= 3) spellSlots[2] = { max: level >= 4 ? 3 : 2, used: 0 };
      if (level >= 5) spellSlots[3] = { max: level >= 6 ? 3 : 2, used: 0 };
      if (level >= 7) spellSlots[4] = { max: level >= 9 ? 3 : (level === 8 ? 2 : 1), used: 0 };
      if (level >= 9) spellSlots[5] = { max: level >= 18 ? 3 : (level >= 10 ? 2 : 1), used: 0 };
      if (level >= 11) spellSlots[6] = { max: level >= 19 ? 2 : 1, used: 0 };
      if (level >= 13) spellSlots[7] = { max: level >= 20 ? 2 : 1, used: 0 };
      if (level >= 15) spellSlots[8] = { max: 1, used: 0 };
      if (level >= 17) spellSlots[9] = { max: 1, used: 0 };
    }
    
    if (["Паладин", "Следопыт"].includes(character.class)) {
      // Полузаклинатели начинают с 2-го уровня
      if (level >= 2) spellSlots[1] = { max: level >= 3 ? 3 : 2, used: 0 };
      if (level >= 5) spellSlots[2] = { max: level >= 7 ? 3 : 2, used: 0 };
      if (level >= 9) spellSlots[3] = { max: level >= 11 ? 3 : 2, used: 0 };
      if (level >= 13) spellSlots[4] = { max: level >= 15 ? 3 : 2, used: 0 };
      if (level >= 17) spellSlots[5] = { max: level >= 19 ? 3 : 2, used: 0 };
    }

    // Calculate HP based on class, Constitution and level
    const conModifier = Math.floor((character.stats.constitution - 10) / 2);
    let baseHp = 0;
    
    // Base HP by class (первый уровень - максимальный хит-дайс + модификатор ТЕЛ)
    switch(character.class) {
      case "Варвар": baseHp = 12 + conModifier; break;
      case "Воин": 
      case "Паладин":
      case "Следопыт": baseHp = 10 + conModifier; break;
      case "Жрец":
      case "Друид":
      case "Монах":
      case "Плут": baseHp = 8 + conModifier; break;
      case "Волшебник":
      case "Чародей": baseHp = 6 + conModifier; break;
      default: baseHp = 8 + conModifier;
    }
    
    // Добавляем HP за каждый уровень выше 1-го
    let hitDiceValue = 0;
    switch(character.class) {
      case "Варвар": hitDiceValue = 12; break;
      case "Воин":
      case "Паладин":
      case "Следопыт": hitDiceValue = 10; break;
      case "Жрец":
      case "Друид":
      case "Монах":
      case "Плут": hitDiceValue = 8; break;
      case "Волшебник":
      case "Чародей": hitDiceValue = 6; break;
      default: hitDiceValue = 8;
    }
    
    // За каждый уровень после первого добавляем среднее значение кубика + модификатор ТЕЛ
    for (let i = 1; i < level; i++) {
      const levelHP = Math.max(1, Math.floor(hitDiceValue / 2) + 1 + conModifier);
      baseHp += levelHP;
    }
    
    // Минимум 1 HP
    const maxHp = Math.max(1, baseHp);
    
    // Очки чародея для соответствующего класса
    let sorceryPoints = undefined;
    if (character.class === "Чародей" && level > 1) {
      sorceryPoints = {
        current: level,
        max: level
      };
    }
    
    // Create the character object with the correct format for the Character interface
    const charObj: Partial<Character> = {
      name: character.name,
      race: character.race + (character.subrace ? ` (${character.subrace})` : ""),
      className: character.class + (character.subclass ? ` (${character.subclass})` : ""),
      level: level,
      abilities: abilities,
      spells: character.spells || [],
      spellSlots: spellSlots,
      maxHp: maxHp,
      currentHp: maxHp,
      gender: character.gender,
      alignment: character.alignment,
      background: character.background,
      equipment: character.equipment || [],
      languages: character.languages || [],
      proficiencies: character.proficiencies || [],
      sorceryPoints: sorceryPoints,
      theme: localStorage.getItem('theme') || undefined
    };

    try {
      // Сохраняем персонажа и получаем обратно полный объект
      const savedCharacter = await saveCharacter(charObj);
      
      // Устанавливаем его как активный
      setCharacter(savedCharacter);
      
      // Уведомляем пользователя
      toast.success(`Персонаж ${character.name} успешно создан!`);
      
      // Переходим к листу персонажа
      navigate("/sheet");
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      toast.error("Ошибка при сохранении персонажа");
    }
  };

  const handleBackToCreation = () => {
    prevStep();
  };

  const handleDownloadPdf = () => {
    if (!character.name) {
      toast.error("Ошибка: Персонаж должен иметь имя");
      return;
    }
    
    // Преобразуем character в формат CharacterSheet для PDF
    const charForPdf: CharacterSheet = {
      name: character.name,
      race: character.race,
      subrace: character.subrace,
      class: character.class,
      subclass: character.subclass,
      level: character.level || 1,
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
    
    toast.success("PDF создан: Лист персонажа успешно скачан!");
  };

  const handleDownloadHtmlPdf = () => {
    if (!character.name) {
      toast.error("Ошибка: Персонаж должен иметь имя");
      return;
    }
    
    const charForPdf: CharacterSheet = {
      name: character.name,
      race: character.race,
      subrace: character.subrace,
      class: character.class,
      subclass: character.subclass,
      level: character.level || 1,
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
    
    // Скачиваем HTML PDF
    downloadCharacterHTMLPDF(charForPdf);
    
    toast.success("PDF создан: HTML лист персонажа успешно скачан!");
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
          onClick={handleBackToCreation}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к созданию
        </Button>
        <Button
          onClick={handleDownloadPdf}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Скачать PDF (jsPDF)
        </Button>
        <Button
          onClick={handleDownloadHtmlPdf}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowDown className="h-4 w-4" />
          Скачать PDF (HTML)
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
