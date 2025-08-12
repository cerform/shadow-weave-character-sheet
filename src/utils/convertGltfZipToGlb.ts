import JSZip from 'jszip';
import { LoadingManager, Scene } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

export interface GlbResult {
  name: string;
  blob: Blob;
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

function dirname(p: string): string {
  const n = normalizePath(p);
  const idx = n.lastIndexOf('/');
  return idx >= 0 ? n.slice(0, idx) : '';
}

function resolveRelative(baseDir: string, rel: string): string {
  // If already absolute (has protocol), return as-is
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

function changeExt(p: string, ext: string): string {
  const idx = p.lastIndexOf('.');
  return (idx >= 0 ? p.slice(0, idx) : p) + '.' + ext;
}

export async function convertGltfZipToGlb(zip: JSZip): Promise<GlbResult[]> {
  // Build in-memory file map
  const entries = Object.values(zip.files) as any[];
  const fileBlobs = new Map<string, Blob>();

  // Preload all blobs for quick lookup
  await Promise.all(
    entries.map(async (entry: any) => {
      if (entry.dir) return;
      const norm = normalizePath(String(entry.name));
      const blob = await entry.async('blob');
      fileBlobs.set(norm, blob);
    })
  );

  const gltfPaths = [...fileBlobs.keys()].filter((p) => p.toLowerCase().endsWith('.gltf'));
  const results: GlbResult[] = [];

  for (const gltfPath of gltfPaths) {
    const gltfFile = zip.file(gltfPath);
    if (!gltfFile) continue;
    const gltfText = await gltfFile.async('text');

    // Intercept resource URLs to serve from zip blobs
    const manager = new LoadingManager();
    const urlObjectUrls = new Map<string, string>();
    manager.setURLModifier((url) => {
      // Resolve relative to the .gltf file's folder
      const resolved = resolveRelative(dirname(gltfPath), url);
      const blob = fileBlobs.get(resolved) || fileBlobs.get(normalizePath(url));
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        urlObjectUrls.set(resolved, objectUrl);
        return objectUrl;
      }
      return url; // fallback
    });

    const loader = new GLTFLoader(manager);
    const gltf: any = await new Promise((resolve, reject) => {
      // parse accepts string for .gltf JSON
      loader.parse(gltfText, '', resolve, reject);
    });

    const scene: Scene = gltf.scene || (gltf.scenes && gltf.scenes[0]);
    if (!scene) continue;

    const exporter = new GLTFExporter();
    const arrayBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
      exporter.parse(
        scene,
        (res) => resolve(res as ArrayBuffer),
        (err) => reject(err),
        { binary: true, includeCustomExtensions: true }
      );
    });

    const glbBlob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
    const outName = changeExt(gltfPath, 'glb');
    results.push({ name: outName, blob: glbBlob });

    // Cleanup object URLs
    urlObjectUrls.forEach((objUrl) => URL.revokeObjectURL(objUrl));
  }

  return results;
}
