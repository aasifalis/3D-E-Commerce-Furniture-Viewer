import { getProductById } from './api.js';
import { addToBasket } from './basket.js';
import { initARTracking } from './ar.js';
import { trackEvent } from './tracking.js';
import { escapeHtml, formatPrice, getParam, productImage } from './utils.js';

const root = document.getElementById('viewer-root');

function showMessage(html) {
  root.innerHTML = `<div class="viewer-message" role="alert">${html}</div>`;
}

function renderStars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

const RECOLOURABLE = /^(fabric|finish)/i;
const originalTextures = new WeakMap(); // material -> its texture as loaded
const textureCache = new Map();         // url -> model-viewer texture
let colourRequest = 0;

/**
 * Show a product colour on the 3D model. A colour in products.json can be:
 *   { variant: "Navy" }                         a colour variant built into the model
 *   { textures: { finish: "path.jpg" } }        swap the wood / paint texture
 *   { textures: { finish: "original" } }        the model's own texture
 *   { hex: "#..." } only                        tint "fabric…" / "finish…" materials
 */
async function applyColourToModel(modelViewer, colour) {
  const request = ++colourRequest;
  const materials = (modelViewer.model?.materials ?? []).filter(m => m.isLoaded && RECOLOURABLE.test(m.name));

  if (colour.variant) {
    modelViewer.variantName = colour.variant;
    return;
  }

  if (colour.textures) {
    for (const material of materials) {
      const url = colour.textures[material.name];
      if (!url) continue;
      const slot = material.pbrMetallicRoughness.baseColorTexture;
      if (!originalTextures.has(material)) originalTextures.set(material, slot.texture);

      let texture = originalTextures.get(material);
      if (url !== 'original') {
        if (!textureCache.has(url)) textureCache.set(url, modelViewer.createTexture(url));
        texture = await textureCache.get(url);
      }
      if (request !== colourRequest) return; // a newer colour was picked meanwhile
      slot.setTexture(texture);
    }
    return;
  }

  for (const material of materials) {
    material.pbrMetallicRoughness.setBaseColorFactor(colour.hex);
    // Only velvet materials (KHR_materials_sheen) have a sheen colour;
    // model-viewer throws for materials without one.
    try {
      material.setSheenColorFactor(colour.hex);
    } catch {
      /* no sheen on this material */
    }
  }
}

async function init() {
  const id = getParam('id');
  const product = id ? await getProductById(id) : null;

  if (!product) {
    showMessage('<h1>Product not found</h1><p><a href="index.html">Back to all products</a></p>');
    return;
  }

  document.title = `${product.name} | Roomi`;

  let colour = product.colours.find(c => c.name === getParam('colour')) ?? product.colours[0];
  const name = escapeHtml(product.name);
  const { w, d, h } = product.dimensions;

  root.innerHTML = `
    <div class="viewer-stage">
      ${product.model ? `
        <model-viewer id="model"
          src="${escapeHtml(product.model)}"
          poster="${escapeHtml(productImage(product, colour.name))}"
          alt="Interactive 3D model of the ${name}. Drag to rotate, pinch or scroll to zoom."
          camera-controls touch-action="pan-y"
          ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" ar-placement="floor"
          shadow-intensity="1" environment-image="neutral" exposure="1">
          <button slot="ar-button" type="button" class="ar-button">View in your room (AR)</button>
          <div slot="progress-bar" class="model-progress" aria-hidden="true"></div>
        </model-viewer>` : `
        <div class="no-model">
          <p><strong>3D model coming soon</strong></p>
          <p>We don't have a 3D model of this product yet.</p>
        </div>`}
    </div>
    <section class="viewer-info" aria-labelledby="product-name">
      <p class="viewer-category">${escapeHtml(product.category)}</p>
      <h1 id="product-name">${name}</h1>
      <p class="viewer-price">${formatPrice(product.price)}</p>
      <p class="viewer-rating">
        <span aria-hidden="true">${renderStars(product.rating)}</span>
        <span class="visually-hidden">Rated ${product.rating} out of 5</span>
        ${product.rating} (${product.reviews} reviews)
      </p>
      <p>${escapeHtml(product.description)}</p>
      <p class="viewer-dims">W ${w} cm × D ${d} cm × H ${h} cm</p>

      <fieldset class="viewer-colours">
        <legend>Colour: <span id="colour-name">${escapeHtml(colour.name)}</span></legend>
        <div class="swatches" id="swatches"></div>
      </fieldset>

      <button type="button" id="add-to-basket" class="button-primary">Add to basket</button>
      <p id="viewer-status" class="viewer-status" role="status" aria-live="polite"></p>
      <p id="ar-note" class="ar-note" hidden></p>
    </section>
  `;

  const swatches = document.getElementById('swatches');
  const modelViewer = document.getElementById('model');

  for (const c of product.colours) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch' + (c === colour ? ' swatch--active' : '');
    btn.style.backgroundColor = c.hex;
    btn.dataset.colourName = c.name;
    btn.setAttribute('aria-label', c.name);
    btn.setAttribute('aria-pressed', String(c === colour));
    btn.title = c.name;
    swatches.append(btn);
  }

  swatches.addEventListener('click', (e) => {
    const btn = e.target.closest('.swatch');
    if (!btn) return;
    colour = product.colours.find(c => c.name === btn.dataset.colourName);
    swatches.querySelectorAll('.swatch').forEach(s => {
      s.classList.toggle('swatch--active', s === btn);
      s.setAttribute('aria-pressed', String(s === btn));
    });
    document.getElementById('colour-name').textContent = colour.name;
    history.replaceState(null, '', `?id=${encodeURIComponent(product.id)}&colour=${encodeURIComponent(colour.name)}`);
    if (modelViewer) applyColourToModel(modelViewer, colour).catch(console.error);
    trackEvent('colour_changed', { productId: product.id, colour: colour.name });
  });

  document.getElementById('add-to-basket').addEventListener('click', () => {
    addToBasket(product.id, colour.name);
    document.getElementById('viewer-status').textContent = `${product.name} in ${colour.name} added to your basket.`;
  });

  trackEvent('product_view', { productId: product.id, colour: colour.name });

  if (modelViewer) {
    initARTracking(modelViewer, { productId: product.id, getColour: () => colour.name });

    modelViewer.addEventListener('load', () => {
      applyColourToModel(modelViewer, colour).catch(console.error);
      const note = document.getElementById('ar-note');
      if (!modelViewer.canActivateAR) {
        note.textContent = window.isSecureContext
          ? 'To see this in your room, open this page on an Android phone (Chrome) or iPhone (Safari).'
          : 'AR needs a secure (HTTPS) connection. Open this page over HTTPS on your phone to place it in your room.';
        note.hidden = false;
      }
    });

    modelViewer.addEventListener('error', () => {
      root.querySelector('.viewer-stage').innerHTML =
        '<div class="no-model" role="alert"><p>Sorry, the 3D model could not be loaded.</p></div>';
    });
  }
}

init().catch(err => {
  console.error(err);
  showMessage('<h1>Something went wrong</h1><p>Please refresh the page or <a href="index.html">go back to the products</a>.</p>');
});
