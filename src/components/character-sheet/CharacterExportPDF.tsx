
import React from 'react';
import { pdfjs } from 'react-pdf';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { Character, Item, CharacterSpell } from '@/types/character';
import { useToast } from '@/hooks/use-toast';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Styles for PDF document
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { marginBottom: 10 },
  header: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  subheader: { fontSize: 14, marginBottom: 5, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginBottom: 5 },
  column: { flex: 1, marginRight: 10 },
  label: { fontWeight: 'bold', marginRight: 5 },
  text: { marginBottom: 3 },
  table: { width: '100%', marginBottom: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 2, paddingTop: 2 },
  tableHeader: { fontWeight: 'bold', fontSize: 10 },
  tableCell: { flex: 1, fontSize: 10 }
});

// Fix for line 112 and 169 - converting complex objects to strings for display

// For line 112 error - equipment conversion
const getEquipmentList = (character: Character) => {
  if (!character.equipment) return [];
  
  // Check if equipment is an array of Item objects
  if (Array.isArray(character.equipment) && character.equipment.length > 0 && typeof character.equipment[0] !== 'string') {
    // Convert Item[] to string[] for display
    return (character.equipment as Item[]).map(item => 
      typeof item === 'string' ? item : `${item.name} (${item.quantity || 1})`
    );
  }
  
  // Handle old equipment format
  const equipment = character.equipment as { weapons: string[], armor: string, items: string[] };
  const weaponsList = equipment.weapons || [];
  const armorItem = equipment.armor ? [equipment.armor] : [];
  const itemsList = equipment.items || [];
  
  return [...weaponsList, ...armorItem, ...itemsList];
};

// For line 169 error - spells conversion
const getSpellsList = (character: Character) => {
  if (!character.spells) return [];
  
  // Convert CharacterSpell[] to string[] for display
  return character.spells.map(spell => {
    if (typeof spell === 'string') return spell;
    return `${spell.name} (${spell.level === 0 ? 'Заговор' : `${spell.level} уровень`})${spell.prepared ? ' ✓' : ''}`;
  });
};

// Component for character sheet PDF
const CharacterPDF = ({ character }: { character: Character }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header section with basic character info */}
        <View style={styles.section}>
          <Text style={styles.header}>{character.name || 'Безымянный персонаж'}</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.label}>Раса:</Text>
                <Text>{character.race} {character.subrace ? `(${character.subrace})` : ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Класс:</Text>
                <Text>{character.class} {character.subclass ? `(${character.subclass})` : ''}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Предыстория:</Text>
                <Text>{character.background}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.row}>
                <Text style={styles.label}>Уровень:</Text>
                <Text>{character.level}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Опыт:</Text>
                <Text>{character.xp}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Мировоззрение:</Text>
                <Text>{character.alignment}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Ability scores section */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Характеристики</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text>Сила: {character.abilities.STR || character.abilities.strength || character.strength || 10}</Text>
            </View>
            <View style={styles.column}>
              <Text>Ловкость: {character.abilities.DEX || character.abilities.dexterity || character.dexterity || 10}</Text>
            </View>
            <View style={styles.column}>
              <Text>Телосложение: {character.abilities.CON || character.abilities.constitution || character.constitution || 10}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text>Интеллект: {character.abilities.INT || character.abilities.intelligence || character.intelligence || 10}</Text>
            </View>
            <View style={styles.column}>
              <Text>Мудрость: {character.abilities.WIS || character.abilities.wisdom || character.wisdom || 10}</Text>
            </View>
            <View style={styles.column}>
              <Text>Харизма: {character.abilities.CHA || character.abilities.charisma || character.charisma || 10}</Text>
            </View>
          </View>
        </View>
        
        {/* Combat stats */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Боевые характеристики</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text>КД: {character.ac || character.armorClass || 10}</Text>
            </View>
            <View style={styles.column}>
              <Text>Хиты: {character.hp}/{character.maxHp}</Text>
            </View>
            <View style={styles.column}>
              <Text>Инициатива: {character.initiative}</Text>
            </View>
            <View style={styles.column}>
              <Text>Скорость: {character.speed}</Text>
            </View>
          </View>
        </View>
        
        {/* Equipment section */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Снаряжение</Text>
          {getEquipmentList(character).map((item, index) => (
            <Text key={index} style={styles.text}>{item}</Text>
          ))}
        </View>
        
        {/* Proficiencies */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Владения</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Языки:</Text>
              <Text>{character.proficiencies.languages.join(', ')}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Инструменты:</Text>
              <Text>{character.proficiencies.tools.join(', ')}</Text>
            </View>
          </View>
        </View>
        
        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Особенности</Text>
          {character.features.map((feature, index) => (
            <View key={index} style={{ marginBottom: 5 }}>
              <Text style={{ fontWeight: 'bold' }}>{feature.name}</Text>
              <Text>{feature.description}</Text>
            </View>
          ))}
        </View>
        
        {/* Spells */}
        {character.spells && character.spells.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Заклинания</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, { backgroundColor: '#f1f5f9' }]}>
                <Text style={[styles.tableCell, styles.tableHeader]}>Название</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Уровень</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Подготовлено</Text>
              </View>
              {getSpellsList(character).map((spellText, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{spellText}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Notes */}
        {character.notes && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Заметки</Text>
            <Text>{character.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

// Export button component
export const CharacterExportPDF = ({ character }: { character: Character }) => {
  const { toast } = useToast();
  
  const fileName = `${character.name || 'character'}-sheet.pdf`;
  
  const handleExportClick = () => {
    toast({
      title: "Подготовка PDF",
      description: "Создание PDF документа для скачивания...",
    });
  };
  
  return (
    <PDFDownloadLink document={<CharacterPDF character={character} />} fileName={fileName}>
      {({ loading }) => (
        <Button disabled={loading} onClick={handleExportClick}>
          <FileDown className="w-4 h-4 mr-2" />
          {loading ? 'Подготовка PDF...' : 'Экспорт в PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default CharacterExportPDF;
