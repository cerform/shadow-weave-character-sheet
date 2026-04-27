/**
 * Utilities for sanitizing Character data before Supabase writes.
 *
 * These were previously defined inline in CharacterCreationPage.tsx
 * and have been extracted here so they can be reused across services.
 */

/**
 * Returns true if the object (deeply) contains any `undefined` value.
 * Used to detect upstream data corruption from spell components.
 */
export function hasUndefinedValues(obj: unknown, path = ''): boolean {
  if (obj === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[cleanUndefinedValues] undefined found at: ${path || 'root'}`);
    }
    return true;
  }

  if (obj === null || typeof obj !== 'object') return false;

  if (Array.isArray(obj)) {
    return obj.some((item, index) =>
      hasUndefinedValues(item, `${path}[${index}]`)
    );
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (hasUndefinedValues(value, path ? `${path}.${key}` : key)) return true;
  }

  return false;
}

/**
 * Recursively strips `undefined` values from an object.
 * Spell component flags that arrive as `{_type: "undefined"}` objects
 * are resolved against the spell's components string.
 */
export function cleanUndefinedValues<T>(obj: T): T {
  if (obj === undefined || obj === null || typeof obj !== 'object') {
    return (obj === undefined ? null : obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanUndefinedValues(item)) as unknown as T;
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value === undefined) continue; // strip

    if (key === 'spells' && Array.isArray(value)) {
      // Special handling: fix spell component flags stored as objects
      cleaned[key] = value.map((spell: Record<string, unknown>) => {
        const s = { ...spell };
        const components = typeof s.components === 'string' ? s.components : '';
        if (s.verbal && typeof s.verbal === 'object') {
          s.verbal = components.includes('V') || components.includes('В');
        }
        if (s.somatic && typeof s.somatic === 'object') {
          s.somatic = components.includes('S') || components.includes('С');
        }
        if (s.material && typeof s.material === 'object') {
          s.material = components.includes('M') || components.includes('М');
        }
        return cleanUndefinedValues(s);
      });
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = cleanUndefinedValues(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}
