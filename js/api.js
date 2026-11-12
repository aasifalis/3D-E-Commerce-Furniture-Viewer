let cache = null;

export async function getProducts() {
  if (cache) return cache;

  // Relative path so the site also works from a sub-folder (e.g. GitHub Pages).
  const res = await fetch('data/products.json');

  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);

  const data = await res.json();

  cache = data.products;
  return cache;
}

export async function getProductById(id) {
  const products = await getProducts();
  return products.find(p => p.id === id);
}
