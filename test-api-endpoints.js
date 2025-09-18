const axios = require('axios');

const API_BASE = 'http://localhost:3000';
let tokens = {};

// Test data
const testUsers = {
  owner: { email: 'owner@acme.com', password: 'password123' },
  admin: { email: 'admin@acme.com', password: 'password123' },
  viewer: { email: 'viewer@acme.com', password: 'password123' }
};

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null, user = 'owner') {
  const token = tokens[user];
  if (!token) {
    throw new Error(`No token for user: ${user}`);
  }
  
  try {
    const response = await axios({
      method,
      url: `${API_BASE}${endpoint}`,
      data,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    return {
      error: true,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    };
  }
}

// Test authentication
async function testAuthentication() {
  console.log('\n🔐 TESTING AUTHENTICATION ENDPOINTS');
  console.log('=' .repeat(50));
  
  for (const [role, credentials] of Object.entries(testUsers)) {
    try {
      console.log(`\nTesting login for ${role}...`);
      const response = await axios.post(`${API_BASE}/auth/login`, credentials);
      
      if (response.data.access_token) {
        tokens[role] = response.data.access_token;
        console.log(`✅ ${role} login successful`);
        console.log(`   User: ${response.data.user.firstName} ${response.data.user.lastName}`);
        console.log(`   Role: ${response.data.user.role}`);
        console.log(`   Organization: ${response.data.user.organization.name}`);
      }
    } catch (error) {
      console.log(`❌ ${role} login failed:`, error.response?.data?.message || error.message);
    }
  }
}

// Test task endpoints
async function testTaskEndpoints() {
  console.log('\n📋 TESTING TASK ENDPOINTS');
  console.log('=' .repeat(50));
  
  // Test 1: Get all tasks (as owner)
  console.log('\n1. Getting all tasks (as owner)...');
  const allTasks = await makeRequest('GET', '/tasks', null, 'owner');
  if (allTasks.error) {
    console.log(`❌ Failed: ${allTasks.message}`);
  } else {
    console.log(`✅ Found ${allTasks.length} tasks`);
    allTasks.forEach(task => {
      console.log(`   - ${task.title} (${task.status}) - ${task.priority} priority`);
    });
  }
  
  // Test 2: Create a new task (as owner)
  console.log('\n2. Creating a new task (as owner)...');
  const newTask = await makeRequest('POST', '/tasks', {
    title: 'API Test Task',
    description: 'This task was created via API testing',
    priority: 'high',
    category: 'testing'
  }, 'owner');
  
  if (newTask.error) {
    console.log(`❌ Failed: ${newTask.message}`);
  } else {
    console.log(`✅ Task created successfully`);
    console.log(`   ID: ${newTask.id}`);
    console.log(`   Title: ${newTask.title}`);
    
    // Test 3: Get specific task
    console.log('\n3. Getting specific task...');
    const specificTask = await makeRequest('GET', `/tasks/${newTask.id}`, null, 'owner');
    if (specificTask.error) {
      console.log(`❌ Failed: ${specificTask.message}`);
    } else {
      console.log(`✅ Task retrieved: ${specificTask.title}`);
    }
    
    // Test 4: Update task (as owner)
    console.log('\n4. Updating task (as owner)...');
    const updatedTask = await makeRequest('PATCH', `/tasks/${newTask.id}`, {
      title: 'Updated API Test Task',
      status: 'in_progress',
      description: 'This task has been updated via API testing'
    }, 'owner');
    
    if (updatedTask.error) {
      console.log(`❌ Failed: ${updatedTask.message}`);
    } else {
      console.log(`✅ Task updated successfully`);
      console.log(`   New title: ${updatedTask.title}`);
      console.log(`   New status: ${updatedTask.status}`);
    }
    
    // Test 5: Try to update task as viewer (should fail)
    console.log('\n5. Trying to update task as viewer (should fail)...');
    const viewerUpdate = await makeRequest('PATCH', `/tasks/${newTask.id}`, {
      title: 'Viewer Update Attempt'
    }, 'viewer');
    
    if (viewerUpdate.error) {
      console.log(`✅ Correctly blocked: ${viewerUpdate.message}`);
    } else {
      console.log(`❌ Unexpectedly allowed viewer to update task`);
    }
    
    // Test 6: Try to delete task as admin (should work if in same org)
    console.log('\n6. Trying to delete task as admin...');
    const deleteResult = await makeRequest('DELETE', `/tasks/${newTask.id}`, null, 'admin');
    
    if (deleteResult.error) {
      console.log(`❌ Failed: ${deleteResult.message}`);
    } else {
      console.log(`✅ Task deleted successfully by admin`);
    }
  }
}

// Test role-based access
async function testRoleBasedAccess() {
  console.log('\n👥 TESTING ROLE-BASED ACCESS CONTROL');
  console.log('=' .repeat(50));
  
  // Create a task as owner first
  console.log('\n1. Creating task as owner...');
  const ownerTask = await makeRequest('POST', '/tasks', {
    title: 'Owner Task',
    description: 'Created by owner',
    priority: 'medium'
  }, 'owner');
  
  if (ownerTask.error) {
    console.log(`❌ Failed to create task: ${ownerTask.message}`);
    return;
  }
  
  console.log(`✅ Task created: ${ownerTask.title}`);
  
  // Test viewer access
  console.log('\n2. Testing viewer access to tasks...');
  const viewerTasks = await makeRequest('GET', '/tasks', null, 'viewer');
  if (viewerTasks.error) {
    console.log(`❌ Viewer failed to get tasks: ${viewerTasks.message}`);
  } else {
    console.log(`✅ Viewer can see ${viewerTasks.length} tasks`);
  }
  
  // Test admin access
  console.log('\n3. Testing admin access to tasks...');
  const adminTasks = await makeRequest('GET', '/tasks', null, 'admin');
  if (adminTasks.error) {
    console.log(`❌ Admin failed to get tasks: ${adminTasks.message}`);
  } else {
    console.log(`✅ Admin can see ${adminTasks.length} tasks`);
  }
  
  // Test viewer trying to create task (should fail)
  console.log('\n4. Testing viewer trying to create task (should fail)...');
  const viewerCreate = await makeRequest('POST', '/tasks', {
    title: 'Viewer Task',
    description: 'This should fail'
  }, 'viewer');
  
  if (viewerCreate.error) {
    console.log(`✅ Correctly blocked viewer from creating task: ${viewerCreate.message}`);
  } else {
    console.log(`❌ Unexpectedly allowed viewer to create task`);
  }
  
  // Test admin creating task
  console.log('\n5. Testing admin creating task...');
  const adminCreate = await makeRequest('POST', '/tasks', {
    title: 'Admin Task',
    description: 'Created by admin',
    priority: 'low'
  }, 'admin');
  
  if (adminCreate.error) {
    console.log(`❌ Admin failed to create task: ${adminCreate.message}`);
  } else {
    console.log(`✅ Admin successfully created task: ${adminCreate.title}`);
  }
}

// Test audit endpoints
async function testAuditEndpoints() {
  console.log('\n📊 TESTING AUDIT ENDPOINTS');
  console.log('=' .repeat(50));
  
  // Test getting audit logs as owner
  console.log('\n1. Getting audit logs as owner...');
  const ownerAudit = await makeRequest('GET', '/audit/logs', null, 'owner');
  if (ownerAudit.error) {
    console.log(`❌ Failed: ${ownerAudit.message}`);
  } else {
    console.log(`✅ Owner can access audit logs`);
    console.log(`   Found ${ownerAudit.length} audit entries`);
  }
  
  // Test getting audit logs as viewer (should work for their own logs)
  console.log('\n2. Getting audit logs as viewer...');
  const viewerAudit = await makeRequest('GET', '/audit/logs', null, 'viewer');
  if (viewerAudit.error) {
    console.log(`❌ Failed: ${viewerAudit.message}`);
  } else {
    console.log(`✅ Viewer can access their own audit logs`);
    console.log(`   Found ${viewerAudit.length} audit entries`);
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🚨 TESTING ERROR HANDLING');
  console.log('=' .repeat(50));
  
  // Test invalid login
  console.log('\n1. Testing invalid login...');
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
    console.log(`❌ Should have failed with invalid credentials`);
  } catch (error) {
    console.log(`✅ Correctly rejected invalid credentials: ${error.response?.data?.message}`);
  }
  
  // Test accessing protected endpoint without token
  console.log('\n2. Testing access without token...');
  try {
    await axios.get(`${API_BASE}/tasks`);
    console.log(`❌ Should have failed without token`);
  } catch (error) {
    console.log(`✅ Correctly rejected request without token: ${error.response?.status}`);
  }
  
  // Test accessing non-existent task
  console.log('\n3. Testing access to non-existent task...');
  const nonExistent = await makeRequest('GET', '/tasks/non-existent-id', null, 'owner');
  if (nonExistent.error) {
    console.log(`✅ Correctly handled non-existent task: ${nonExistent.message}`);
  } else {
    console.log(`❌ Should have failed for non-existent task`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 COMPREHENSIVE API ENDPOINT TESTING');
  console.log('=' .repeat(60));
  console.log(`Testing API at: ${API_BASE}`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  
  try {
    await testAuthentication();
    await testTaskEndpoints();
    await testRoleBasedAccess();
    await testAuditEndpoints();
    await testErrorHandling();
    
    console.log('\n🎉 ALL TESTS COMPLETED!');
    console.log('=' .repeat(60));
    console.log('Check the results above to see which endpoints are working correctly.');
    
  } catch (error) {
    console.error('\n💥 TEST SUITE FAILED:', error.message);
  }
}

// Run the tests
runAllTests();
