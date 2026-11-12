# Roomi

**See furniture in your own room before you buy it.**

## The problem

Working as a sales assistant in a furniture store, I saw returned sofas, beds and wardrobes pile up in the stockroom. Very often the reason was simple: **the colour didn't suit the room**, or the piece was bigger than expected. A returned item is usually sold at a discount, costs money to collect and handle, and takes up valuable floor space.

Roomi lets shoppers check colour and size in their real room, using their phone's camera, before they order. No app download is needed.

## Features

- **Catalogue**: products loaded from `data/products.json`, with room filters and colour swatches.
- **3D viewer**: rotate and zoom each product, and switch fabric colour on the model.
- **AR**: place the product in your room at true size, in the colour you picked.
- **Basket**: add and remove items, with a running total kept in `localStorage`.
- **Insights** (`insights.html`): product views, AR sessions, add-to-basket rate for shoppers who used AR versus those who didn't, and the most popular colour per product.
- **Business case** (`business-case.html`): estimates returns avoided, annual saving, net benefit and payback period from your own assumptions.

## How AR works

The viewer uses Google's [`<model-viewer>`](https://modelviewer.dev), which picks the best AR mode for the device:

| Device | AR mode | What happens |
|---|---|---|
| Android (Chrome) | **WebXR** | The camera opens in the page. Move the phone to find the floor, and the product appears at real size. Falls back to Google's **Scene Viewer** if WebXR isn't available. |
| iPhone / iPad (Safari) | **Quick Look** | model-viewer converts the `.glb` model to Apple's `.usdz` format on the fly and opens it in Quick Look. |
| Desktop | None | 3D viewer only, with a note to open the page on a phone. |

`ar-scale="fixed"` stops shoppers resizing the model, so what they see is the real size. Colour changes carry over to WebXR and Quick Look. Scene Viewer loads the original file, so it shows the default colour.

`js/ar.js` records an `ar_opened` event when model-viewer's `ar-status` event reports `session-started` (WebXR). Quick Look and Scene Viewer run outside the page and send no `ar-status`, so for those the AR button tap is recorded instead.

## Tracking

`js/tracking.js` stores events in `localStorage`: `product_view`, `ar_opened`, `colour_changed` and `add_to_basket`, each with `productId`, `colour`, `timestamp` and a per-tab `sessionId`. The data stays in that one browser. In production these events would go to an analytics service. The Insights page has a **Load sample data** button for demos.

## Tech

- HTML, CSS and JavaScript (ES modules, no framework, no build step)
- [`<model-viewer>`](https://modelviewer.dev) 4.0 (built on Three.js) for 3D and AR
- `localStorage` for the basket and tracking
- Docker + Nginx for a containerised static server

## Run it locally

You need a local web server, because browsers block `fetch()` on `file://` pages.

```bash
npx serve . -l 8080
```

Then open http://localhost:8080. Or, with Docker:

```bash
docker compose up --build
```

### Testing AR on your phone

AR needs **HTTPS**. To try it on a phone, put the local server behind an HTTPS tunnel:

```bash
npx localtunnel --port 8080
```

Open the `https://…` address it prints on your phone. Deploying to GitHub Pages or Vercel also gives you HTTPS.

### What doesn't work over plain `http://` (for example `http://192.168.x.x:8080`)

`localhost` counts as secure, so everything works there on your own computer. On another device over plain HTTP:

- **AR (WebXR)** is blocked, because the browser only allows WebXR on secure pages. The AR button is hidden and the page explains why.
- **Quick Look and Scene Viewer** may not open reliably, so treat AR as HTTPS-only.
- `crypto.randomUUID()` is unavailable. `tracking.js` falls back to its own ID generator for this.
- The 3D viewer, basket, tracking, Insights and Business case pages all work.

Note that `localStorage` is stored per address, so `localhost`, your tunnel URL and your LAN IP each keep separate baskets and tracking data.

## Project structure

```
index.html            Product catalogue
viewer.html           3D viewer + AR
basket.html           Basket
insights.html         Tracking dashboard
business-case.html    ROI calculator
css/                  One stylesheet per page, plus style.css (shared)
js/
  api.js              Loads products.json
  basket.js           Basket logic
  products.js         Catalogue page
  viewer.js           Viewer page, colour changes on the model
  ar.js               Detects AR launches
  tracking.js         Event logging to localStorage
  insights.js         Insights page
  business-case.js    Business case calculations
  utils.js            Shared helpers
data/products.json    Product catalogue (API-shaped mock)
assets/models/        .glb 3D models (see CREDITS.md)
docker/               Dockerfile and nginx.conf
```

## 3D models

Only the **Camden Corner Sofa** and the **Evesham Armchair** have 3D models so far. The other products show "3D model coming soon". Both models are CC0 (free for any use). Sources are in [`assets/models/CREDITS.md`](assets/models/CREDITS.md).

To add a model, put a `.glb` in `assets/models/` and set the product's `"model"` field in `data/products.json`. Name the fabric material `fabric…` so the colour swatches can recolour it.
