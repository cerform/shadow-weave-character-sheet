import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Open5eMonster {
  slug: string;
  name: string;
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armor_class: number;
  armor_desc?: string;
  hit_points: number;
  hit_dice: string;
  speed: Record<string, number>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  challenge_rating: string;
  cr: number;
  actions?: Array<{
    name: string;
    desc: string;
    attack_bonus?: number;
    damage_dice?: string;
  }>;
  special_abilities?: Array<{
    name: string;
    desc: string;
  }>;
  legendary_actions?: Array<{
    name: string;
    desc: string;
  }>;
  skills?: Record<string, number>;
  damage_resistances?: string;
  damage_immunities?: string;
  damage_vulnerabilities?: string;
  condition_immunities?: string;
  senses?: string;
  languages?: string;
  desc?: string;
}

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

const Open5eImporter: React.FC = () => {
  const [jsonData, setJsonData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const parseOpen5eData = (data: any): Open5eMonster[] => {
    // Если это объект с results массивом (как в API response)
    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }
    // Если это массив монстров
    if (Array.isArray(data)) {
      return data;
    }
    // Если это один монстр
    if (data.slug && data.name) {
      return [data];
    }
    throw new Error('Неверный формат JSON данных');
  };

  const convertToSupabaseFormat = (monster: Open5eMonster) => {
    // Маппинг размеров
    const sizeMap: Record<string, string> = {
      'tiny': 'Tiny',
      'small': 'Small', 
      'medium': 'Medium',
      'large': 'Large',
      'huge': 'Huge',
      'gargantuan': 'Gargantuan'
    };

    // Маппинг типов
    const typeMap: Record<string, string> = {
      'aberration': 'aberration',
      'beast': 'beast',
      'celestial': 'celestial',
      'construct': 'construct',
      'dragon': 'dragon',
      'elemental': 'elemental',
      'fey': 'fey',
      'fiend': 'fiend',
      'giant': 'giant',
      'humanoid': 'humanoid',
      'monstrosity': 'monstrosity',
      'ooze': 'ooze',
      'plant': 'plant',
      'undead': 'undead'
    };

    return {
      name: monster.name,
      slug: monster.slug,
      type: typeMap[monster.type.toLowerCase()] || 'monstrosity',
      size: sizeMap[monster.size.toLowerCase()] || 'Medium',
      alignment: monster.alignment || 'neutral',
      armor_class: monster.armor_class || 10,
      hit_points: monster.hit_points || 1,
      hit_dice: monster.hit_dice || '1d8',
      speed: monster.speed || { walk: 30 },
      stats: {
        str: monster.strength || 10,
        dex: monster.dexterity || 10,
        con: monster.constitution || 10,
        int: monster.intelligence || 10,
        wis: monster.wisdom || 10,
        cha: monster.charisma || 10
      },
      cr: monster.cr || 0,
      skills: monster.skills || {},
      senses: monster.senses ? { description: monster.senses } : {},
      languages: monster.languages || '',
      actions: monster.actions || [],
      traits: monster.special_abilities || [],
      legendary_actions: monster.legendary_actions || [],
      meta: {
        source: 'Open5e Import',
        description: monster.desc || '',
        damage_resistances: monster.damage_resistances || '',
        damage_immunities: monster.damage_immunities || '',
        damage_vulnerabilities: monster.damage_vulnerabilities || '',
        condition_immunities: monster.condition_immunities || ''
      }
    };
  };

  const importMonsters = async () => {
    if (!jsonData.trim()) {
      setResult({ success: 0, errors: ['JSON данные не введены'], total: 0 });
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setResult(null);

    const errors: string[] = [];
    let success = 0;

    try {
      const parsed = JSON.parse(jsonData);
      const monsters = parseOpen5eData(parsed);
      const total = monsters.length;

      console.log(`Импортируем ${total} монстров из Open5e JSON`);

      for (let i = 0; i < monsters.length; i++) {
        const monster = monsters[i];
        
        try {
          const converted = convertToSupabaseFormat(monster);
          
          const { error } = await supabase
            .from('srd_creatures')
            .upsert(converted, { 
              onConflict: 'slug',
              ignoreDuplicates: false 
            });

          if (error) {
            errors.push(`${monster.name}: ${error.message}`);
          } else {
            success++;
          }
        } catch (err) {
          errors.push(`${monster.name}: Ошибка конвертации - ${err}`);
        }

        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setResult({ success, errors, total });
      
    } catch (err) {
      setResult({ 
        success: 0, 
        errors: [`Ошибка парсинга JSON: ${err}`], 
        total: 0 
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonData(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Импорт из Open5e JSON
        </CardTitle>
        <CardDescription>
          Импортируйте монстров из JSON формата Open5e API или загрузите JSON файл
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Загрузить JSON файл:</label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Или вставьте JSON данные:</label>
          <Textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder={`Вставьте JSON данные в формате Open5e API, например:
{
  "count": 3207,
  "results": [
    {
      "slug": "monster-slug",
      "name": "Monster Name",
      "size": "Medium",
      "type": "Beast",
      ...
    }
  ]
}

Или массив монстров:
[
  {
    "slug": "monster-slug",
    "name": "Monster Name",
    ...
  }
]`}
            className="min-h-[200px] font-mono text-xs"
          />
        </div>

        {isImporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Импорт в процессе...</span>
              <span className="text-sm">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {result && (
          <Alert className={result.errors.length > 0 ? "border-yellow-500" : "border-green-500"}>
            <div className="flex items-center gap-2">
              {result.errors.length === 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <AlertDescription>
                <div className="space-y-1">
                  <p>
                    <strong>Импорт завершен:</strong> {result.success} из {result.total} монстров успешно импортированы
                  </p>
                  {result.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">
                        Показать ошибки ({result.errors.length})
                      </summary>
                      <div className="mt-2 max-h-32 overflow-y-auto">
                        {result.errors.map((error, index) => (
                          <div key={index} className="text-xs text-red-600 font-mono">
                            {error}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </div>
          </Alert>
        )}

        <Button 
          onClick={importMonsters}
          disabled={isImporting || !jsonData.trim()}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isImporting ? 'Импорт...' : 'Импортировать монстров'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Open5eImporter;