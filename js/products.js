import { getProducts } from './api.js';
import { addToBasket, updateBasketCount } from './basket.js';

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
      <button class="card__add" data-product-id="${product.id}" data-colour="${product.colours[0].name}">Add to basket</button>
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

grid.addEventListener('click', (e) => {
  const swatch = e.target.closest('.swatch');
  if (swatch) {
    const card = swatch.closest('.product-card');
    card.querySelectorAll('.swatch').forEach(s => s.classList.remove('swatch--active'));
    swatch.classList.add('swatch--active');
    card.querySelector('.card__add').dataset.colour = swatch.dataset.colourName;
    card.querySelector('.card__link').href =
      `viewer.html?id=${card.dataset.productId}&colour=${encodeURIComponent(swatch.dataset.colourName)}`;
  }

  const addBtn = e.target.closest('.card__add');
  if (addBtn) {
    addToBasket(addBtn.dataset.productId, addBtn.dataset.colour);
    updateBasketCount();
  }
});

