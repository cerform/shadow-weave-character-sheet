declare module 'three/examples/jsm/loaders/FBXLoader' {
  import { Loader } from 'three';
  import { Group } from 'three';
  export class FBXLoader extends Loader {
    load(
      url: string,
      onLoad: (object: Group) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(data: ArrayBuffer | string, path: string): Group;
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import { Loader, LoadingManager } from 'three';
  import { Group, AnimationClip } from 'three';
  export interface GLTF {
    scene: Group;
    scenes: Group[];
    animations: AnimationClip[];
  }
  export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(
      data: ArrayBuffer | string,
      path: string,
      onLoad: (gltf: GLTF) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    setResourcePath(path: string): this;
  }
}

declare module 'three/examples/jsm/exporters/GLTFExporter' {
  export interface GLTFExporterOptions {
    binary?: boolean;
    trs?: boolean;
    onlyVisible?: boolean;
    truncateDrawRange?: boolean;
    embedImages?: boolean;
    maxTextureSize?: number;
    animations?: any[];
    includeCustomExtensions?: boolean;
  }
  export class GLTFExporter {
    parse(
      input: any,
      onCompleted: (gltf: ArrayBuffer | object) => void,
      onError?: (error: any) => void,
      options?: GLTFExporterOptions
    ): void;
  }
}

declare module 'three/examples/jsm/loaders/DRACOLoader' {
  export class DRACOLoader {
    setDecoderPath(path: string): this;
    setDecoderConfig(config: Record<string, any>): this;
    dispose(): void;
  }
}

