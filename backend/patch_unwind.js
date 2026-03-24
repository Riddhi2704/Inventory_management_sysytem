const fs = require('fs');

const p = 'e:/GoogleAntigravity/inventory_management_system/backend/controllers/adminController.js';
let content = fs.readFileSync(p, 'utf8');

// Replace all occurrences
content = content.replace(/preserveNullAndEmpty:/g, 'preserveNullAndEmptyArrays:');

fs.writeFileSync(p, content, 'utf8');
console.log('Fixed preserveNullAndEmptyArrays');
