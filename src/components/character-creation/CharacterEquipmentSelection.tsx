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

// Базовое снаряжение по категориям
const BASIC_EQUIPMENT = {
  weapons: [
    "Длинный меч",
    "Короткий меч",
    "Длинный лук",
    "Короткий лук",
    "Кинжал",
    "Боевой топор",
    "Булава",
    "Посох",
    "Рапира",
    "Арбалет",
  ],
  armor: [
    "Кожаный доспех",
    "Кольчуга",
    "Латы",
    "Щит",
  ],
  accessories: [
    "Мешочек с компонентами",
    "Священный символ",
    "Амулет защиты",
    "Кольцо невидимости",
    "Плащ эльфийской работы",
  ],
  packs: [
    "Набор авантюриста",
    "Набор исследователя подземелий",
    "Набор целителя",
    "Набор дипломата",
    "Набор священника",
    "Набор путешественника",
    "Набор учёного",
  ],
  tools: [
    "Инструменты вора",
    "Музыкальный инструмент",
    "Инструменты алхимика",
    "Инструменты ремесленника",
    "Набор травника",
  ],
};

// Снаряжение, специфичное для классов
const CLASS_EQUIPMENT = {
  "Бард": {
    weapons: ["Рапира", "Длинный меч", "Короткий меч", "Кинжал"],
    accessories: ["Музыкальный инструмент", "Мешочек с компонентами"],
    packs: ["Набор дипломата", "Набор артиста"],
  },
  "Жрец": {
    weapons: ["Булава", "Боевой молот", "Лёгкий арбалет"],
    armor: ["Кольчуга", "Чешуйчатый доспех", "Щит"],
    accessories: ["Священный символ"],
    packs: ["Набор священника", "Набор путешественника"],
  },
  "Волшебник": {
    weapons: ["Посох", "Кинжал", "Лёгкий арбалет"],
    accessories: ["Мешочек с компонентами", "Книга заклинаний", "Магическая фокусировка"],
    packs: ["Набор учёного", "Набор путешественника"],
  },
  "Воин": {
    weapons: ["Длинный меч", "Длинный лук", "Боевой топор", "Копьё", "Арбалет"],
    armor: ["Кольчуга", "Кожаный доспех", "Щит"],
    packs: ["Набор путешественника", "Набор исследователя"],
  },
  "Плут": {
    weapons: ["Рапира", "Короткий меч", "Короткий лук", "Кинжал", "Ручной арбалет"],
    armor: ["Кожаный доспех"],
    tools: ["Инструменты вора"],
    packs: ["Набор взломщика", "Набор исследователя", "Набор артиста"],
  },
  "Варвар": {
    weapons: ["Двуручный топор", "Боевой топор", "Метательное копьё"],
    packs: ["Набор исследователя"],
  },
  "Паладин": {
    weapons: ["Длинный меч", "Боевой молот", "Метательное копьё"],
    armor: ["Кольчуга", "Щит"],
    accessories: ["Священный символ"],
    packs: ["Набор священника", "Набор путешественника"],
  },
  "Колдун": {
    weapons: ["Кинжал", "Посох", "Лёгкий арбалет"],
    armor: ["Кожаный доспех"],
    accessories: ["Мешочек с компонентами", "Магическая фокусировка"],
    packs: ["Набор учёного", "Набор подземелья"],
  },
  "Друид": {
    weapons: ["Серп", "Дубинка", "Копьё", "Кинжал"],
    armor: ["Кожаный доспех", "Щит"],
    accessories: ["Фокусировка друида"],
    tools: ["Набор травника"],
    packs: ["Набор путешественника"],
  },
  "Чародей": {
    weapons: ["Кинжал", "Посох", "Лёгкий арбалет"],
    accessories: ["Магическая фокусировка", "Мешочек с компонентами"],
    packs: ["Набор путешественника", "Набор дипломата"],
  },
  "Следопыт": {
    weapons: ["Короткий меч", "Длинный лук", "Короткий лук"],
    armor: ["Чешуйчатый доспех", "Кожаный доспех"],
    packs: ["Набор путешественника", "Набор исследователя"],
  },
  "Монах": {
    weapons: ["Короткий меч", "Посох", "Кинжал", "Дротик"],
    packs: ["Набор путешественника", "Набор подземелья"],
  },
  "Изобретатель": {
    weapons: ["Кинжал", "Лёгкий арбалет"],
    armor: ["Кожаный доспех", "Щит"],
    tools: ["Инструменты изобретателя", "Инструменты вора"],
    accessories: ["Магическая фокусировка", "Мешочек с компонентами"],
    packs: ["Набор путешественника"],
  }
};

// Функция для получения доступного снаряжения для выбранного класса
const getAvailableEquipmentForClass = (className: string) => {
  const classEquipment = CLASS_EQUIPMENT[className as keyof typeof CLASS_EQUIPMENT] || {};
  const result: Record<string, string[]> = {};

  // Для каждой категории берем базовое снаряжение и добавляем специфичное для класса
  Object.entries(EQUIPMENT_CATEGORIES).forEach(([key, value]) => {
    const categoryKey = key as keyof typeof BASIC_EQUIPMENT;
    const classItems = classEquipment[categoryKey] || [];
    const baseItems = BASIC_EQUIPMENT[categoryKey] || [];
    
    // Объединяем и удаляем дубликаты
    const uniqueItems = Array.from(new Set([...classItems, ...baseItems]));
    result[key] = uniqueItems;
  });

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
    return (
      <div className="mb-6" key={category}>
        <h3 className="text-lg font-semibold text-amber-500 mb-3">{EQUIPMENT_CATEGORIES[category as keyof typeof EQUIPMENT_CATEGORIES]}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <button
              key={item}
              className={`
                px-4 py-2 rounded-md text-left border transition-colors
                ${isItemSelected(item)
                  ? "bg-amber-900/30 border-amber-600 text-amber-300"
                  : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800"}
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
