import React, { useMemo, useState } from 'react';
import JSZip from 'jszip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAssetsStore } from '@/stores/assetsStore';
import { convertGltfZipToGlb } from '@/utils/convertGltfZipToGlb';

interface Candidate {
  name: string; // path in zip
  base: string; // basename
  slug: string;
  displayName: string;
  categoryKey: 'monster' | 'character' | 'structure' | 'weapon' | 'armor';
  tagsText: string;
  selected: boolean;
  isGlb: boolean;
}

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9а-яё_-]+/gi, '-')
    .replace(/^-+|-+$/g, '');

const guessCategory = (p: string): Candidate['categoryKey'] => {
  const n = p.toLowerCase();
  if (/(monster|monsters|bestiary|creature|creatures)/.test(n)) return 'monster';
  if (/(character|characters|hero|player|players)/.test(n)) return 'character';
  if (/(structure|structures|building|buildings|props?)/.test(n)) return 'structure';
  if (/(weapon|weapons|sword|axe|bow|staff|gun|blade)/.test(n)) return 'weapon';
  if (/(armor|armour|cloth|robe|helmet|shield|boots|glove)/.test(n)) return 'armor';
  return 'monster';
};

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const InteractiveZipImporter: React.FC = () => {
  const { toast } = useToast();
  const assetsStore = useAssetsStore();
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipObj, setZipObj] = useState<JSZip | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  const hasCandidates = candidates.length > 0;

  const onPickFile = async (f?: File) => {
    if (!f) return;
    setZipFile(f);
    try {
      const zip = await JSZip.loadAsync(f);
      setZipObj(zip);
      const entries = Object.values(zip.files) as any[];
      const list: Candidate[] = [];
      entries.forEach((e: any) => {
        if (e.dir) return;
        const name = String(e.name).replace(/\\/g, '/');
        const low = name.toLowerCase();
        const isGlb = low.endsWith('.glb');
        const isGltf = low.endsWith('.gltf');
        if (!isGlb && !isGltf) return;
        const base = name.split('/').pop() || name;
        const slug = toSlug(base);
        list.push({
          name,
          base,
          slug,
          displayName: titleCase(slug.replace(/-/g, ' ')),
          categoryKey: guessCategory(name),
          tagsText: '',
          selected: true,
          isGlb,
        });
      });
      setCandidates(list);
      toast({ title: 'ZIP загружен', description: `Найдено моделей: ${list.length}` });
    } catch (e: any) {
      toast({ title: 'Ошибка чтения ZIP', description: e?.message || String(e), variant: 'destructive' });
    }
  };

  const ensureCategories = async () => {
    await assetsStore.reloadCategories();
    const keysNeeded: Candidate['categoryKey'][] = ['monster', 'character', 'structure', 'weapon', 'armor'];
    const existing = new Map(assetsStore.categories.map((c) => [c.key, c.id] as const));
    for (const k of keysNeeded) {
      if (!existing.has(k)) {
        try {
          const names = {
            monster: 'Монстры',
            character: 'Персонаж', 
            structure: 'Строения',
            weapon: 'Оружие',
            armor: 'Одежда'
          };
          await assetsStore.addCategory({ key: k, name: names[k] });
        } catch {}
      }
    }
    await assetsStore.reloadCategories();
  };

  const getCategoryId = (key: Candidate['categoryKey']) => {
    const found = assetsStore.categories.find((c) => c.key === key);
    return found?.id || '';
  };

  const uploadBlob = async (path: string, blob: Blob) => {
    const { error } = await supabase.storage.from('models').upload(path, blob, {
      contentType: 'model/gltf-binary',
      cacheControl: '3600',
      upsert: true,
    });
    if (error) throw error;
  };

  const importAll = async () => {
    if (!zipObj || !candidates.length) return;
    setLoading(true);
    try {
      await ensureCategories();

      // Convert all .gltf → .glb once
      const glbResults = await convertGltfZipToGlb(zipObj);
      const glbMap = new Map(glbResults.map((r) => [r.name.replace(/\\/g, '/'), r.blob] as const));

      let ok = 0, failed = 0;
      for (const c of candidates.filter((x) => x.selected)) {
        try {
          const slug = toSlug(c.slug || c.base);
          const folderMap = {
            monster: 'monsters',
            character: 'characters', 
            structure: 'structures',
            weapon: 'weapons',
            armor: 'armor'
          };
          const folder = folderMap[c.categoryKey];
          const targetPath = `${folder}/${slug}/low/model.glb`;

          let blob: Blob | undefined;
          if (c.isGlb) {
            const entry = zipObj.file(c.name);
            if (!entry) throw new Error('Файл не найден в ZIP');
            blob = await entry.async('blob');
          } else {
            const convName = c.name.replace(/\.[a-z0-9]+$/i, '.glb');
            blob = glbMap.get(convName);
            if (!blob) throw new Error('Не удалось сконвертировать .gltf → .glb');
          }

          await uploadBlob(targetPath, blob);

          const categoryId = getCategoryId(c.categoryKey);
          const tags = c.tagsText
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

          await assetsStore.createAsset({
            category_id: categoryId,
            name: c.displayName || slug,
            storage_path: targetPath,
            approved: true,
            tags,
          } as any);

          ok++;
        } catch (e) {
          console.warn('Import failed for', c.name, e);
          failed++;
        }
      }

      toast({ title: 'Импорт завершён', description: `Успех: ${ok}. Ошибки: ${failed}` });
      await assetsStore.reloadAssets();
      setCandidates([]);
      setZipFile(null);
      setZipObj(null);
    } catch (e: any) {
      toast({ title: 'Ошибка импорта', description: e?.message || String(e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="zip">ZIP‑архив с моделями (.glb/.gltf + ресурсы)</Label>
        <Input
          id="zip"
          type="file"
          accept=".zip"
          onChange={(e) => onPickFile(e.target.files?.[0] || undefined)}
        />
      </div>

      {hasCandidates && (
        <Card className="animate-fade-in">
          <CardContent className="p-4 space-y-4">
            <div className="text-sm text-muted-foreground">Выберите категорию, задайте имя/slug и добавьте теги (через запятую). Только отмеченные элементы будут импортированы.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-auto">
              {candidates.map((c, idx) => (
                <div key={c.name} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm truncate" title={c.name}>{c.base}</Label>
                    <label className="text-xs flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={c.selected}
                        onChange={(e) => setCandidates((prev) => prev.map((it, i) => (i === idx ? { ...it, selected: e.target.checked } : it)))}
                      />
                      Импортировать
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Категория</Label>
                      <Select
                        value={c.categoryKey}
                        onValueChange={(val: any) => setCandidates((prev) => prev.map((it, i) => (i === idx ? { ...it, categoryKey: val } : it)))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Категория" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monster">Монстры</SelectItem>
                          <SelectItem value="character">Персонаж</SelectItem>
                          <SelectItem value="structure">Строения</SelectItem>
                          <SelectItem value="weapon">Оружие</SelectItem>
                          <SelectItem value="armor">Одежда</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Имя (отображение)</Label>
                      <Input
                        value={c.displayName}
                        onChange={(e) => setCandidates((prev) => prev.map((it, i) => (i === idx ? { ...it, displayName: e.target.value } : it)))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Slug</Label>
                      <Input
                        value={c.slug}
                        onChange={(e) => setCandidates((prev) => prev.map((it, i) => (i === idx ? { ...it, slug: e.target.value } : it)))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Теги (через запятую)</Label>
                      <Input
                        placeholder="orc, undead, boss"
                        value={c.tagsText}
                        onChange={(e) => setCandidates((prev) => prev.map((it, i) => (i === idx ? { ...it, tagsText: e.target.value } : it)))}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">Целевой путь: { 
                    (() => {
                      const folderMap = { monster: 'monsters', character: 'characters', structure: 'structures', weapon: 'weapons', armor: 'armor' };
                      return folderMap[c.categoryKey] + '/' + toSlug(c.slug || c.base) + '/low/model.glb';
                    })()
                  }</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setCandidates((prev) => prev.map((c) => ({ ...c, selected: true })))} variant="outline" size="sm">Выбрать все</Button>
              <Button onClick={() => setCandidates((prev) => prev.map((c) => ({ ...c, selected: false })))} variant="outline" size="sm">Снять выбор</Button>
              <Button onClick={importAll} disabled={loading}>Импортировать выбранные</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveZipImporter;
