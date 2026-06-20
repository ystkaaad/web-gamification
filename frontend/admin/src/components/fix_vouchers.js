const fs = require('fs');
let content = fs.readFileSync('Vouchers.tsx', 'utf8');

// Fix 1: validate voucher_type in normalizeVoucher
content = content.replace(
  "voucher_type: String(voucher.voucher_type || 'PERCENTAGE'),",
  "voucher_type: (() => { const t = String(voucher.voucher_type || 'PERCENTAGE'); return ['PERCENTAGE','FIXED','FREE_ITEM','CUSTOM'].includes(t) ? t : 'PERCENTAGE'; })(),"
);

// Fix 2: add created_at to "Rilis Voucher Baru" default state
content = content.replace(
  "voucher_type: 'PERCENTAGE', voucher_value: '', min_purchase: 0, max_discount: 0, cashier_instruction: ''",
  "voucher_type: 'PERCENTAGE', voucher_value: '', min_purchase: 0, max_discount: 0, cashier_instruction: '', created_at: ''"
);

fs.writeFileSync('Vouchers.tsx', content);
console.log('Fix 1 & 2 done');
