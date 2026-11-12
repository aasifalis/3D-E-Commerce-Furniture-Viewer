# 3D model credits

All models are free for any use, including commercial.

| File | Product | Source | Licence |
|---|---|---|---|
| `sofa.glb` | Camden Corner Sofa | `loungeSofaCorner`, [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit) | CC0 1.0 |
| `armchair.glb` | Evesham Armchair | [Sheen Chair](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenChair) by Wayfair LLC (Khronos glTF Sample Assets) | CC0 1.0 |
| `bed.glb` | Ashford King Bed Frame | `bedDouble`, Kenney Furniture Kit | CC0 1.0 |
| `wardrobe.glb` | Hadley Double Wardrobe | `bookcaseClosedDoors`, Kenney Furniture Kit | CC0 1.0 |
| `bookcase.glb` | Kenilworth Bookcase | `bookcaseOpen`, Kenney Furniture Kit | CC0 1.0 |
| `table.glb` | Stratford Dining Table | `table`, Kenney Furniture Kit | CC0 1.0 |
| `tvunit.glb` | Clifton TV Unit | `cabinetTelevision`, Kenney Furniture Kit | CC0 1.0 |
| `drawers.glb` | Marlowe Chest of Drawers | Modelled for Roomi with three.js | CC0 1.0 |

[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) means public domain: no attribution required, though it is given here.

## Changes made

- **Kenney models** are rescaled to each product's catalogue dimensions (`data/products.json`), centred with the base at y = 0, and switched from unlit to standard PBR materials so they respond to light.
- The material the colour swatches change is named `finish` (wood or paint) or `fabric…` (upholstery). `js/viewer.js` recolours any material whose name starts with either word.
- **armchair.glb** is used unmodified (about 83 W × 57 D × 69 H cm). Its fabric uses `KHR_materials_sheen` for a velvet look.

Units are metres, Y-up.

## Product photos

`assets/images/*.jpg` are rendered from these models, one per product colour (`<name>-<colour>.jpg`), plus `<name>.jpg` for the default colour. They are covered by the same CC0 licence.
