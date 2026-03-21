const axios = require('axios');

async function testSupplierFix() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'teststaff@example.com',
            password: 'Password@123'
        });
        
        const token = loginRes.data.token;
        const shopName = 'Shriji kirayana store';
        console.log(`Login successful. Shop: [${shopName}]`);

        // Existing supplier "Mrs. Riddhi patel" exists in DB according to previous check.
        // Let's try to add a product using this supplier name string.
        
        const productId = `TEST-${Date.now()}`;
        console.log(`Attempting to add product with existing supplier name: Mrs. Riddhi patel...`);
        
        const prodData = {
            productId,
            name: `Test Product ${productId}`,
            category: 'Grocery', // Use a name string for category too
            brand: 'Test Brand',
            supplier: 'Mrs. Riddhi patel', // This caused the error before
            purchasePrice: 10,
            sellingPrice: 15,
            quantity: 100,
            unitType: 'pcs',
            description: 'Test Description',
            storageLocation: 'Shelf A'
        };

        const addRes = await axios.post('http://localhost:5000/api/products', prodData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Successfully added product: ${addRes.data.name}`);
        console.log(`Supplier ID in product: ${addRes.data.supplier}`);

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testSupplierFix();
