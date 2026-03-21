const axios = require('axios');

async function testCategories() {
    try {
        console.log('Logging in to get token...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'teststaff@example.com',
            password: 'Password@123'
        });
        
        const token = loginRes.data.token;
        console.log('Login successful.');

        console.log('Fetching categories from API...');
        const catRes = await axios.get('http://localhost:5000/api/categories', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`API returned ${catRes.data.length} categories.`);
        console.log('Category Names:', catRes.data.map(c => c.name).join(', '));

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testCategories();
