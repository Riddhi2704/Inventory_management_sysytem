const axios = require('axios');

async function debugOrder() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'testmanager@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Login successful');

    // 2. Get Suppliers and Products to get IDs
    console.log('Fetching suppliers and products...');
    const [supRes, prodRes] = await Promise.all([
      axios.get('http://localhost:5001/api/suppliers', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://localhost:5001/api/products', { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const supplier = supRes.data[0]._id;
    const productName = prodRes.data[0].name;

    console.log(`Using Supplier ID: ${supplier}, Product: ${productName}`);

    // 3. Create Order
    console.log('Creating order...');
    const orderRes = await axios.post('http://localhost:5001/api/purchase-orders', {
      supplier: supplier,
      productName: productName,
      quantity: 10,
      price: 20
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Order created successfully:', orderRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response from server:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

debugOrder();
