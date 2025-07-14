import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavigationButtons from "./NavigationButtons";
import { useToast } from "@/hooks/use-toast";
import SectionHeader from "@/components/ui/section-header";
import { getClassDetails } from "@/data/classes/index";

// Базовые категории снаряжения
const EQUIPMENT_CATEGORIES = {
  weapons: "Оружие",
  armor: "Доспехи и щиты",
  accessories: "Аксессуары",
  packs: "Снаряжение",
  tools: "Инструменты",
};

// Базовое снаряжение по категориям с классификацией доспехов
const BASIC_EQUIPMENT = {
  weapons: {
    simple: ["Кинжал", "Дубинка", "Дротик", "Метательное копьё", "Булава", "Посох", "Лёгкий арбалет"],
    martial: ["Длинный меч", "Короткий меч", "Длинный лук", "Короткий лук", "Боевой топор", "Рапира", "Арбалет", "Двуручный топор", "Боевой молот"]
  },
  armor: {
    light: ["Мягкий кожаный доспех", "Кожаный доспех", "Проклёпанная кожа"],
    medium: ["Шкуры", "Кольчужная рубаха", "Чешуйчатый доспех", "Нагрудник", "Полулаты"],
    heavy: ["Кольчатый доспех", "Кольчуга", "Ламеллярный доспех", "Латы"],
    shields: ["Щит"]
  },
  accessories: [
    "Мешочек с компонентами",
    "Священный символ",
    "Амулет защиты",
    "Кольцо невидимости",
    "Плащ эльфийской работы",
    "Магическая фокусировка",
    "Книга заклинаний",
    "Фокусировка друида"
  ],
  packs: [
    "Набор авантюриста",
    "Набор исследователя подземелий",
    "Набор целителя",
    "Набор дипломата",
    "Набор священника",
    "Набор путешественника",
    "Набор учёного",
    "Набор взломщика",
    "Набор артиста"
  ],
  tools: [
    "Инструменты вора",
    "Музыкальный инструмент",
    "Инструменты алхимика",
    "Инструменты ремесленника",
    "Набор травника",
    "Инструменты изобретателя"
  ],
};

// Владения классов
const CLASS_PROFICIENCIES = {
  "Бард": {
    armor: ["light"],
    weapons: ["simple", "hand_crossbows", "longswords", "rapiers", "shortswords"],
    shields: false
  },
  "Жрец": {
    armor: ["light", "medium"],
    weapons: ["simple"],
    shields: true
  },
  "Волшебник": {
    armor: [],
    weapons: ["daggers", "darts", "slings", "quarterstaffs", "light_crossbows"],
    shields: false
  },
  "Воин": {
    armor: ["light", "medium", "heavy"],
    weapons: ["simple", "martial"],
    shields: true
  },
  "Плут": {
    armor: ["light"],
    weapons: ["simple", "hand_crossbows", "longswords", "rapiers", "shortswords"],
    shields: false
  },
  "Варвар": {
    armor: ["light", "medium"],
    weapons: ["simple", "martial"],
    shields: true
  },
  "Паладин": {
    armor: ["light", "medium", "heavy"],
    weapons: ["simple", "martial"],
    shields: true
  },
  "Колдун": {
    armor: ["light"],
    weapons: ["simple"],
    shields: false
  },
  "Друид": {
    armor: ["light", "medium"],
    weapons: ["clubs", "daggers", "darts", "javelins", "maces", "quarterstaffs", "scimitars", "sickles", "slings", "spears"],
    shields: true
  },
  "Чародей": {
    armor: [],
    weapons: ["daggers", "darts", "slings", "quarterstaffs", "light_crossbows"],
    shields: false
  },
  "Следопыт": {
    armor: ["light", "medium"],
    weapons: ["simple", "martial"],
    shields: true
  },
  "Монах": {
    armor: [],
    weapons: ["simple", "shortswords"],
    shields: false
  },
  "Изобретатель": {
    armor: ["light", "medium"],
    weapons: ["simple", "firearms"],
    shields: true
  }
};

