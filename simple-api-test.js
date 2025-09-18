const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Test all endpoints systematically
async function testAllEndpoints() {
  console.log('🧪 TESTING ALL API ENDPOINTS');
  console.log('=' .repeat(50));
  
  let ownerToken, adminToken, viewerToken;
  
  // 1. Test Authentication
  console.log('\n1. 🔐 AUTHENTICATION TESTS');
  console.log('-'.repeat(30));
  
  try {
    // Owner login
    const ownerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'owner@acme.com',
      password: 'password123'
    });
    ownerToken = ownerLogin.data.access_token;
    console.log('✅ Owner login successful');
    console.log(`   User: ${ownerLogin.data.user.firstName} ${ownerLogin.data.user.lastName} (${ownerLogin.data.user.role})`);
  } catch (error) {
    console.log('❌ Owner login failed:', error.response?.data?.message);
  }
  
  try {
    // Admin login
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@acme.com',
      password: 'password123'
    });
    adminToken = adminLogin.data.access_token;
    console.log('✅ Admin login successful');
    console.log(`   User: ${adminLogin.data.user.firstName} ${adminLogin.data.user.lastName} (${adminLogin.data.user.role})`);
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message);
  }
  
  try {
    // Viewer login
    const viewerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'viewer@acme.com',
      password: 'password123'
    });
    viewerToken = viewerLogin.data.access_token;
    console.log('✅ Viewer login successful');
    console.log(`   User: ${viewerLogin.data.user.firstName} ${viewerLogin.data.user.lastName} (${viewerLogin.data.user.role})`);
  } catch (error) {
    console.log('❌ Viewer login failed:', error.response?.data?.message);
  }
  
  // 2. Test Task Endpoints
  console.log('\n2. 📋 TASK ENDPOINTS TESTS');
  console.log('-'.repeat(30));
  
  if (ownerToken) {
    try {
      // Get all tasks
      const tasks = await axios.get(`${API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      console.log(`✅ GET /tasks - Found ${tasks.data.length} tasks`);
    } catch (error) {
      console.log('❌ GET /tasks failed:', error.response?.data?.message);
    }
    
    try {
      // Create a task
      const newTask = await axios.post(`${API_BASE}/tasks`, {
        title: 'API Test Task',
        description: 'Created via API test',
        priority: 'high',
        category: 'testing'
      }, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      console.log(`✅ POST /tasks - Created task: ${newTask.data.title} (ID: ${newTask.data.id})`);
      
      const taskId = newTask.data.id;
      
      try {
        // Get specific task
        const specificTask = await axios.get(`${API_BASE}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${ownerToken}` }
        });
        console.log(`✅ GET /tasks/${taskId} - Retrieved: ${specificTask.data.title}`);
      } catch (error) {
        console.log(`❌ GET /tasks/${taskId} failed:`, error.response?.data?.message);
      }
      
      try {
        // Update task
        const updatedTask = await axios.patch(`${API_BASE}/tasks/${taskId}`, {
          title: 'Updated API Test Task',
          status: 'in_progress'
        }, {
          headers: { Authorization: `Bearer ${ownerToken}` }
        });
        console.log(`✅ PATCH /tasks/${taskId} - Updated: ${updatedTask.data.title} (Status: ${updatedTask.data.status})`);
      } catch (error) {
        console.log(`❌ PATCH /tasks/${taskId} failed:`, error.response?.data?.message);
      }
      
      try {
        // Delete task
        await axios.delete(`${API_BASE}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${ownerToken}` }
        });
        console.log(`✅ DELETE /tasks/${taskId} - Task deleted successfully`);
      } catch (error) {
        console.log(`❌ DELETE /tasks/${taskId} failed:`, error.response?.data?.message);
      }
      
    } catch (error) {
      console.log('❌ POST /tasks failed:', error.response?.data?.message);
    }
  }
  
  // 3. Test Role-Based Access
  console.log('\n3. 👥 ROLE-BASED ACCESS TESTS');
  console.log('-'.repeat(30));
  
  if (adminToken) {
    try {
      const adminTasks = await axios.get(`${API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ Admin can access tasks - Found ${adminTasks.data.length} tasks`);
    } catch (error) {
      console.log('❌ Admin task access failed:', error.response?.data?.message);
    }
    
    try {
      const adminCreate = await axios.post(`${API_BASE}/tasks`, {
        title: 'Admin Created Task',
        description: 'Created by admin',
        priority: 'medium'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ Admin can create tasks - Created: ${adminCreate.data.title}`);
    } catch (error) {
      console.log('❌ Admin task creation failed:', error.response?.data?.message);
    }
  }
  
  if (viewerToken) {
    try {
      const viewerTasks = await axios.get(`${API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${viewerToken}` }
      });
      console.log(`✅ Viewer can access tasks - Found ${viewerTasks.data.length} tasks`);
    } catch (error) {
      console.log('❌ Viewer task access failed:', error.response?.data?.message);
    }
    
    try {
      await axios.post(`${API_BASE}/tasks`, {
        title: 'Viewer Created Task',
        description: 'This should fail'
      }, {
        headers: { Authorization: `Bearer ${viewerToken}` }
      });
      console.log('❌ Viewer should not be able to create tasks');
    } catch (error) {
      console.log(`✅ Viewer correctly blocked from creating tasks: ${error.response?.data?.message}`);
    }
  }
  
  // 4. Test Audit Endpoints
  console.log('\n4. 📊 AUDIT ENDPOINTS TESTS');
  console.log('-'.repeat(30));
  
  if (ownerToken) {
    try {
      const auditLogs = await axios.get(`${API_BASE}/audit/logs`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      console.log(`✅ GET /audit/logs - Found ${auditLogs.data.length} audit entries`);
    } catch (error) {
      console.log('❌ GET /audit/logs failed:', error.response?.data?.message);
    }
  }
  
  // 5. Test Error Handling
  console.log('\n5. 🚨 ERROR HANDLING TESTS');
  console.log('-'.repeat(30));
  
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
    console.log('❌ Should have failed with invalid credentials');
  } catch (error) {
    console.log(`✅ Invalid login correctly rejected: ${error.response?.data?.message}`);
  }
  
  try {
    await axios.get(`${API_BASE}/tasks`);
    console.log('❌ Should have failed without token');
  } catch (error) {
    console.log(`✅ Request without token correctly rejected: ${error.response?.status}`);
  }
  
  try {
    await axios.get(`${API_BASE}/tasks/non-existent-id`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    console.log('❌ Should have failed for non-existent task');
  } catch (error) {
    console.log(`✅ Non-existent task correctly handled: ${error.response?.data?.message}`);
  }
  
  console.log('\n🎉 API ENDPOINT TESTING COMPLETED!');
  console.log('=' .repeat(50));
}

// Run the tests
testAllEndpoints().catch(console.error);
