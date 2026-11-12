const form = document.getElementById('business-form');
const fields = ['orders', 'returnRate', 'costPerReturn', 'reduction', 'buildCost', 'runningCost'];
const out = id => document.getElementById(id);
const wholeNumber = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
const pounds = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const formatPrice = value => pounds.format(value);

function readInputs() {
  const values = {};
  let valid = true;
  for (const name of fields) {
    const input = form.elements[name];
    // Empty inputs fall back to the placeholder default.
    const raw = input.value.trim() === '' ? input.placeholder : input.value;
    const value = Number(raw);
    const ok = Number.isFinite(value) && input.checkValidity();
    input.setAttribute('aria-invalid', String(!ok));
    valid &&= ok;
    values[name] = value;
  }
  return valid ? values : null;
}

function calculate() {
  const v = readInputs();
  if (!v) {
    out('calc-error').hidden = false;
    return;
  }
  out('calc-error').hidden = true;

  const currentReturns = v.orders * (v.returnRate / 100);
  const returnsAvoided = currentReturns * (v.reduction / 100);
  const annualSaving = returnsAvoided * v.costPerReturn;
  const netAnnual = annualSaving - v.runningCost;
  const firstYear = netAnnual - v.buildCost;

  out('returns-avoided').textContent = wholeNumber.format(returnsAvoided);
  out('returns-context').textContent = `of ${wholeNumber.format(currentReturns)} returns a year today`;
  out('annual-saving').textContent = formatPrice(annualSaving);
  out('net-benefit').textContent = formatPrice(netAnnual);
  out('net-benefit').classList.toggle('negative', netAnnual < 0);
  out('first-year').textContent = `${formatPrice(firstYear)} in year one, after the build cost`;

  if (netAnnual <= 0) {
    out('payback').textContent = 'Never';
    out('payback-context').textContent = 'Running costs are higher than the saving';
  } else {
    const months = v.buildCost / (netAnnual / 12);
    out('payback').textContent = `${months < 10 ? months.toFixed(1) : Math.round(months)} months`;
    out('payback-context').textContent = 'to recover the one-off build cost';
  }
}

form.addEventListener('input', calculate);
form.addEventListener('submit', (e) => { e.preventDefault(); calculate(); });
form.addEventListener('reset', () => setTimeout(calculate));
calculate();
