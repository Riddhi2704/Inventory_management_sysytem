const axios = require('axios');

async function verify() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'teststaff@example.com',
            password: 'Password@123'
        });
        
        const token = loginRes.data.token;
        console.log('Login successful.');

        console.log('Fetching products...');
        const prodRes = await axios.get('http://localhost:5000/api/products', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`API returned ${prodRes.data.length} products.`);
        prodRes.data.forEach(p => {
            console.log(`Product: [${p.name}], Category: [${p.category ? p.category.name : 'N/A'}]`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

verify();
