import { getProducts } from './api.js';

const products = await getProducts();
console.log(products);

function formatPrice(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount);
}

function buildCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.productId = product.id;

  card.innerHTML = `
    <img class="card__img" src="https://placehold.co/400x300?text=${encodeURIComponent(product.name)}" alt="${product.name}" />
    <div class="card__body">
      <h2 class="card__name">${product.name}</h2>
      <p class="card__price">${formatPrice(product.price)}</p>
      <div class="card__swatches"></div>
      <a class="card__link" href="viewer.html?id=${product.id}">View product</a>
    </div>
  `;

  buildSwatches(product.colours, card.querySelector('.card__swatches'));

  return card;
}

function buildSwatches(colours, container) {
  for (const colour of colours) {
    const btn = document.createElement('button');
    btn.className = 'swatch';
    btn.style.backgroundColor = colour.hex;
    btn.dataset.colourName = colour.name;
    btn.dataset.hex = colour.hex;
    btn.setAttribute('aria-label', colour.name);
    container.append(btn);
  }
}

const grid = document.getElementById('product-grid');
const fragment = document.createDocumentFragment();

for (const product of products) {
  fragment.append(buildCard(product));
}

grid.replaceChildren(fragment);