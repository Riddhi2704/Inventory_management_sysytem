const axios = require('axios');

async function testApi() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'teststaff@example.com',
      password: 'Password@123'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful. Token obtained.');

    // 2. Fetch Products
    console.log('Fetching products...');
    const productRes = await axios.get('http://localhost:5000/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Response Status:', productRes.status);
    console.log('Response Data:', JSON.stringify(productRes.data, null, 2));

  } catch (err) {
    if (err.response) {
      console.log('API Error Status:', err.response.status);
      console.log('API Error Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Network/Request Error:', err.message);
    }
  }
}

testApi();
