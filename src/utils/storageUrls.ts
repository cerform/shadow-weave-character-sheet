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
  const encoded = encodePath(path);
  const { data } = supabase.storage.from('models').getPublicUrl(encoded);
  return data.publicUrl;
}
