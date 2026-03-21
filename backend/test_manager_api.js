const axios = require('axios');

async function testManagerApi() {
  try {
    console.log('Logging in as Manager...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sanjay@gmail.com',
      password: 'Sanjay@123'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful.');

    console.log('Fetching Manager Dashboard Stats...');
    const statsRes = await axios.get('http://localhost:5000/api/manager/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Status:', statsRes.status);
    console.log('Response Summary:', JSON.stringify(statsRes.data.summary, null, 2));
    console.log('Total Products in list:', statsRes.data.recentMovements?.length || 0);

  } catch (err) {
    if (err.response) {
      console.log('API Error Status:', err.response.status);
      console.log('API Error Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
}

testManagerApi();
