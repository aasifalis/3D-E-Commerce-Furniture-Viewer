# Roomi 
### A furniture e-commerce web app with 3D viewing and Augmented Reality placement

---

## The Problem

Working as a sales assistant in a furniture retail environment, I noticed a recurring frustration — customers would regularly ask about sofas, beds, wardrobes and other large items that weren't on the shop floor. With such a large product catalogue, it simply isn't feasible to display every item in store.

This creates two problems for the customer:

1. **Scale** — it's difficult to know whether a sofa or wardrobe will actually fit in their space just from looking at a photo online or in a brochure
2. **Aesthetic** — customers can't tell whether a piece will match their existing décor, flooring, or colour scheme until it's already in their home

This often leads to hesitation, abandoned purchases, or worse — returns after delivery, which typically are reduced and much harder to sell and takes up more valuable store space.

**Roomi** is my proposed solution: a web app where customers can browse the full product catalogue, add items to a basket, view them as interactive 3D models, and — most importantly — place them into their actual living space using Augmented Reality via their phone's camera. No app download required.

---

## Features

- **Product browsing** — filterable catalogue of large furniture items loaded dynamically from a JSON data source, mirroring how a real product API would work
- **Basket** — add and remove items with a running total, persisted in `localStorage` so it survives page refreshes
- **3D viewer** — rotate, zoom and inspect any basket item as a full 3D model using Three.js
- **AR placement** — place furniture into your real room using your phone camera via the WebXR API, to check scale and how it looks in your actual space
- **iOS fallback** — Apple Quick Look support for iPhone users, since WebXR is currently Android/Chrome only

---

## Tech Stack

| Technology | Usage |
|---|---|
| HTML, CSS, JavaScript | Core frontend — no frameworks |
| Three.js | 3D model rendering and orbit controls |
| GLTFLoader | Loading `.glb` 3D model files |
| WebXR API | Augmented reality hit-test and surface detection |
| localStorage | Basket state persistence |
| Docker + Nginx | Local development and containerised deployment |
| Vercel | Live deployment via GitHub CI/CD |

This stack was chosen deliberately to reflect a TypeScript/React/Node/AWS environment — the vanilla JS foundation translates directly to those frameworks, and the Docker setup mirrors how a production frontend would be containerised and deployed.

---

## Project Structure

```
furnish/
├── index.html          # Product browse page
├── basket.html         # Basket page
├── viewer.html         # 3D + AR viewer
├── css/
│   ├── style.css       # Global styles and variables
│   ├── products.css    # Product grid and cards
│   ├── basket.css      # Basket layout
│   └── viewer.css      # 3D viewer and AR button
├── js/
│   ├── utils.js        # Shared helper functions
│   ├── products.js     # Fetches data, renders product grid
│   ├── basket.js       # Add/remove/total logic
│   ├── viewer.js       # Three.js scene and GLTFLoader
│   └── ar.js           # WebXR hit-test and AR placement
├── data/
│   └── products.json   # Mock product catalogue (API-ready structure)
├── assets/
│   ├── models/         # .glb 3D model files
│   └── images/         # Product thumbnails
├── docker/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Run locally with Docker

```bash
git clone https://github.com/yourusername/roomi.git
cd roomi
docker compose up --build
```

Then open [http://localhost:8080](http://localhost:8080)

### Run locally without Docker

```bash
cd roomi
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000)

> You must use a local server rather than opening `index.html` directly — the browser blocks `fetch()` requests on the `file://` protocol.

---

## AR Support

| Platform | Support | How |
|---|---|---|
| Android (Chrome) | ✅ Full WebXR | Hit-test surface detection, tap to place |
| iOS (Safari) | ⚠️ Partial | Apple Quick Look via `.usdz` fallback |
| Desktop | ❌ Not supported | 3D viewer only |

The app detects the device and shows the appropriate experience automatically.

---

## How the AR Works

1. User taps **View in AR** on a basket item
2. Browser requests camera permission via the WebXR API
3. The live camera feed fills the screen
4. WebXR's hit-test feature casts a ray each frame to detect flat surfaces (floor, table)
5. A reticle appears on the detected surface showing where the item will be placed
6. User taps to place the 3D model — it appears anchored in their real space
7. They can walk around it and view it from any angle

---

## What a Real Integration Would Look Like

The product data currently lives in `data/products.json`. In a production environment this would be replaced with a single line change in `products.js`:

```js
// Current (mock)
const response = await fetch('data/products.json')

// Production
const response = await fetch('https://api.roomi.com/v1/products')
```

The rest of the application requires no changes — the data layer is intentionally separated from the UI logic for exactly this reason.

---

## Future Improvements

- Migrate to **TypeScript** for type safety across the product and basket data structures
- Rebuild the UI as **React components** — each product card and the basket are natural candidates
- Add a **Node.js/Express backend** to serve products from a real database
- Deploy to **AWS ECS** using the existing Dockerfile for production-grade cloud hosting
- Add **unit tests** for the basket logic using Jest

---

## 3D Models

Free furniture models sourced from [Kenney.nl](https://kenney.nl) (CC0 licence — free for any use). Alternatively [Market.pmnd.rs](https://market.pmnd.rs) has a large library of free `.glb` models.

---

*Built as a portfolio project. Inspired by the real-world problem of large furniture retailers being unable to display their full catalogue in store.*
