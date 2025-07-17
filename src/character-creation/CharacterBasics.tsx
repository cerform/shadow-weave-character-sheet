import React from 'react';

interface Props {
  name: string;
  level: number;
  onChange: (field: 'name' | 'level', value: string | number) => void;
}

export default function CharacterBasics({ name, level, onChange }: Props) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-yellow-500">Имя персонажа:</label>
        <input
          className="w-full p-2 border rounded"
          type="text"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      <div>
        <label className="text-yellow-500">Уровень:</label>
        <input
          className="w-full p-2 border rounded"
          type="number"
          min={1}
          max={20}
          value={level}
          onChange={(e) => onChange('level', parseInt(e.target.value))}
        />
      </div>
    </div>
  );
}
