import { getProducts } from './api.js';
import { addToBasket } from './basket.js';
import { trackEvent } from './tracking.js';
import { escapeHtml, formatPrice, productImage, usePlaceholderOnError, viewerUrl } from './utils.js';

const productsById = new Map();

const grid = document.getElementById('product-grid');
const filters = document.getElementById('filters');
const status = document.getElementById('status');

function buildCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.productId = product.id;
  card.dataset.category = product.category;

  const firstColour = product.colours[0].name;
  const name = escapeHtml(product.name);

  card.innerHTML = `
    <img class="card__img" src="${productImage(product, firstColour)}" alt="${name} in ${escapeHtml(firstColour)}" width="400" height="300" loading="lazy" />
    <div class="card__body">
      <h2 class="card__name">${name}</h2>
      <p class="card__price">${formatPrice(product.price)}</p>
      <p class="card__colour">Colour: <span class="card__colour-name">${escapeHtml(firstColour)}</span></p>
      <div class="card__swatches" role="group" aria-label="Choose a colour for ${name}"></div>
      ${product.model ? '<p class="card__badge">3D &amp; AR available</p>' : ''}
      <button type="button" class="card__add" data-product-id="${escapeHtml(product.id)}"
        data-colour="${escapeHtml(firstColour)}">Add to basket</button>
      <a class="card__link" href="${viewerUrl(product.id, firstColour)}">
        View product<span class="visually-hidden">: ${name}</span>
      </a>
    </div>
  `;

  usePlaceholderOnError(card.querySelector('.card__img'), product.name);

  const swatches = card.querySelector('.card__swatches');
  product.colours.forEach((colour, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch' + (i === 0 ? ' swatch--active' : '');
    btn.style.backgroundColor = colour.hex;
    btn.dataset.colourName = colour.name;
    btn.setAttribute('aria-label', colour.name);
    btn.setAttribute('aria-pressed', String(i === 0));
    btn.title = colour.name;
    swatches.append(btn);
  });

  return card;
}

function buildFilters(products) {
  const categories = ['All', ...new Set(products.map(p => p.category))];
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filter by room');
  filters.replaceChildren(...categories.map((cat, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter' + (i === 0 ? ' filter--active' : '');
    btn.textContent = cat;
    btn.dataset.category = cat;
    btn.setAttribute('aria-pressed', String(i === 0));
    return btn;
  }));
}

function applyFilter(category) {
  let visible = 0;
  for (const card of grid.children) {
    const show = category === 'All' || card.dataset.category === category;
    card.hidden = !show;
    if (show) visible++;
  }
  status.textContent = `Showing ${visible} product${visible === 1 ? '' : 's'}`;
}

filters.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter');
  if (!btn) return;
  filters.querySelectorAll('.filter').forEach(f => {
    const active = f === btn;
    f.classList.toggle('filter--active', active);
    f.setAttribute('aria-pressed', String(active));
  });
  applyFilter(btn.dataset.category);
});

grid.addEventListener('click', (e) => {
  const swatch = e.target.closest('.swatch');
  if (swatch) {
    const card = swatch.closest('.product-card');
    const colour = swatch.dataset.colourName;
    card.querySelectorAll('.swatch').forEach(s => {
      s.classList.toggle('swatch--active', s === swatch);
      s.setAttribute('aria-pressed', String(s === swatch));
    });
    card.querySelector('.card__colour-name').textContent = colour;
    const product = productsById.get(card.dataset.productId);
    const img = card.querySelector('.card__img');
    img.src = productImage(product, colour);
    img.alt = `${product.name} in ${colour}`;
    card.querySelector('.card__add').dataset.colour = colour;
    card.querySelector('.card__link').href = viewerUrl(card.dataset.productId, colour);
    trackEvent('colour_changed', { productId: card.dataset.productId, colour });
    return;
  }

  const addBtn = e.target.closest('.card__add');
  if (addBtn) {
    addToBasket(addBtn.dataset.productId, addBtn.dataset.colour);
    addBtn.textContent = 'Added ✓';
    status.textContent = 'Added to basket';
    setTimeout(() => { addBtn.textContent = 'Add to basket'; }, 1500);
  }
});

try {
  const products = await getProducts();
  products.forEach(p => productsById.set(p.id, p));
  grid.replaceChildren(...products.map(buildCard));
  buildFilters(products);
} catch (err) {
  console.error(err);
  grid.innerHTML = '<p class="error" role="alert">Sorry, products could not be loaded. Please refresh the page.</p>';
}
