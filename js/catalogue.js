fetch('data/products.json')
  .then(res => res.json())
  .then(products => renderProducts(products))

function renderProducts(products) {
  const grid = document.getElementById('product-grid')
  products.forEach(product => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${product.thumbnail}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>£${product.price}</p>
        <button onclick="addToBasket(${product.id})">Add to basket</button>
      </div>
    `
  })
}