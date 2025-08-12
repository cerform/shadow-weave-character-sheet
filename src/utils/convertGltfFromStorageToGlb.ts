import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { convertGltfZipToGlb, GlbResult } from './convertGltfZipToGlb';

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

function dirname(p: string): string {
  const n = normalizePath(p);
  const idx = n.lastIndexOf('/');
  return idx >= 0 ? n.slice(0, idx) : '';
}

function resolveRelative(baseDir: string, rel: string): string {
  if (/^[a-zA-Z]+:\/\//.test(rel)) return rel;
  const parts = normalizePath((baseDir ? baseDir + '/' : '') + rel).split('/');
  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return stack.join('/');
}

function isDataUri(u: string): boolean {
  return /^data:/.test(u);
}

export async function convertGltfFromStorageToGlb(storagePath: string): Promise<GlbResult | null> {
  const baseDir = dirname(storagePath);
  const gltfUrl = supabase.storage.from('models').getPublicUrl(storagePath).data.publicUrl;

  // Fetch glTF JSON
  const res = await fetch(gltfUrl);
  if (!res.ok) throw new Error(`Не удалось загрузить ${storagePath}`);
  const gltfText = await res.text();

  let json: any;
  try { json = JSON.parse(gltfText); } catch { throw new Error('Некорректный формат glTF JSON'); }

  const deps: string[] = [];
  if (Array.isArray(json.buffers)) {
    json.buffers.forEach((b: any) => b?.uri && deps.push(String(b.uri)));
  }
  if (Array.isArray(json.images)) {
    json.images.forEach((img: any) => img?.uri && deps.push(String(img.uri)));
  }

  const zip = new JSZip();
  // Put the glTF itself under the same path
  zip.file(storagePath, gltfText);

  // Download and add external deps preserving relative paths
  for (const dep of deps) {
    if (isDataUri(dep)) continue;
    const depPath = resolveRelative(baseDir, dep);
    const depUrl = supabase.storage.from('models').getPublicUrl(depPath).data.publicUrl;
    const r = await fetch(depUrl);
    if (!r.ok) throw new Error(`Не найден ресурс: ${dep}`);
    const blob = await r.blob();
    zip.file(depPath, blob);
  }

  const glbs = await convertGltfZipToGlb(zip);
  return glbs[0] || null;
}
