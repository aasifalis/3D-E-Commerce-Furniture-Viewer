import { getProducts } from './api.js';
import { clearEvents, getEvents, saveEvents } from './tracking.js';
import { escapeHtml } from './utils.js';

const content = document.getElementById('insights-content');
const status = document.getElementById('insights-status');

const pct = (n, d) => (d === 0 ? 0 : (n / d) * 100);
const fmtPct = value => `${value.toFixed(1)}%`;

function bar(value, label) {
  const width = Math.max(0, Math.min(100, value));
  return `<div class="bar" aria-hidden="true"><div class="bar__fill" style="width:${width}%"></div></div>
          <span class="bar__label">${label}</span>`;
}

function summarise(events) {
  const sessions = new Map();
  for (const e of events) {
    if (!sessions.has(e.sessionId)) sessions.set(e.sessionId, { usedAR: false, added: false });
    const s = sessions.get(e.sessionId);
    if (e.type === 'ar_opened') s.usedAR = true;
    if (e.type === 'add_to_basket') s.added = true;
  }

  const groups = { ar: { sessions: 0, added: 0 }, noAr: { sessions: 0, added: 0 } };
  for (const s of sessions.values()) {
    const g = s.usedAR ? groups.ar : groups.noAr;
    g.sessions++;
    if (s.added) g.added++;
  }

  return {
    views: events.filter(e => e.type === 'product_view').length,
    arOpens: events.filter(e => e.type === 'ar_opened').length,
    adds: events.filter(e => e.type === 'add_to_basket').length,
    sessions: sessions.size,
    groups,
  };
}

function productRows(events, products) {
  return products.map(product => {
    const mine = events.filter(e => e.productId === product.id);
    const colourCounts = new Map();
    for (const e of mine) {
      if ((e.type === 'colour_changed' || e.type === 'add_to_basket') && e.colour) {
        colourCounts.set(e.colour, (colourCounts.get(e.colour) ?? 0) + 1);
      }
    }
    const totalPicks = [...colourCounts.values()].reduce((a, b) => a + b, 0);
    const [topColour, topCount] = [...colourCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];

    return {
      product,
      views: mine.filter(e => e.type === 'product_view').length,
      arOpens: mine.filter(e => e.type === 'ar_opened').length,
      adds: mine.filter(e => e.type === 'add_to_basket').length,
      topColour,
      topShare: pct(topCount, totalPicks),
      topHex: product.colours.find(c => c.name === topColour)?.hex,
    };
  });
}

function render(events, products) {
  if (events.length === 0) {
    content.innerHTML = `
      <p class="empty">No events recorded in this browser yet. Browse some products, change colours,
      open AR or add items to your basket, then come back. Or load sample data to preview the page.</p>`;
    return;
  }

  const s = summarise(events);
  const arRate = pct(s.groups.ar.added, s.groups.ar.sessions);
  const noArRate = pct(s.groups.noAr.added, s.groups.noAr.sessions);
  const rows = productRows(events, products);
  const maxViews = Math.max(1, ...rows.map(r => r.views));

  content.innerHTML = `
    <section aria-labelledby="totals-heading">
      <h2 id="totals-heading">Totals</h2>
      <div class="stat-grid">
        <div class="stat"><span class="stat__value">${s.views}</span><span class="stat__label">Product views</span></div>
        <div class="stat"><span class="stat__value">${s.arOpens}</span><span class="stat__label">AR sessions</span></div>
        <div class="stat"><span class="stat__value">${s.adds}</span><span class="stat__label">Add to basket</span></div>
        <div class="stat"><span class="stat__value">${s.sessions}</span><span class="stat__label">Browsing sessions</span></div>
      </div>
    </section>

    <section aria-labelledby="rate-heading">
      <h2 id="rate-heading">Add-to-basket rate: AR vs no AR</h2>
      <p class="note">Share of browsing sessions that added at least one item to the basket.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Visitors</th><th scope="col">Sessions</th><th scope="col">Added to basket</th><th scope="col" class="col-bar">Rate</th></tr></thead>
          <tbody>
            <tr><th scope="row">Used AR</th><td>${s.groups.ar.sessions}</td><td>${s.groups.ar.added}</td>
                <td class="col-bar">${bar(arRate, fmtPct(arRate))}</td></tr>
            <tr><th scope="row">Didn't use AR</th><td>${s.groups.noAr.sessions}</td><td>${s.groups.noAr.added}</td>
                <td class="col-bar">${bar(noArRate, fmtPct(noArRate))}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section aria-labelledby="product-heading">
      <h2 id="product-heading">By product</h2>
      <p class="note">Most popular colour is based on colour selections and add-to-basket events.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Product</th><th scope="col" class="col-bar">Views</th><th scope="col">AR</th><th scope="col">Added</th><th scope="col" class="col-bar">Most popular colour</th></tr></thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <th scope="row">${escapeHtml(r.product.name)}</th>
                <td class="col-bar">${bar(pct(r.views, maxViews), r.views)}</td>
                <td>${r.arOpens}</td>
                <td>${r.adds}</td>
                <td class="col-bar">${r.topColour
                  ? `<span class="dot" style="background:${r.topHex ?? '#ccc'}" aria-hidden="true"></span>${escapeHtml(r.topColour)}
                     ${bar(r.topShare, `${fmtPct(r.topShare)} of picks`)}`
                  : '—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

// Sample data so the dashboard can be demonstrated before real traffic exists.
function sampleEvents(products) {
  const events = [];
  const now = Date.now();
  const rand = n => Math.floor(Math.random() * n);
  const pick = arr => arr[rand(arr.length)];
  for (let i = 0; i < 150; i++) {
    const sessionId = `sample-${i}`;
    let t = now - rand(14 * 24 * 3600e3);
    const push = (type, product, colour) => {
      t += 20e3 + rand(120e3);
      events.push({ type, productId: product.id, colour, timestamp: new Date(t).toISOString(), sessionId });
    };
    const product = pick(products);
    // Weight colour choice towards the first two colours so trends are visible.
    let colour = product.colours[Math.random() < 0.6 ? 0 : rand(product.colours.length)].name;
    push('product_view', product, colour);
    if (Math.random() < 0.5) {
      colour = pick(product.colours).name;
      push('colour_changed', product, colour);
    }
    const usedAR = product.model && Math.random() < 0.45;
    if (usedAR) push('ar_opened', product, colour);
    if (Math.random() < (usedAR ? 0.42 : 0.18)) push('add_to_basket', product, colour);
  }
  return events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

async function init() {
  const products = await getProducts();
  render(getEvents(), products);

  document.getElementById('load-sample').addEventListener('click', () => {
    if (getEvents().length && !confirm('Replace the events recorded in this browser with sample data?')) return;
    saveEvents(sampleEvents(products));
    render(getEvents(), products);
    status.textContent = 'Sample data loaded.';
  });

  document.getElementById('clear-data').addEventListener('click', () => {
    if (!confirm('Delete all tracked events stored in this browser?')) return;
    clearEvents();
    render([], products);
    status.textContent = 'Tracking data cleared.';
  });
}

init().catch(err => {
  console.error(err);
  content.innerHTML = '<p class="error" role="alert">Sorry, the insights could not be loaded.</p>';
});
