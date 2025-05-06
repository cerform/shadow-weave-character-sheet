
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Character, Item } from '@/types/character';

interface CharacterExportPDFProps {
  character: Character;
}

const CharacterExportPDF: React.FC<CharacterExportPDFProps> = ({ character }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async () => {
    if (!character) return;
    
    setIsExporting(true);
    
    try {
      // Lazy load jsPDF to reduce initial load time
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      let yPosition = 55; // Начальная позиция по Y
      
      // Add character name as title
      doc.setFontSize(20);
      doc.text(character.name || 'Безымянный герой', 14, 22);
      
      // Add basic info
      doc.setFontSize(12);
      doc.text(`${character.race || ''} ${character.subrace ? `(${character.subrace})` : ''}`, 14, 30);
      doc.text(`${character.class || ''} ${character.level || 1}`, 14, 36);
      doc.text(`Предыстория: ${character.background || 'Нет'}`, 14, 42);
      doc.text(`Мировоззрение: ${character.alignment || 'Нет'}`, 14, 48);
      
      // Add stats table
      autoTable(doc, {
        startY: yPosition,
        head: [['СИЛ', 'ЛВК', 'ТЕЛ', 'ИНТ', 'МДР', 'ХАР']],
        body: [[
          character.strength || 10,
          character.dexterity || 10,
          character.constitution || 10, 
          character.intelligence || 10,
          character.wisdom || 10,
          character.charisma || 10
        ]],
      });
      
      // Update position after table
      yPosition = (doc as any).lastAutoTable.finalY + 10;
      
      // Add combat stats
      autoTable(doc, {
        startY: yPosition,
        head: [['КД', 'Инициатива', 'Скорость', 'Текущие ХП', 'Макс. ХП']],
        body: [[
          character.armorClass || 10,
          character.initiative !== undefined ? character.initiative : '+0',
          character.speed || '30 фт',
          character.currentHp || 0,
          character.maxHp || 0
        ]],
      });
      
      // Update position after table
      yPosition = (doc as any).lastAutoTable.finalY + 10;
      
      // Add skills if available
      if (character.skills && typeof character.skills === 'object' && Object.keys(character.skills).length > 0) {
        const skillRows = Object.entries(character.skills).map(([name, value]) => {
          let displayValue = '';
          
          if (typeof value === 'number') {
            displayValue = value >= 0 ? `+${value}` : `${value}`;
          } else if (typeof value === 'object' && value !== null) {
            if ('bonus' in value && value.bonus !== undefined) {
              const bonus = value.bonus;
              displayValue = typeof bonus === 'number' && bonus >= 0 ? `+${bonus}` : `${bonus}`;
            } else if ('value' in value && value.value !== undefined) {
              const val = value.value;
              displayValue = typeof val === 'number' && val >= 0 ? `+${val}` : `${val}`;
            }
          }
          
          return [name, displayValue];
        });
        
        if (skillRows.length > 0) {
          autoTable(doc, {
            startY: yPosition,
            head: [['Навык', 'Модификатор']],
            body: skillRows,
          });
          
          // Update position after table
          yPosition = (doc as any).lastAutoTable.finalY + 10;
        }
      }
      
      // Add equipment
      const processedEquipment: string[] = [];
      
      if (character.equipment) {
        if (Array.isArray(character.equipment)) {
          if (character.equipment.length > 0) {
            if (typeof character.equipment[0] === 'string') {
              processedEquipment.push(...character.equipment as string[]);
            } else {
              // Если это массив объектов Item
              processedEquipment.push(...(character.equipment as Item[]).map(item => 
                `${item.name} (${item.quantity})`
              ));
            }
          }
        } else {
          // Если это объект с оружием, броней и предметами
          const equipment = character.equipment as { weapons?: string[], armor?: string, items?: string[] };
          if (equipment.weapons && equipment.weapons.length > 0) {
            processedEquipment.push(`Оружие: ${equipment.weapons.join(', ')}`);
          }
          if (equipment.armor) {
            processedEquipment.push(`Броня: ${equipment.armor}`);
          }
          if (equipment.items && equipment.items.length > 0) {
            processedEquipment.push(`Предметы: ${equipment.items.join(', ')}`);
          }
        }
      }
      
      if (processedEquipment.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Снаряжение']],
          body: processedEquipment.map(item => [item]),
        });
        
        // Update position after table
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Add features
      if (character.features && character.features.length > 0) {
        const featuresArray = Array.isArray(character.features) 
          ? (typeof character.features[0] === 'string' 
              ? character.features 
              : (character.features as any[]).map(f => f.name || f.toString()))
          : [];
          
        autoTable(doc, {
          startY: yPosition,
          head: [['Особенности и черты']],
          body: featuresArray.map(feature => [feature]),
        });
        
        // Update position after table
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Add spells
      if (character.spells && character.spells.length > 0) {
        const spellsArray = Array.isArray(character.spells)
          ? (typeof character.spells[0] === 'string'
              ? character.spells as string[]
              : (character.spells as any[]).map(s => s.name || s.toString()))
          : [];
            
        autoTable(doc, {
          startY: yPosition,
          head: [['Заклинания']],
          body: spellsArray.map(spell => [spell]),
        });
        
        // Update position after table
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Add notes if available
      if (character.notes) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Заметки']],
          body: [[character.notes]],
        });
      }
      
      // Save PDF
      doc.save(`${character.name || 'character'}.pdf`);
      
      toast({
        title: "PDF создан",
        description: "Персонаж успешно экспортирован в PDF."
      });
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось создать PDF. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      variant="outline"
      size="sm"
      disabled={isExporting}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isExporting ? "Создание PDF..." : "Экспорт в PDF"}
    </Button>
  );
};

export default CharacterExportPDF;
