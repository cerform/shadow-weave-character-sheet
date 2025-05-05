
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllRaces } from '@/data/races';
import { getAllClasses } from '@/data/classes';
import { getAllBackgrounds } from '@/data/backgrounds';
import { Separator } from "@/components/ui/separator";

const HandbookPage: React.FC = () => {
  const [races, setRaces] = useState([]);
  const [classes, setClasses] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [activeSection, setActiveSection] = useState('races');
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);

  useEffect(() => {
    setRaces(getAllRaces());
    setClasses(getAllClasses());
    setBackgrounds(getAllBackgrounds());
  }, []);

  const renderSidebar = () => {
    return (
      <div className="w-64 border-r bg-gray-100/50 h-full">
        <ScrollArea className="h-full">
          <div className="p-4">
            <h2 className="mb-2 font-semibold text-lg">Справочник</h2>
            <Separator className="mb-4" />
            <div className="space-y-2">
              <button
                className={`w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 ${activeSection === 'races' ? 'bg-gray-200 font-medium' : ''}`}
                onClick={() => {setActiveSection('races'); setSelectedRace(null);}}
              >
                Расы
              </button>
              <button
                className={`w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 ${activeSection === 'classes' ? 'bg-gray-200 font-medium' : ''}`}
                onClick={() => {setActiveSection('classes'); setSelectedClass(null);}}
              >
                Классы
              </button>
              <button
                className={`w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 ${activeSection === 'backgrounds' ? 'bg-gray-200 font-medium' : ''}`}
                onClick={() => {setActiveSection('backgrounds'); setSelectedBackground(null);}}
              >
                Предыстории
              </button>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'races':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Расы</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {races.map((race: any) => (
                <Card key={race.name} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>{race.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{race.description}</p>
                    <button
                      className="mt-4 text-blue-500 hover:underline"
                      onClick={() => setSelectedRace(race)}
                    >
                      Подробнее
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedRace && (
              <div className="mt-8">
                {renderRaceDetails(selectedRace)}
              </div>
            )}
          </div>
        );
      case 'classes':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Классы</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls: any) => (
                <Card key={cls.name} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>{cls.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{cls.description}</p>
                    <button
                      className="mt-4 text-blue-500 hover:underline"
                      onClick={() => setSelectedClass(cls)}
                    >
                      Подробнее
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedClass && (
              <div className="mt-8">
                {renderClassDetails(selectedClass)}
              </div>
            )}
          </div>
        );
      case 'backgrounds':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Предыстории</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {backgrounds.map((bg: any) => (
                <Card key={bg.name} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>{bg.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{bg.description}</p>
                    <button
                      className="mt-4 text-blue-500 hover:underline"
                      onClick={() => setSelectedBackground(bg)}
                    >
                      Подробнее
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedBackground && (
              <div className="mt-8">
                {renderBackgroundDetails(selectedBackground)}
              </div>
            )}
          </div>
        );
      default:
        return <div className="p-6">Выберите категорию из справочника.</div>;
    }
  };

  const renderRaceDetails = (race: any) => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{race.name}</h2>
        <p className="text-gray-700">{race.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Прирост характеристик</h3>
            <div className="space-y-1">
              {race.abilityScoreIncrease && Object.entries(race.abilityScoreIncrease).map(([key, value]) => (
                <p key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: +{value}</p>
              ))}
            </div>
            
            <h3 className="text-lg font-semibold mb-2 mt-4">Размер</h3>
            <p>{race.size}</p>
            
            <h3 className="text-lg font-semibold mb-2 mt-4">Скорость</h3>
            <p>{race.speed} фт.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Языки</h3>
            <p>{race.languages.join(', ')}</p>
            
            <h3 className="text-lg font-semibold mb-2 mt-4">Особенности</h3>
            <ul className="list-disc pl-5 space-y-1">
              {race.traits.map((trait: string, index: number) => (
                <li key={index}>{trait}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {race.subraces && race.subraces.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Разновидности</h3>
            <div className="grid grid-cols-1 gap-4">
              {race.subraces.map((subrace: any, index: number) => {
                // Проверяем, является ли subrace объектом или строкой
                const subraceObj = typeof subrace === 'string' 
                  ? { name: subrace, description: `Разновидность ${subrace} расы ${race.name}` }
                  : subrace;
                  
                return (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle>{subraceObj.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Properly handle different types with explicit rendering */}
                      {(() => {
                        // Use an IIFE to ensure we return a ReactNode
                        if (typeof subraceObj.description === 'object') {
                          return <span>Подробное описание</span>;
                        } else if (typeof subraceObj.description === 'string') {
                          return <span>{subraceObj.description}</span>;
                        } else {
                          return <span>Нет описания</span>;
                        }
                      })()}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderClassDetails = (cls: any) => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{cls.name}</h2>
        <p className="text-gray-700">{cls.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Хиты</h3>
            <p>Кость хитов: {cls.hitDice}</p>
            <p>На 1-м уровне: {cls.hitPointsAtFirstLevel}</p>
            <p>На последующих уровнях: {cls.hitPointsAtHigherLevels}</p>
            
            <h3 className="text-lg font-semibold mb-2 mt-4">Спасброски</h3>
            <p>{cls.savingThrows.join(', ')}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Снаряжение</h3>
            <ul className="list-disc pl-5 space-y-1">
              {cls.equipment.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderBackgroundDetails = (background: any) => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{background.name}</h2>
        <p className="text-gray-700">{background.description}</p>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Навыки</h3>
          <p>{background.skillProficiencies.join(', ')}</p>
          
          <h3 className="text-lg font-semibold mb-2 mt-4">Инструменты</h3>
          <p>{background.toolProficiencies || 'Нет'}</p>
          
          <h3 className="text-lg font-semibold mb-2 mt-4">Языки</h3>
          <p>{background.languages || 'Нет'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {renderSidebar()}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default HandbookPage;