// Функция для получения доступного снаряжения для выбранного класса
const getAvailableEquipmentForClass = (className: string) => {
  const classProficiencies = CLASS_PROFICIENCIES[className as keyof typeof CLASS_PROFICIENCIES];
  if (!classProficiencies) {
    // Если класс не найден, показываем только базовое снаряжение
    return {
      weapons: [...BASIC_EQUIPMENT.weapons.simple],
      armor: [...BASIC_EQUIPMENT.armor.light],
      accessories: BASIC_EQUIPMENT.accessories,
      packs: BASIC_EQUIPMENT.packs,
      tools: BASIC_EQUIPMENT.tools
    };
  }

  const result: Record<string, string[]> = {};

  // Оружие - только разрешенное для класса
  const availableWeapons: string[] = [];
  if (classProficiencies.weapons.includes("simple")) {
    availableWeapons.push(...BASIC_EQUIPMENT.weapons.simple);
  }
  if (classProficiencies.weapons.includes("martial")) {
    availableWeapons.push(...BASIC_EQUIPMENT.weapons.martial);
  }
  // Добавляем специфичные виды оружия для определенных классов
  if (classProficiencies.weapons.includes("hand_crossbows")) {
    availableWeapons.push("Ручной арбалет");
  }
  if (classProficiencies.weapons.includes("longswords")) {
    availableWeapons.push("Длинный меч");
  }
  if (classProficiencies.weapons.includes("rapiers")) {
    availableWeapons.push("Рапира");
  }
  if (classProficiencies.weapons.includes("shortswords")) {
    availableWeapons.push("Короткий меч");
  }
  result.weapons = [...new Set(availableWeapons)];

  // Доспехи - только разрешенные для класса
  const availableArmor: string[] = [];
  classProficiencies.armor.forEach(armorType => {
    if (armorType === "light") availableArmor.push(...BASIC_EQUIPMENT.armor.light);
    if (armorType === "medium") availableArmor.push(...BASIC_EQUIPMENT.armor.medium);
    if (armorType === "heavy") availableArmor.push(...BASIC_EQUIPMENT.armor.heavy);
  });
  if (classProficiencies.shields) {
    availableArmor.push(...BASIC_EQUIPMENT.armor.shields);
  }
  result.armor = availableArmor;

  // Ограничиваем аксессуары в зависимости от класса
  const availableAccessories = BASIC_EQUIPMENT.accessories.filter(item => {
    // Магические предметы только для магических классов
    if (item.includes("Магическая") || item.includes("заклинаний") || item.includes("компонентами")) {
      return ["Волшебник", "Чародей", "Колдун", "Жрец", "Бард", "Друид", "Паладин", "Следопыт"].includes(className);
    }
    // Священные символы только для божественных классов
    if (item.includes("Священный")) {
      return ["Жрец", "Паладин"].includes(className);
    }
    // Фокусировка друида только для друидов
    if (item.includes("друида")) {
      return className === "Друид";
    }
    return true;
  });
  result.accessories = availableAccessories;

  // Ограничиваем наборы снаряжения
  const availablePacks = BASIC_EQUIPMENT.packs.filter(pack => {
    if (pack.includes("священника")) return ["Жрец", "Паладин"].includes(className);
    if (pack.includes("взломщика")) return ["Плут"].includes(className);
    if (pack.includes("артиста")) return ["Бард"].includes(className);
    if (pack.includes("учёного")) return ["Волшебник", "Изобретатель"].includes(className);
    return true;
  });
  result.packs = availablePacks;

  // Ограничиваем инструменты
  const availableTools = BASIC_EQUIPMENT.tools.filter(tool => {
    if (tool.includes("вора")) return className === "Плут";
    if (tool.includes("алхимика")) return ["Волшебник", "Изобретатель"].includes(className);
    if (tool.includes("изобретателя")) return className === "Изобретатель";
    if (tool.includes("травника")) return ["Друид", "Следопыт"].includes(className);
    return true;
  });
  result.tools = availableTools;

  return result;
};

