import test from 'node:test';
import assert from 'node:assert/strict';
export function calculateInvoiceLine({quantity,unitPrice,discount=0,taxRateBps=0}) {
 if (![quantity,unitPrice,discount,taxRateBps].every(Number.isFinite)||quantity<=0||unitPrice<0||discount<0||discount>quantity*unitPrice||taxRateBps<0) throw new Error('Invalid invoice line values');
 const taxableValue=quantity*unitPrice-discount;
 const tax=Math.round(taxableValue*taxRateBps/10000*100)/100;
 return Object.freeze({taxableValue:round2(taxableValue),tax,total:round2(taxableValue+tax)});
}
function round2(n){return Math.round((n+Number.EPSILON)*100)/100;}
export function invoiceTotals(lines) {
 if (!Array.isArray(lines)||!lines.length) throw new Error('Invoice lines required');
 return lines.reduce((s,l)=>({taxableValue:round2(s.taxableValue+l.taxableValue),tax:round2(s.tax+l.tax),total:round2(s.total+l.total)}),{taxableValue:0,tax:0,total:0});
}
test('invoice line applies discount before tax',()=>{
 assert.deepEqual(calculateInvoiceLine({quantity:2,unitPrice:100,discount:20,taxRateBps:1800}),{taxableValue:180,tax:32.4,total:212.4});
});
test('invoice totals aggregate rounded line values',()=>{
 const a=calculateInvoiceLine({quantity:1,unitPrice:100,taxRateBps:500});
 assert.deepEqual(invoiceTotals([a]),{taxableValue:100,tax:5,total:105});
});
test('invoice rejects invalid discount and negative tax rate',()=>{
 assert.throws(()=>calculateInvoiceLine({quantity:1,unitPrice:10,discount:11}));
 assert.throws(()=>calculateInvoiceLine({quantity:1,unitPrice:10,taxRateBps:-1}));
});