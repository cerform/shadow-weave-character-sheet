import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { CharacterHeader } from './CharacterHeader';
import { HPBar } from './HPBar';
import { Button } from '@/components/ui/button';
import { FileUp, Save } from 'lucide-react';
import SaveCharacterButton from './SaveCharacterButton';
import CharacterExportPDF from './CharacterExportPDF';
import DicePanel from './DicePanel';
import RestPanel from './RestPanel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { isItem } from '@/utils/characterUtils';

interface MobileCharacterSheetProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const MobileCharacterSheet: React.FC<MobileCharacterSheetProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  
  // Импорт персонажа из JSON
  const importFromJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedCharacter = JSON.parse(event.target?.result as string);
            onUpdate(importedCharacter);
            
            toast({
              title: "Успешно импортировано",
              description: "Персонаж загружен из JSON файла.",
            });
          } catch (error) {
            toast({
              title: "Ошибка импорта",
              description: "Невозможно загрузить файл. Убедитесь, что это корректный JSON.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  const renderEquipmentItem = (item: string | Item) => {
    if (isItem(item)) {
      return (
        <div key={item.name}>
          <span>{item.name}</span>
          <span>{item.type}</span>
        </div>
      );
    } else {
      return <div key={item}>{item}</div>;
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Заголовок с именем персонажа */}
      <div className="mb-4">
        <CharacterHeader
          character={character}
          onUpdate={onUpdate}
        />
      </div>
      
      {/* Панель здоровья */}
      <div className="mb-4">
        <HPBar
          currentHp={character.currentHp || 0}
          maxHp={character.maxHp || 1}
          temporaryHp={character.tempHp || character.temporaryHp || 0}
          onUpdate={(hp) => onUpdate(hp)}
        />
      </div>
      
      {/* Основные вкладки */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="general">Общее</TabsTrigger>
          <TabsTrigger value="combat">Бой</TabsTrigger>
          <TabsTrigger value="manage">Управление</TabsTrigger>
        </TabsList>
        
        {/* Вкладка "Общее" */}
        <TabsContent value="general">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="basic-info">
              <AccordionTrigger className="text-base font-medium">Базовая информация</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Класс:</span>
                    <span>{character.class || 'Не указан'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Раса:</span>
                    <span>{character.race || 'Не указана'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Предыстория:</span>
                    <span>{character.background || 'Не указана'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Уровень:</span>
                    <span>{character.level}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="abilities">
              <AccordionTrigger className="text-base font-medium">Характеристики</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-3 gap-2">
                  {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((ability) => (
                    <div key={ability} className="flex flex-col items-center p-2 border rounded-lg">
                      <span className="text-xs uppercase">{ability.substring(0, 3)}</span>
                      <span className="text-lg font-bold">
                        {character[ability as keyof Character] as number || 10}
                      </span>
                      <span className="text-xs">
                        {getModifier(character[ability as keyof Character] as number || 10)}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="skills">
              <AccordionTrigger className="text-base font-medium">Навыки</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 text-sm">
                  {character.skills && Object.entries(character.skills).map(([name, skill]) => (
                    <div key={name} className="flex justify-between items-center py-0.5">
                      <span>{name}</span>
                      <span className="font-medium">
                        {typeof skill === 'object' && 'bonus' in skill 
                          ? (skill.bonus && skill.bonus > 0 ? `+${skill.bonus}` : String(skill.bonus)) 
                          : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="equipment">
              <AccordionTrigger className="text-base font-medium">Снаряжение</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  {/* Рендеринг оружия */}
                  <div>
                    <h4 className="font-medium mb-1">Оружие:</h4>
                    <ul className="list-disc list-inside">
                      {renderEquipmentItems(character, 'weapons')}
                    </ul>
                  </div>
                  
                  {/* Рендеринг доспехов */}
                  <div>
                    <h4 className="font-medium mb-1">Доспехи:</h4>
                    {renderEquipmentItems(character, 'armor')}
                  </div>
                  
                  {/* Рендеринг предметов */}
                  <div>
                    <h4 className="font-medium mb-1">Предметы:</h4>
                    <ul className="list-disc list-inside">
                      {renderEquipmentItems(character, 'items')}
                    </ul>
                  </div>
                  
                  {/* Золото */}
                  <div className="flex justify-between">
                    <span className="font-medium">Золото:</span>
                    <span>{character.gold || 0} зм</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {isMagicClass(character) && (
              <AccordionItem value="spells">
                <AccordionTrigger className="text-base font-medium">Заклинания</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    {character.spells && Array.isArray(character.spells) && character.spells.length > 0 ? (
                      character.spells.map((spell, index) => (
                        <div key={index} className="p-2 border rounded-md">
                          <div className="font-medium">
                            {typeof spell === 'string' 
                              ? spell 
                              : 'name' in spell 
                                ? spell.name 
                                : 'Неизвестное заклинание'}
                          </div>
                          <div className="text-xs">
                            Уровень: {typeof spell === 'string' 
                              ? '?' 
                              : 'level' in spell 
                                ? spell.level 
                                : '?'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Нет заклинаний</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </TabsContent>
        
        {/* Вкладка "Бой" */}
        <TabsContent value="combat">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex flex-col items-center p-2 border rounded-lg">
                <span className="text-xs">КД</span>
                <span className="text-xl font-bold">{character.armorClass || 10}</span>
              </div>
              <div className="flex flex-col items-center p-2 border rounded-lg">
                <span className="text-xs">Инициатива</span>
                <span className="text-xl font-bold">
                  {character.initiative !== undefined ? character.initiative : '+0'}
                </span>
              </div>
              <div className="flex flex-col items-center p-2 border rounded-lg">
                <span className="text-xs">Скорость</span>
                <span className="text-xl font-bold">{character.speed || '30'}</span>
              </div>
            </div>
            
            <DicePanel character={character} onUpdate={onUpdate} />
          </div>
        </TabsContent>
        
        {/* Вкладка "Управление" */}
        <TabsContent value="manage">
          <div className="space-y-4">
            <RestPanel character={character} onUpdate={onUpdate} />
            
            <div className="flex flex-col space-y-2 mt-4">
              <Button variant="outline" size="sm" onClick={importFromJSON} className="w-full">
                <FileUp className="h-4 w-4 mr-2" />
                Импорт
              </Button>
              
              <CharacterExportPDF character={character} />
              
              <SaveCharacterButton character={character} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
  
  // Вспомогательные функции
  function getModifier(value: number): string {
    const mod = Math.floor((value - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }
  
  function isMagicClass(character: Character): boolean {
    const magicClasses = ['Бард', 'Волшебник', 'Друид', 'Жрец', 'Колдун', 'Паладин', 'Следопыт', 'Чародей'];
    return magicClasses.includes(character.class || '');
  }
  
  function renderEquipmentItems(character: Character, type: 'weapons' | 'armor' | 'items'): JSX.Element | JSX.Element[] {
    if (!character.equipment) {
      return <li>Нет предметов</li>;
    }
    
    // Если equipment - массив объектов Item
    if (Array.isArray(character.equipment)) {
      if (type === 'armor') {
        const armorItem = character.equipment.find(item => item.type === 'armor');
        return armorItem ? <div>{armorItem.name}</div> : <div>Нет доспехов</div>;
      } else {
        const items = character.equipment.filter(item => {
          if (type === 'weapons') return item.type === 'weapon';
          if (type === 'items') return item.type !== 'weapon' && item.type !== 'armor';
          return false;
        });
        
        return (
          <>
            {items.length > 0 ? (
              items.map((item, i) => <li key={i}>{item.name}</li>)
            ) : (
              <li>Нет предметов</li>
            )}
          </>
        );
      }
    } else {
      // Если equipment - объект с weapons, armor и items
      const equipment = character.equipment as {
        weapons?: string[];
        armor?: string;
        items?: string[];
      };
      
      if (type === 'armor') {
        return equipment.armor ? <div>{equipment.armor}</div> : <div>Нет доспехов</div>;
      } else if (type === 'weapons' && equipment.weapons) {
        return (
          <>
            {equipment.weapons.length > 0 ? (
              equipment.weapons.map((weapon, i) => <li key={i}>{weapon}</li>)
            ) : (
              <li>Нет оружия</li>
            )}
          </>
        );
      } else if (type === 'items' && equipment.items) {
        return (
          <>
            {equipment.items.length > 0 ? (
              equipment.items.map((item, i) => <li key={i}>{item}</li>)
            ) : (
              <li>Нет предметов</li>
            )}
          </>
        );
      }
      
      return <li>Нет предметов</li>;
    }
  }
};

export default MobileCharacterSheet;
