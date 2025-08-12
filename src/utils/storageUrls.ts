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
  // Build Supabase public URL first
  const { data } = supabase.storage.from('models').getPublicUrl(clean);
  const rawUrl = data.publicUrl;
  // Re-encode only the path part to be safe with spaces and special chars
  try {
    const u = new URL(rawUrl);
    const prefix = '/storage/v1/object/public/models/';
    const idx = u.pathname.indexOf(prefix);
    if (idx !== -1) {
      const base = u.origin + u.pathname.slice(0, idx + prefix.length);
      const rest = u.pathname.slice(idx + prefix.length);
      const encoded = encodePath(rest);
      return base + encoded + (u.search || '');
    }
    return encodeURI(rawUrl);
  } catch {
    return encodeURI(rawUrl);
  }
}
