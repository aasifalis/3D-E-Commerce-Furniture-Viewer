function getBasket() {
    const basket = localStorage.getItem('basket');
    if (basket) {
        return JSON.parse(basket);
    }
    return [];

}
function saveBasket(basket) {
    localStorage.setItem('basket', JSON.stringify(basket));
}

function addToBasket(id, colour) {
  const basket = getBasket();
  const existing = basket.find(item => item.id === id && item.colour === colour);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    basket.push({ id, colour, quantity: 1 });
  }
  
  saveBasket(basket);
}

function removeFromBasket(id, colour) {
  const basket = getBasket().filter(
    item => !(item.id === id && item.colour === colour)
  );
  saveBasket(basket);
}

export { getBasket, addToBasket, removeFromBasket };

export function updateBasketCount() {
  const count = getBasket().reduce((total, item) => total + item.quantity, 0);
  const el = document.getElementById('basket-count');
  if (el) el.textContent = count;

}

async function renderBasket() {
  const basket = getBasket();
  const itemsContainer = document.getElementById('basket-items');
  const totalEl = document.getElementById('basket-total');

  if (!itemsContainer) return;

  if (basket.length === 0) {
    itemsContainer.innerHTML = '<p>Your basket is empty.</p>';
    return;
  }

  const { getProductById } = await import('./api.js');

  let total = 0;
  itemsContainer.innerHTML = '';

  for (const item of basket) {
    const product = await getProductById(item.id);
    if (!product) continue;
    total += product.price * item.quantity;

    const row = document.createElement('div');
    row.className = 'basket-item';
    row.innerHTML = `
      <img src="https://placehold.co/80x60?text=${encodeURIComponent(product.name)}" alt="${product.name}" />
      <div class="basket-item__details">
        <h3>${product.name}</h3>
        <p>${item.colour}</p>
        <p>Qty: ${item.quantity}</p>
      </div>
      <p class="basket-item__price">${formatPrice(product.price)}</p>
      <button class="basket-item__remove" data-id="${item.id}" data-colour="${item.colour}">Remove</button>
    `;
    itemsContainer.append(row);
  }

  if (totalEl) totalEl.textContent = formatPrice(total);
}

renderBasket();
updateBasketCount();

function formatPrice(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount);
}

document.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.basket-item__remove');
  if (!removeBtn) return;

  removeFromBasket(removeBtn.dataset.id, removeBtn.dataset.colour);
  renderBasket();
  updateBasketCount();
});