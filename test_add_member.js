const axios = require('axios');

const baseUrl = 'http://localhost:3000/api';
const loginUrl = `${baseUrl}/auth/login`;

async function testAddMember() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post(loginUrl, {
      email: 'test@example.com', // Replace with a real user email from your DB
      password: 'password123'    // Replace with the real password
    });

    const token = loginRes.data.data.token;
    console.log('Logged in, token received');

    // 2. Add member
    const addRes = await axios.post(`${baseUrl}/shared-members`, {
      name: 'New Member',
      contact: 'invited@example.com',
      relationship: 1,
      role: 1,
      status: 'pending'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Add Member Response:', JSON.stringify(addRes.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

testAddMember();
