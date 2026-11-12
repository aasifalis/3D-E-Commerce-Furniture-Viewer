const priceFormatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

export function formatPrice(amount) {
  return priceFormatter.format(amount);
}

// Escape text before putting it into innerHTML.
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Inline SVG placeholder until real product photos exist (no external requests).
export function placeholderImage(name, width = 400, height = 300) {
  const fontSize = Math.round(width / 16);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#e4e4e1"/>
    <text x="50%" y="50%" fill="#6b6b66" font-family="system-ui, sans-serif" font-size="${fontSize}"
      text-anchor="middle" dominant-baseline="middle">${escapeHtml(name)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function slugify(text) {
  return String(text).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Product photo for a colour, e.g. assets/images/sofa.jpg -> assets/images/sofa-slate-blue.jpg
export function productImage(product, colourName) {
  if (!colourName) return product.thumbnail;
  return product.thumbnail.replace(/\.jpg$/, `-${slugify(colourName)}.jpg`);
}

// Swap a broken product photo for the generated placeholder.
export function usePlaceholderOnError(img, name) {
  img.addEventListener('error', () => { img.src = placeholderImage(name); }, { once: true });
}

export function viewerUrl(productId, colour) {
  const params = new URLSearchParams({ id: productId });
  if (colour) params.set('colour', colour);
  return `viewer.html?${params}`;
}

// iPhone / iPad (iPadOS reports itself as a Mac with touch support).
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
