const axios = require('axios');

async function test() {
   try {
      // First login to get token
      const res1 = await axios.post('http://localhost:5001/api/auth/login', {
         email: 'admin@system.com',
         password: 'adminpassword123'
      });
      const token = res1.data.token;
      console.log("Logged in");

      const res2 = await axios.get('http://localhost:5001/api/admin/advanced-analytics', {
         headers: { Authorization: 'Bearer ' + token }
      });
      console.log("SUCCESS");
      
   } catch (error) {
      if (error.response) {
         console.log(error.response.data);
      } else {
         console.log(error.message);
      }
   }
}
test();
