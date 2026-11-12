# 3D model credits

| File | Product | Source | Licence |
|---|---|---|---|
| `sofa.glb` | Camden Curved Velvet Sofa | [GlamVelvetSofa](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlamVelvetSofa) by Eric Chadwick, © 2021 Wayfair LLC | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (attribution required) |
| `armchair.glb` | Evesham Accent Chair | [SheenChair](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenChair), Wayfair LLC | CC0 1.0 |
| `bed.glb` | Ashford Four-Poster Bed | [Gothic Bed 01](https://polyhaven.com/a/GothicBed_01), Poly Haven | CC0 1.0 |
| `dresser.glb` | Hadley Glazed Dresser | [Vintage Cabinet 01](https://polyhaven.com/a/vintage_cabinet_01), Poly Haven | CC0 1.0 |
| `drawers.glb` | Marlowe Chest of Drawers | [Gothic Commode 01](https://polyhaven.com/a/GothicCommode_01), Poly Haven | CC0 1.0 |
| `table.glb` | Stratford Trestle Dining Table | [Painted Wooden Table](https://polyhaven.com/a/painted_wooden_table), Poly Haven | CC0 1.0 |
| `bookcase.glb` | Kenilworth Bookcase | [Shelf 01](https://polyhaven.com/a/Shelf_01), Poly Haven | CC0 1.0 |
| `media-unit.glb` | Clifton Media Unit | [Modern Wooden Cabinet](https://polyhaven.com/a/modern_wooden_cabinet), Poly Haven | CC0 1.0 |

[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) means public domain: free for any use, with no attribution required.

## Changes made

- Converted to single `.glb` files with 1K textures, Draco compression removed (so no extra decoder download), and embedded lights removed. Each model sits on the floor (y = 0) at real-world size in metres.
- `table.glb` was scaled down uniformly to a 76 cm dining height. The others are at their original size, and `data/products.json` lists their measured dimensions.
- The material that changes colour is named `finish` (or `finish_a` / `finish_b`).

## Colours

- **Sofa:** uses the model's built-in colour variants (`KHR_materials_variants`).
- **Wood and painted pieces:** each catalogue colour has its own texture in `textures/`, made from the original texture. Stains keep the wood grain; paints keep a faint grain under a flat colour. Bed linen, glass, black legs and metal fittings are masked out so they keep their own colours.
- **Armchair:** the velvet colour and sheen are tinted directly.

## Product photos

`assets/images/*.jpg` are studio renders of these models (Three.js, 800 × 600), one per catalogue colour (`<model>-<colour>.jpg`), plus `<model>.jpg` for the default colour.
