import { supabase } from '@/integrations/supabase/client';

export function cleanStoragePath(p: string): string {
  return p.replace(/^\/+/, '').replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function encodePath(p: string): string {
  return cleanStoragePath(p)
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

export function publicModelUrl(path: string): string {
  const clean = cleanStoragePath(path);
  const { data } = supabase.storage.from('models').getPublicUrl(clean);
  return data.publicUrl;
}