interface CharacterEquipmentSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterEquipmentSelection: React.FC<CharacterEquipmentSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>(character.equipment || []);
  const [customItem, setCustomItem] = useState("");
  const [availableEquipment, setAvailableEquipment] = useState<Record<string, string[]>>({});
  const [classDetails, setClassDetails] = useState<any>(null);
  const { toast } = useToast();

  // Загружаем детали класса и доступное снаряжение
  useEffect(() => {
    if (character.class) {
      const details = getClassDetails(character.class);
      setClassDetails(details);
      
      // Получаем снаряжение для выбранного класса
      const equipment = getAvailableEquipmentForClass(details?.name || "");
      setAvailableEquipment(equipment);
    }
  }, [character.class]);

  const isItemSelected = (item: string) => {
    return selectedItems.includes(item);
  };

  const toggleItem = (item: string) => {
    if (isItemSelected(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const addCustomItem = () => {
    if (customItem.trim()) {
      if (isItemSelected(customItem)) {
        toast({
          title: "Предмет уже добавлен",
          description: "Этот предмет уже в вашем инвентаре",
          variant: "destructive",
        });
        return;
      }
      setSelectedItems([...selectedItems, customItem]);
      setCustomItem("");
    }
  };

  const handleNext = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Выберите снаряжение",
        description: "Пожалуйста, выберите хотя бы один предмет снаряжения.",
        variant: "destructive",
      });
      return;
    }

    updateCharacter({ equipment: selectedItems });
    nextStep();
  };

  // Рендер секции с предметами
  const renderEquipmentSection = (category: string, items: string[]) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mb-6" key={category}>
        <h3 className="text-lg font-semibold text-amber-500 mb-3">
          {EQUIPMENT_CATEGORIES[category as keyof typeof EQUIPMENT_CATEGORIES]}
          {category === 'armor' && (
            <span className="text-sm text-gray-400 ml-2">
              (доступно для {classDetails?.name || 'этого класса'})
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <button
              key={item}
              className={`
                px-4 py-2 rounded-md text-left border transition-colors animate-fade-in
                ${isItemSelected(item)
                  ? "bg-amber-900/30 border-amber-600 text-amber-300"
                  : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover-scale"}
              `}
              onClick={() => toggleItem(item)}
            >
              <div className="flex items-center">
                <div className="flex-grow">{item}</div>
                {isItemSelected(item) && (
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Показываем начальное снаряжение из описания класса
  const renderClassStartingEquipment = () => {
    if (!classDetails?.equipment || classDetails.equipment.length === 0) return null;
    
    return (
      <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-md">
        <h3 className="text-lg font-semibold text-white mb-2">Рекомендуемое начальное снаряжение для {classDetails.name}</h3>
        <ul className="list-disc pl-6 text-gray-300 space-y-1">
          {classDetails.equipment.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <SectionHeader
        title="Снаряжение"
        description="Выберите снаряжение для вашего персонажа."
      />

      {/* Показываем рекомендуемое снаряжение для выбранного класса */}
      {renderClassStartingEquipment()}

      <ScrollArea className="h-[60vh] pr-4">
        {Object.entries(availableEquipment).map(([category, items]) => {
          if (items.length > 0) {
            return renderEquipmentSection(category, items);
          }
          return null;
        })}

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-amber-500 mb-3">Добавить своё снаряжение</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Введите название предмета..."
              value={customItem}
              onChange={(e) => setCustomItem(e.target.value)}
              className="bg-gray-800/50 border-gray-700 text-white"
            />
            <Button
              onClick={addCustomItem}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Добавить
            </Button>
          </div>
        </div>
      </ScrollArea>

      <div className="mt-6 bg-gray-800/70 p-4 rounded-md border border-gray-700">
        <h3 className="font-semibold mb-2 text-amber-400">Выбранное снаряжение ({selectedItems.length})</h3>
        <div className="flex flex-wrap gap-1">
          {selectedItems.length > 0 ? (
            selectedItems.map((item) => (
              <div
                key={item}
                className="bg-amber-900/40 text-amber-300 px-2 py-1 rounded-md flex items-center text-sm"
              >
                <span>{item}</span>
                <button
                  className="ml-1 text-gray-400 hover:text-white"
                  onClick={() => toggleItem(item)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Пока не выбрано ни одного предмета.</p>
          )}
        </div>
      </div>

      <NavigationButtons
        allowNext={selectedItems.length > 0}
        nextStep={handleNext}
        prevStep={prevStep}
      />
    </div>
  );
};

export default CharacterEquipmentSelection;
