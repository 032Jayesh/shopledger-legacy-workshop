const assert = require('node:assert/strict');
const test = require('node:test');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

test('invoice matches checkout GST breakdown and total for an HSN-priced discounted order', () => {
  const items = [
    { id: 1, name: 'Rice', sku: 'GRN-001', hsn: '1006', price: 2000, qty: 1 }
  ];

  const billed = pricing.computeTotals(items, 'SAVE10');
  const printed = invoice.computeInvoiceFigures({ items, coupon: 'SAVE10' });

  assert.equal(printed.discount, billed.discount);
  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.cgst, billed.cgst);
  assert.equal(printed.sgst, billed.sgst);
  assert.equal(printed.total, billed.total);
});

test('invoice uses the HSN tax rate when an order line has only HSN', () => {
  const items = [
    { id: 1, name: 'Rice', sku: 'GRN-001', hsn: '1006', price: 100, qty: 1 }
  ];

  const billed = pricing.computeTotals(items, '');
  const printed = invoice.computeInvoiceFigures({ items, coupon: '' });

  assert.equal(billed.tax, 5);
  assert.equal(billed.cgst, 2.5);
  assert.equal(billed.sgst, 2.5);
  assert.equal(billed.total, 105);
  assert.equal(printed.rows[0].gstPercent, 5);
  assert.equal(printed.tax, 5);
  assert.equal(printed.cgst, 2.5);
  assert.equal(printed.sgst, 2.5);
  assert.equal(printed.total, 105);
});

test('invoice applies SAVE10 with the checkout cap and pre-tax basis', () => {
  const items = [
    { id: 1, name: 'Rice', sku: 'GRN-001', hsn: '1006', price: 2000, qty: 1 }
  ];

  const billed = pricing.computeTotals(items, 'SAVE10');
  const printed = invoice.computeInvoiceFigures({ items, coupon: 'SAVE10' });

  assert.equal(billed.discount, 150);
  assert.equal(billed.tax, 92.5);
  assert.equal(billed.cgst, 46.25);
  assert.equal(billed.sgst, 46.25);
  assert.equal(billed.total, 1942.5);
  assert.equal(printed.discount, 150);
  assert.equal(printed.tax, 92.5);
  assert.equal(printed.cgst, 46.25);
  assert.equal(printed.sgst, 46.25);
  assert.equal(printed.total, 1942.5);
});

test('invoice taxes the post-discount line value when gstRate is supplied', () => {
  const items = [
    { id: 1, name: 'Rice', sku: 'GRN-001', hsn: '1006', gstRate: 5, price: 400, qty: 1 }
  ];

  const billed = pricing.computeTotals(items, 'FLAT50');
  const printed = invoice.computeInvoiceFigures({ items, coupon: 'FLAT50' });

  assert.equal(billed.discount, 50);
  assert.equal(billed.tax, 17.5);
  assert.equal(billed.cgst, 8.75);
  assert.equal(billed.sgst, 8.75);
  assert.equal(billed.total, 367.5);
  assert.equal(printed.rows[0].gstPercent, 5);
  assert.equal(printed.rows[0].line, 400);
  assert.equal(printed.rows[0].lineTax, 17.5);
  assert.equal(printed.discount, 50);
  assert.equal(printed.tax, 17.5);
  assert.equal(printed.cgst, 8.75);
  assert.equal(printed.sgst, 8.75);
  assert.equal(printed.total, 367.5);
});
