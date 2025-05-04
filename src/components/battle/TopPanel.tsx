
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NavigationButtons from '@/components/ui/NavigationButtons';
import HomeButton from '@/components/navigation/HomeButton';

const TopPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  // Заглушки для функций навигации
  const prevStep = () => console.log('Previous step');
  const nextStep = () => console.log('Next step');
  
  return (
    <Card className={`p-4 flex justify-between items-center ${className}`}>
      <HomeButton showText={false} />
      <NavigationButtons 
        prevStep={prevStep} 
        nextStep={nextStep} 
        disableNext={false}
      />
    </Card>
  );
};

export default TopPanel;
