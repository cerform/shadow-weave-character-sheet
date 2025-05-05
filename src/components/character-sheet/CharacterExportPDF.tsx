
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';

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
        startY: 55,
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
      
      // Add combat stats
      autoTable(doc, {
        startY: 75,
        head: [['КД', 'Инициатива', 'Скорость', 'Текущие ХП', 'Макс. ХП']],
        body: [[
          character.armorClass || 10,
          character.initiative || '+0',
          character.speed || '30 фт',
          character.currentHp || 0,
          character.maxHp || 0
        ]],
      });
      
      // Add skills if available
      if (character.skills && typeof character.skills === 'object' && Object.keys(character.skills).length > 0) {
        const skillRows = Object.entries(character.skills).map(([name, value]) => {
          let displayValue = '';
          
          if (typeof value === 'number') {
            displayValue = value >= 0 ? `+${value}` : `${value}`;
          } else if (typeof value === 'object' && value !== null && 'bonus' in value) {
            const bonus = value.bonus || 0;
            displayValue = bonus >= 0 ? `+${bonus}` : `${bonus}`;
          }
          
          return [name, displayValue];
        });
        
        if (skillRows.length > 0) {
          autoTable(doc, {
            startY: 95,
            head: [['Навык', 'Модификатор']],
            body: skillRows,
          });
        }
      }
      
      // Add equipment
      let equipmentList: string[] = [];
      
      if (character.equipment) {
        if (Array.isArray(character.equipment)) {
          equipmentList = character.equipment;
        } else if (typeof character.equipment === 'object') {
          if (character.equipment.weapons) equipmentList = equipmentList.concat(character.equipment.weapons);
          if (character.equipment.armor) equipmentList.push(character.equipment.armor);
          if (character.equipment.items) equipmentList = equipmentList.concat(character.equipment.items);
        }
      }
      
      if (equipmentList.length > 0) {
        autoTable(doc, {
          startY: doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 130,
          head: [['Снаряжение']],
          body: equipmentList.map(item => [item]),
        });
      }
      
      // Add features
      if (character.features && character.features.length > 0) {
        autoTable(doc, {
          startY: doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 150,
          head: [['Особенности и черты']],
          body: character.features.map(feature => [feature]),
        });
      }
      
      // Add spells
      if (character.spells && character.spells.length > 0) {
        autoTable(doc, {
          startY: doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 170,
          head: [['Заклинания']],
          body: character.spells.map(spell => [
            typeof spell === 'string' ? spell : spell.name
          ]),
        });
      }
      
      // Add notes if available
      if (character.notes) {
        autoTable(doc, {
          startY: doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 190,
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
