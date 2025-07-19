import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface RuleDetailsProps {
  rule: {
    id: string;
    title: string;
    category: string;
    description: string;
    content: string;
  };
  onBack: () => void;
}

const RuleDetails: React.FC<RuleDetailsProps> = ({ rule, onBack }) => {
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;

  // Функция для рендеринга markdown-подобного контента
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentElement: JSX.Element | null = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('# ')) {
        elements.push(
          <h1 
            key={index} 
            className="text-3xl font-bold mb-4 mt-6"
            style={{ color: currentTheme.accent }}
          >
            {trimmedLine.substring(2)}
          </h1>
        );
      } else if (trimmedLine.startsWith('## ')) {
        elements.push(
          <h2 
            key={index} 
            className="text-2xl font-semibold mb-3 mt-5"
            style={{ color: currentTheme.accent }}
          >
            {trimmedLine.substring(3)}
          </h2>
        );
      } else if (trimmedLine.startsWith('### ')) {
        elements.push(
          <h3 
            key={index} 
            className="text-xl font-medium mb-2 mt-4"
            style={{ color: currentTheme.accent }}
          >
            {trimmedLine.substring(4)}
          </h3>
        );
      } else if (trimmedLine.startsWith('- **') && trimmedLine.includes('**:')) {
        // Обработка пунктов со strong текстом
        const match = trimmedLine.match(/- \*\*(.*?)\*\*: (.*)/);
        if (match) {
          elements.push(
            <div key={index} className="mb-2 ml-4">
              <span 
                className="font-bold"
                style={{ color: currentTheme.accent }}
              >
                {match[1]}
              </span>
              <span style={{ color: currentTheme.textColor }}>: {match[2]}</span>
            </div>
          );
        }
      } else if (trimmedLine.startsWith('- ')) {
        elements.push(
          <div 
            key={index} 
            className="mb-1 ml-4"
            style={{ color: currentTheme.textColor }}
          >
            • {trimmedLine.substring(2)}
          </div>
        );
      } else if (trimmedLine.match(/^\d+\./)) {
        elements.push(
          <div 
            key={index} 
            className="mb-1 ml-4"
            style={{ color: currentTheme.textColor }}
          >
            {trimmedLine}
          </div>
        );
      } else if (trimmedLine === '') {
        elements.push(<br key={index} />);
      } else if (trimmedLine.length > 0) {
        elements.push(
          <p 
            key={index} 
            className="mb-3"
            style={{ color: currentTheme.textColor }}
          >
            {trimmedLine}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          style={{
            borderColor: currentTheme.accent,
            color: currentTheme.accent
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
        
        <div>
          <div 
            className="text-sm font-medium uppercase tracking-wide mb-1"
            style={{ color: currentTheme.accent }}
          >
            {rule.category}
          </div>
          <h1 
            className="text-3xl font-bold"
            style={{ color: currentTheme.accent }}
          >
            {rule.title}
          </h1>
        </div>
      </div>

      {/* Описание */}
      <Card 
        className="p-6"
        style={{ 
          backgroundColor: `${currentTheme.cardBackground}dd`,
          borderColor: currentTheme.borderColor 
        }}
      >
        <p 
          className="text-lg italic"
          style={{ color: currentTheme.textColor }}
        >
          {rule.description}
        </p>
      </Card>

      {/* Основной контент */}
      <Card 
        className="p-6"
        style={{ 
          backgroundColor: `${currentTheme.cardBackground}dd`,
          borderColor: currentTheme.borderColor 
        }}
      >
        <div className="prose prose-lg max-w-none">
          {renderContent(rule.content)}
        </div>
      </Card>
    </div>
  );
};

export default RuleDetails;