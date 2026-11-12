# 3D model credits

| File | Product | Source model | Author | Licence |
|---|---|---|---|---|
| `sofa.glb` | Camden Corner Sofa | `loungeSofaCorner` from the Furniture Kit | [Kenney](https://kenney.nl/assets/furniture-kit) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `armchair.glb` | Evesham Armchair | [Sheen Chair](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenChair) (Khronos glTF Sample Assets) | Wayfair LLC | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |

## Changes made

- **sofa.glb** — rescaled to the catalogue dimensions (260 W × 160 D × 88 H cm), centred with its base at y = 0, fabric recoloured to Warm Grey (`#8B8B84`), and the unlit material swapped for a standard PBR material so it responds to scene lighting.
- **armchair.glb** — used unmodified (≈ 83 W × 57 D × 69 H cm, base at y = 0). It includes `KHR_materials_sheen` for a velvet look and `KHR_materials_variants` with alternative fabric colours.

Units are metres, Y-up, as expected by Three.js `GLTFLoader` and WebXR.
