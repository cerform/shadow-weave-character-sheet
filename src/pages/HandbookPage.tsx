
import React, { useState, useEffect } from 'react';
import HandbookSidebar from '@/components/handbook/HandbookSidebar';
import RacesList from '@/components/handbook/RacesList';
import RaceDetails from '@/components/handbook/RaceDetails';
import ClassesList from '@/components/handbook/ClassesList';
import ClassDetails from '@/components/handbook/ClassDetails';
import BackgroundsList from '@/components/handbook/BackgroundsList';
import BackgroundDetails from '@/components/handbook/BackgroundDetails';
import RulesList from '@/components/handbook/RulesList';
import RuleDetails from '@/components/handbook/RuleDetails';
import { getAllRaces, getAllRaceSources } from '@/data/races';
import { getAllClasses, getAllClassSources } from '@/data/classes';
import { getAllBackgrounds, getAllBackgroundSources } from '@/data/backgrounds';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';

import NavigationButtons from '@/components/ui/NavigationButtons';

const HandbookPage: React.FC = () => {
  // Состояния для данных
  const [races, setRaces] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  
  // Состояния для UI
  const [activeSection, setActiveSection] = useState('rules');
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedBackground, setSelectedBackground] = useState<any>(null);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояния для фильтров
  const [sources, setSources] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  
  // Получаем тему
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;
  
  // Загрузка данных при инициализации
  useEffect(() => {
    setRaces(getAllRaces());
    setClasses(getAllClasses());
    setBackgrounds(getAllBackgrounds());
    
    // Получаем уникальные источники из всех типов данных
    const raceSources = getAllRaceSources();
    const classSources = getAllClassSources();
    const backgroundSources = getAllBackgroundSources();
    
    // Объединяем и делаем уникальными
    const allSources = [...new Set([...raceSources, ...classSources, ...backgroundSources])];
    setSources(allSources);
  }, []);
  
  // Сброс выбранного элемента при смене раздела
  useEffect(() => {
    setSelectedRace(null);
    setSelectedClass(null);
    setSelectedBackground(null);
    setSelectedRule(null);
    setSearchQuery('');
  }, [activeSection]);
  
  // Рендеринг содержимого
  const renderContent = () => {
    switch (activeSection) {
      case 'rules':
        return selectedRule 
          ? <RuleDetails rule={selectedRule} onBack={() => setSelectedRule(null)} /> 
          : <RulesList 
              searchQuery={searchQuery} 
              setSelectedRule={setSelectedRule} 
            />;
      case 'races':
        return selectedRace 
          ? <RaceDetails race={selectedRace} onBack={() => setSelectedRace(null)} /> 
          : <RacesList 
              races={races} 
              searchQuery={searchQuery} 
              selectedSources={selectedSources} 
              setSelectedRace={setSelectedRace} 
            />;
      case 'classes':
        return selectedClass 
          ? <ClassDetails cls={selectedClass} onBack={() => setSelectedClass(null)} /> 
          : <ClassesList 
              classes={classes} 
              searchQuery={searchQuery} 
              selectedSources={selectedSources} 
              setSelectedClass={setSelectedClass} 
            />;
      case 'backgrounds':
        return selectedBackground 
          ? <BackgroundDetails background={selectedBackground} onBack={() => setSelectedBackground(null)} /> 
          : <BackgroundsList 
              backgrounds={backgrounds} 
              searchQuery={searchQuery} 
              selectedSources={selectedSources} 
              setSelectedBackground={setSelectedBackground} 
            />;
      default:
        return (
          <div 
            className="p-6"
            style={{ color: currentTheme.textColor }}
          >
            Выберите категорию из справочника.
          </div>
        );
    }
  };

  return (
    <BackgroundWrapper>
      {/* Навигационная панель */}
      <div className="p-4 flex items-center justify-between">
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Боковая панель */}
        <HandbookSidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sources={sources}
          selectedSources={selectedSources}
          setSelectedSources={setSelectedSources}
        />
        
        {/* Основное содержимое */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 
                className="text-3xl font-bold"
                style={{ color: currentTheme.accent, textShadow: `0 0 10px ${currentTheme.accent}80` }}
              >
                {activeSection === 'rules' && 'Правила игры'}
                {activeSection === 'races' && 'Расы'}
                {activeSection === 'classes' && 'Классы'}
                {activeSection === 'backgrounds' && 'Предыстории'}
              </h1>
            </div>
            
            {renderContent()}
          </div>
        </div>
      </div>
      
      
    </BackgroundWrapper>
  );
};

export default HandbookPage;
