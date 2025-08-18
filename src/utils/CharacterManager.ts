import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type SlotName = 'head' | 'body' | 'mainHand' | 'offHand' | 'back' | 'misc';

export interface CharacterHandle {
  id: string;
  group: THREE.Group;
  baseModel: THREE.Object3D;
  skeleton?: THREE.Skeleton | null;
  bonesByName?: Record<string, THREE.Bone>;
  slots: Partial<Record<SlotName, THREE.Object3D>>;
}

export class CharacterManager {
  private scene: THREE.Scene;
  private characters = new Map<string, CharacterHandle>();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /** Register character: wrap base model in group */
  addCharacter(id: string, baseModel: THREE.Object3D): CharacterHandle {
    const group = new THREE.Group();
    group.name = `char:${id}`;
    group.userData.characterId = id;
    
    // Clone the base model to avoid issues
    const clonedBase = baseModel.clone();
    clonedBase.position.set(0, 0, 0);
    group.add(clonedBase);

    // Try to find skeleton/bones
    let bonesByName: Record<string, THREE.Bone> | undefined;
    let skeleton: THREE.Skeleton | undefined;
    
    clonedBase.traverse((obj: any) => {
      if (obj.isSkinnedMesh && obj.skeleton) {
        skeleton = obj.skeleton;
        bonesByName = {};
        obj.skeleton.bones.forEach((bone: THREE.Bone) => {
          if (bone.name) {
            bonesByName![bone.name] = bone;
          }
        });
      }
    });

    const handle: CharacterHandle = {
      id,
      group,
      baseModel: clonedBase,
      skeleton: skeleton ?? null,
      bonesByName,
      slots: {}
    };

    this.scene.add(group);
    this.characters.set(id, handle);
    return handle;
  }

  /** Remove character completely */
  removeCharacter(id: string): void {
    const handle = this.characters.get(id);
    if (!handle) return;

    this.scene.remove(handle.group);
    
    // Dispose of geometries and materials
    handle.group.traverse((obj) => {
      if ((obj as any).geometry) {
        (obj as any).geometry.dispose?.();
      }
      if ((obj as any).material) {
        const material = (obj as any).material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose?.());
        } else {
          material.dispose?.();
        }
      }
    });

    this.characters.delete(id);
  }

  /** Find character by any object in the scene */
  findCharacterByObject(obj: THREE.Object3D | null): CharacterHandle | null {
    if (!obj) return null;
    
    let current: THREE.Object3D | null = obj;
    while (current) {
      if (current.userData?.characterId) {
        return this.characters.get(current.userData.characterId) ?? null;
      }
      if (current.name?.startsWith('char:')) {
        const id = current.name.split(':')[1];
        return this.characters.get(id) ?? null;
      }
      current = current.parent;
    }
    return null;
  }

  /** Transform character (move, rotate, scale) */
  transform(id: string, transforms: {
    position?: THREE.Vector3;
    rotationY?: number;
    scale?: number;
  }): void {
    const handle = this.characters.get(id);
    if (!handle) return;

    if (transforms.position) {
      handle.group.position.copy(transforms.position);
    }
    if (transforms.rotationY !== undefined) {
      handle.group.rotation.y = transforms.rotationY;
    }
    if (transforms.scale !== undefined) {
      handle.group.scale.setScalar(transforms.scale);
    }
  }

  /** Equip asset to slot */
  async equipToSlot(
    id: string,
    slot: SlotName,
    assetRoot: THREE.Object3D,
    options?: {
      boneName?: string;
      offset?: THREE.Vector3;
      rotation?: THREE.Euler;
      scale?: number;
      cloneAsset?: boolean;
    }
  ): Promise<void> {
    const handle = this.characters.get(id);
    if (!handle) {
      throw new Error(`Character ${id} not found`);
    }

    const {
      boneName,
      offset,
      rotation,
      scale,
      cloneAsset = true
    } = options || {};

    const asset = cloneAsset ? assetRoot.clone() : assetRoot;
    asset.name = `equip:${slot}`;

    // Determine parent for attachment
    let parent: THREE.Object3D = handle.group;
    
    if (boneName && handle.bonesByName?.[boneName]) {
      parent = handle.bonesByName[boneName];
    } else {
      // Create anchor point if it doesn't exist
      const anchorName = `anchor:${slot}`;
      let anchor = handle.group.getObjectByName(anchorName);
      
      if (!anchor) {
        anchor = new THREE.Object3D();
        anchor.name = anchorName;
        
        // Default positions for different slots
        switch (slot) {
          case 'head':
            anchor.position.set(0, 1.6, 0);
            break;
          case 'back':
            anchor.position.set(0, 1.2, -0.2);
            break;
          case 'mainHand':
            anchor.position.set(0.25, 1.1, 0.1);
            break;
          case 'offHand':
            anchor.position.set(-0.25, 1.1, 0.1);
            break;
          case 'body':
            anchor.position.set(0, 1.0, 0);
            break;
          default:
            anchor.position.set(0, 0.5, 0);
        }
        
        handle.group.add(anchor);
      }
      parent = anchor;
    }

    // Remove existing item in slot
    if (handle.slots[slot]) {
      handle.slots[slot]?.parent?.remove(handle.slots[slot]!);
    }

    // Attach new asset
    parent.add(asset);
    
    if (offset) asset.position.copy(offset);
    if (rotation) asset.rotation.copy(rotation);
    if (scale !== undefined) asset.scale.setScalar(scale);

    handle.slots[slot] = asset;
  }

  /** Remove item from slot */
  unequip(id: string, slot: SlotName): void {
    const handle = this.characters.get(id);
    if (!handle) return;

    const item = handle.slots[slot];
    if (!item) return;

    item.parent?.remove(item);
    handle.slots[slot] = undefined;
  }

  /** Get character handle */
  getHandle(id: string): CharacterHandle | null {
    return this.characters.get(id) ?? null;
  }

  /** List all characters */
  list(): CharacterHandle[] {
    return Array.from(this.characters.values());
  }

  /** Get character by position (for token compatibility) */
  getCharacterAt(position: [number, number, number]): CharacterHandle | null {
    const pos = new THREE.Vector3(...position);
    for (const handle of this.characters.values()) {
      if (handle.group.position.distanceTo(pos) < 0.1) {
        return handle;
      }
    }
    return null;
  }
}