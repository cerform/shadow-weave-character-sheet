
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FeatsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const FeatsTab: React.FC<FeatsTabProps> = ({ character, onUpdate }) => {
  const [expandedSections, setExpandedSections] = useState({
    racial: true,
    class: true,
    background: true,
    feats: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Получаем особенности расы
  const racialFeatures = character.raceFeatures || [];
  
  // Получаем особенности класса
  const classFeatures = character.classFeatures || [];
  
  // Получаем особенности предыстории
  const backgroundFeatures = character.backgroundFeatures || [];
  
  // Получаем черты персонажа
  const characterFeats = character.feats || [];

  // Вспомогательная функция для определения, есть ли какие-то особенности
  const hasAnyFeatures = () => {
    return racialFeatures.length > 0 || 
           classFeatures.length > 0 || 
           backgroundFeatures.length > 0 ||
           characterFeats.length > 0;
  };

  // Вспомогательная функция для отображения раскрывающегося блока с содержимым
  const renderExpandableSection = (
    title: string,
    features: any[],
    expanded: boolean,
    onToggle: () => void
  ) => {
    if (!features || features.length === 0) {
      return (
        <div className="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800/50">
          <div className="flex justify-between items-center cursor-pointer" onClick={onToggle}>
            <h3 className="text-xl font-semibold text-amber-400">{title}</h3>
            {expanded ? 
              <ChevronUp className="h-5 w-5 text-amber-400" /> : 
              <ChevronDown className="h-5 w-5 text-amber-400" />
            }
          </div>
          {expanded && (
            <div className="mt-2 text-gray-400">
              Нет особенностей {title.toLowerCase()}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800/50">
        <div className="flex justify-between items-center cursor-pointer" onClick={onToggle}>
          <h3 className="text-xl font-semibold text-amber-400">{title}</h3>
          {expanded ? 
            <ChevronUp className="h-5 w-5 text-amber-400" /> : 
            <ChevronDown className="h-5 w-5 text-amber-400" />
          }
        </div>
        
        {expanded && (
          <div className="mt-2 space-y-2">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800/70 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-300 text-lg">
                    {feature.name} {feature.level ? `(Ур. ${feature.level})` : ''}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-200">
                  <p className="whitespace-pre-line">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-amber-500 mb-6">Особенности и умения</h2>
      
      {hasAnyFeatures() ? (
        <ScrollArea className="h-[70vh]">
          {/* Особенности расы */}
          {renderExpandableSection(
            `Особенности расы ${character.race || ''}`,
            racialFeatures,
            expandedSections.racial,
            () => toggleSection('racial')
          )}
          
          {/* Особенности класса */}
          {renderExpandableSection(
            `Особенности класса ${character.class || ''}`,
            classFeatures,
            expandedSections.class,
            () => toggleSection('class')
          )}
          
          {/* Особенности предыстории */}
          {renderExpandableSection(
            `Особенности предыстории ${character.background || ''}`,
            backgroundFeatures,
            expandedSections.background,
            () => toggleSection('background')
          )}
          
          {/* Черты персонажа */}
          {renderExpandableSection(
            'Черты персонажа',
            characterFeats,
            expandedSections.feats,
            () => toggleSection('feats')
          )}
        </ScrollArea>
      ) : (
        <div className="p-8 text-center">
          <div className="text-lg text-gray-400 mb-4">
            У вашего персонажа пока нет особенностей или умений
          </div>
          <p className="text-gray-500">
            Особенности и умения появятся по мере развития персонажа, 
            выбора классовых опций, или получения черт
          </p>
        </div>
      )}
    </div>
  );
};

export default FeatsTab;
