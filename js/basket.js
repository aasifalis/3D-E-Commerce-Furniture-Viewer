import { getProductById } from './api.js';
import { trackEvent } from './tracking.js';
import { escapeHtml, formatPrice, placeholderImage, viewerUrl } from './utils.js';

const STORAGE_KEY = 'basket';

export function getBasket() {
  try {
    const basket = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(basket) ? basket : [];
  } catch {
    return [];
  }
}

function saveBasket(basket) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
}

export function addToBasket(id, colour) {
  const basket = getBasket();
  const existing = basket.find(item => item.id === id && item.colour === colour);

  if (existing) {
    existing.quantity += 1;
  } else {
    basket.push({ id, colour, quantity: 1 });
  }

  saveBasket(basket);
  trackEvent('add_to_basket', { productId: id, colour });
  updateBasketCount();
}

export function removeFromBasket(id, colour) {
  const basket = getBasket().filter(
    item => !(item.id === id && item.colour === colour)
  );
  saveBasket(basket);
}

export function updateBasketCount() {
  const count = getBasket().reduce((total, item) => total + item.quantity, 0);
  const el = document.getElementById('basket-count');
  if (el) {
    el.textContent = count;
    el.closest('a')?.setAttribute('aria-label', `Basket, ${count} item${count === 1 ? '' : 's'}`);
  }
}

// Only does anything on basket.html.
async function renderBasket() {
  const itemsContainer = document.getElementById('basket-items');
  const totalEl = document.getElementById('basket-total');
  if (!itemsContainer) return;

  const basket = getBasket();
  let total = 0;

  if (basket.length === 0) {
    itemsContainer.innerHTML = '<p class="basket-empty">Your basket is empty. <a href="index.html">Browse furniture</a></p>';
    if (totalEl) totalEl.textContent = formatPrice(0);
    return;
  }

  const rows = [];
  for (const item of basket) {
    const product = await getProductById(item.id);
    if (!product) continue;
    total += product.price * item.quantity;

    const row = document.createElement('div');
    row.className = 'basket-item';
    row.innerHTML = `
      <img src="${placeholderImage(product.name, 160, 120)}" alt="${escapeHtml(product.name)}" width="80" height="60" />
      <div class="basket-item__details">
        <h2 class="basket-item__name">${escapeHtml(product.name)}</h2>
        <p>Colour: ${escapeHtml(item.colour)}</p>
        <p>Qty: ${item.quantity}</p>
        <a class="basket-item__view" href="${viewerUrl(product.id, item.colour)}">
          ${product.model ? 'View in 3D / AR' : 'View product'}
        </a>
      </div>
      <p class="basket-item__price">${formatPrice(product.price * item.quantity)}</p>
      <button type="button" class="basket-item__remove"
        data-id="${escapeHtml(item.id)}" data-colour="${escapeHtml(item.colour)}"
        aria-label="Remove ${escapeHtml(product.name)} in ${escapeHtml(item.colour)} from basket">Remove</button>
    `;
    rows.push(row);
  }

  itemsContainer.replaceChildren(...rows);
  if (totalEl) totalEl.textContent = formatPrice(total);
}

if (document.getElementById('basket-items')) {
  document.getElementById('basket-items').addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.basket-item__remove');
    if (!removeBtn) return;

    removeFromBasket(removeBtn.dataset.id, removeBtn.dataset.colour);
    renderBasket();
    updateBasketCount();
  });

  renderBasket().catch(err => {
    console.error(err);
    document.getElementById('basket-items').innerHTML =
      '<p class="error" role="alert">Sorry, the basket could not be loaded.</p>';
  });
}

updateBasketCount();
