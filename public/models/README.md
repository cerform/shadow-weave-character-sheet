# 3D Models Information

## Downloaded 3D Models

This project uses free 3D models for D&D characters and monsters:

### Player Characters
- **Human Fighter/Wizard**: `human-fighter.glb` - Generic humanoid character model
  - Used for: Player characters, NPCs
  - Source: Khronos Group glTF Sample Models

### Monsters
- **Goblin**: `creature.glb` - Abstract creature model 
  - Used for: Small monsters like goblins
  - Source: Khronos Group glTF Sample Models

- **Orc/Golem**: `robot.glb` - Robotic character model
  - Used for: Medium/large creatures like orcs and golems
  - Source: Three.js examples

- **Dragon/Wolf**: `duck.glb` - Simple duck model (fantasy interpretation)
  - Used for: Various creatures with different scales
  - Source: Khronos Group glTF Sample Models

## Model Usage
- All models are stored in `/public/models/` directory
- Models are automatically preloaded when entering 3D battle map
- Each monster type has configurable scale, color, and stats
- Models support real-time dragging and positioning

## Adding New Models
To add new 3D models:
1. Place `.glb` files in `/public/models/`
2. Update `src/data/monsterTypes.ts` with new model paths
3. Add type definitions if needed

## License
All models used are free and open source from verified sources like Khronos Group and Three.js examples.