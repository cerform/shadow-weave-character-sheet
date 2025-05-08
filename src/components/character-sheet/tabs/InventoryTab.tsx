
import React from 'react';
import { Character } from '@/types/character';

interface InventoryTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const InventoryTab: React.FC<InventoryTabProps> = ({ character, onUpdate }) => {
  // Проверяем тип equipment и делаем правильное обращение
  const getWeapons = () => {
    if (!character.equipment) return [];
    if (Array.isArray(character.equipment)) return character.equipment;
    return character.equipment.weapons || [];
  };

  const getArmor = () => {
    if (!character.equipment) return '';
    if (Array.isArray(character.equipment)) return '';
    return character.equipment.armor || '';
  };

  const getItems = () => {
    if (!character.equipment) return [];
    if (Array.isArray(character.equipment)) return character.equipment;
    return character.equipment.items || [];
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Инвентарь</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Оружие</h3>
          <ul className="list-disc pl-5">
            {getWeapons().map((weapon, index) => (
              <li key={index}>{weapon}</li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Доспехи</h3>
          <p>{getArmor() || 'Нет'}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Предметы</h3>
        <ul className="list-disc pl-5">
          {getItems().map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Валюта</h3>
        <div className="grid grid-cols-5 gap-2">
          <div className="text-center">
            <p className="font-bold">ММ</p>
            <p>{character.currency?.cp || 0}</p>
          </div>
          <div className="text-center">
            <p className="font-bold">СМ</p>
            <p>{character.currency?.sp || 0}</p>
          </div>
          <div className="text-center">
            <p className="font-bold">ЭМ</p>
            <p>{character.currency?.ep || 0}</p>
          </div>
          <div className="text-center">
            <p className="font-bold">ЗМ</p>
            <p>{character.currency?.gp || 0}</p>
          </div>
          <div className="text-center">
            <p className="font-bold">ПМ</p>
            <p>{character.currency?.pp || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;
