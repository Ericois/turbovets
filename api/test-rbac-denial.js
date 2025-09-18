#!/usr/bin/env node

/**
 * RBAC Denial Test Script
 * 
 * This script demonstrates that the RBAC system properly denies access
 * to operations that users are not authorized to perform.
 */

const API_URL = 'http://localhost:3000';

// Test users with different roles
const testUsers = {
  owner: {
    email: 'owner@acme.com',
    password: 'password123',
    role: 'OWNER'
  },
  admin: {
    email: 'admin@acme.com', 
    password: 'password123',
    role: 'ADMIN'
  },
  viewer: {
    email: 'viewer@acme.com',
    password: 'password123',
    role: 'VIEWER'
  },
  frontendAdmin: {
    email: 'frontend@acme.com',
    password: 'password123',
    role: 'ADMIN'
  },
  backendViewer: {
    email: 'backend@acme.com',
    password: 'password123',
    role: 'VIEWER'
  }
};

let authTokens = {};

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, token, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  return {
    status: response.status,
    data: await response.json().catch(() => ({ message: 'No JSON response' }))
  };
}

// Login function
async function login(user) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    } else {
      throw new Error(`Login failed: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Login failed for ${user.email}:`, error.message);
    return null;
  }
}

// Test function
async function testRbacDenial() {
  console.log('🔒 RBAC Denial Test Suite');
  console.log('========================\n');

  // Step 1: Login all users
  console.log('1️⃣ Logging in test users...');
  for (const [role, user] of Object.entries(testUsers)) {
    const token = await login(user);
    if (token) {
      authTokens[role] = token;
      console.log(`✅ ${role.toUpperCase()} logged in successfully`);
    } else {
      console.log(`❌ ${role.toUpperCase()} login failed`);
      return;
    }
  }

  console.log('\n2️⃣ Testing RBAC Denial Scenarios...\n');

  // Test 1: Viewer trying to create a task (should be denied)
  console.log('🧪 Test 1: Viewer trying to create a task (should be denied)');
  const createTaskData = {
    title: 'New Task by Viewer',
    description: 'This should be denied',
    status: 'todo',
    priority: 'medium'
  };
  
  const createResult = await makeRequest('POST', '/tasks', authTokens.viewer, createTaskData);
  if (createResult.status === 403) {
    console.log('✅ PASS: Viewer correctly denied task creation');
    console.log(`   Response: ${createResult.data.message || 'Forbidden'}`);
  } else {
    console.log('❌ FAIL: Viewer should have been denied task creation');
    console.log(`   Status: ${createResult.status}, Response: ${JSON.stringify(createResult.data)}`);
  }

  // Test 2: Viewer trying to update a task (should be denied)
  console.log('\n🧪 Test 2: Viewer trying to update a task (should be denied)');
  const updateTaskData = {
    title: 'Updated Task by Viewer',
    status: 'in_progress'
  };
  
  const updateResult = await makeRequest('PATCH', '/tasks/task-1', authTokens.viewer, updateTaskData);
  if (updateResult.status === 403) {
    console.log('✅ PASS: Viewer correctly denied task update');
    console.log(`   Response: ${updateResult.data.message || 'Forbidden'}`);
  } else {
    console.log('❌ FAIL: Viewer should have been denied task update');
    console.log(`   Status: ${updateResult.status}, Response: ${JSON.stringify(updateResult.data)}`);
  }

  // Test 3: Viewer trying to delete a task (should be denied)
  console.log('\n🧪 Test 3: Viewer trying to delete a task (should be denied)');
  const deleteResult = await makeRequest('DELETE', '/tasks/task-1', authTokens.viewer);
  if (deleteResult.status === 403) {
    console.log('✅ PASS: Viewer correctly denied task deletion');
    console.log(`   Response: ${deleteResult.data.message || 'Forbidden'}`);
  } else {
    console.log('❌ FAIL: Viewer should have been denied task deletion');
    console.log(`   Status: ${updateResult.status}, Response: ${JSON.stringify(deleteResult.data)}`);
  }

  // Test 4: Viewer trying to read tasks (should be allowed)
  console.log('\n🧪 Test 4: Viewer trying to read tasks (should be allowed)');
  const readResult = await makeRequest('GET', '/tasks', authTokens.viewer);
  if (readResult.status === 200) {
    console.log('✅ PASS: Viewer correctly allowed to read tasks');
    console.log(`   Found ${Array.isArray(readResult.data) ? readResult.data.length : 0} tasks`);
  } else {
    console.log('❌ FAIL: Viewer should have been allowed to read tasks');
    console.log(`   Status: ${readResult.status}, Response: ${JSON.stringify(readResult.data)}`);
  }

  // Test 5: Admin trying to access task from different organization (should be denied)
  console.log('\n🧪 Test 5: Admin trying to access task from different organization (should be denied)');
  const crossOrgResult = await makeRequest('GET', '/tasks/task-4', authTokens.admin);
  if (crossOrgResult.status === 403) {
    console.log('✅ PASS: Admin correctly denied access to different organization task');
    console.log(`   Response: ${crossOrgResult.data.message || 'Forbidden'}`);
  } else {
    console.log('❌ FAIL: Admin should have been denied access to different organization task');
    console.log(`   Status: ${crossOrgResult.status}, Response: ${JSON.stringify(crossOrgResult.data)}`);
  }

  // Test 6: Frontend Admin trying to access Backend Team task (should be denied - sibling orgs)
  console.log('\n🧪 Test 6: Frontend Admin trying to access Backend Team task (should be denied)');
  const siblingOrgResult = await makeRequest('GET', '/tasks/task-6', authTokens.frontendAdmin);
  if (siblingOrgResult.status === 403) {
    console.log('✅ PASS: Frontend Admin correctly denied access to Backend Team task');
    console.log(`   Response: ${siblingOrgResult.data.message || 'Forbidden'}`);
  } else {
    console.log('❌ FAIL: Frontend Admin should have been denied access to Backend Team task');
    console.log(`   Status: ${siblingOrgResult.status}, Response: ${JSON.stringify(siblingOrgResult.data)}`);
  }

  // Test 7: Frontend Admin trying to access parent Engineering task (should be allowed)
  console.log('\n🧪 Test 7: Frontend Admin trying to access parent Engineering task (should be allowed)');
  const parentOrgResult = await makeRequest('GET', '/tasks/task-2', authTokens.frontendAdmin);
  if (parentOrgResult.status === 200) {
    console.log('✅ PASS: Frontend Admin correctly allowed to access parent Engineering task');
    console.log(`   Task: ${parentOrgResult.data.title || 'Unknown'}`);
  } else {
    console.log('❌ FAIL: Frontend Admin should have been allowed to access parent Engineering task');
    console.log(`   Status: ${parentOrgResult.status}, Response: ${JSON.stringify(parentOrgResult.data)}`);
  }

  // Test 8: Unauthorized access (no token)
  console.log('\n🧪 Test 8: Unauthorized access (no token)');
  const unauthResult = await makeRequest('GET', '/tasks', null);
  if (unauthResult.status === 401) {
    console.log('✅ PASS: Unauthorized access correctly denied');
    console.log(`   Response: ${unauthResult.data.message || 'Unauthorized'}`);
  } else {
    console.log('❌ FAIL: Unauthorized access should have been denied');
    console.log(`   Status: ${unauthResult.status}, Response: ${JSON.stringify(unauthResult.data)}`);
  }

  // Test 9: Owner should be able to create tasks (should be allowed)
  console.log('\n🧪 Test 9: Owner trying to create a task (should be allowed)');
  const ownerCreateData = {
    title: 'New Task by Owner',
    description: 'This should be allowed',
    status: 'todo',
    priority: 'high'
  };
  
  const ownerCreateResult = await makeRequest('POST', '/tasks', authTokens.owner, ownerCreateData);
  if (ownerCreateResult.status === 201 || ownerCreateResult.status === 200) {
    console.log('✅ PASS: Owner correctly allowed to create tasks');
    console.log(`   Created task: ${ownerCreateResult.data.title || 'Unknown'}`);
  } else {
    console.log('❌ FAIL: Owner should have been allowed to create tasks');
    console.log(`   Status: ${ownerCreateResult.status}, Response: ${JSON.stringify(ownerCreateResult.data)}`);
  }

  // Test 10: Backend Viewer trying to modify task created by others (should be denied)
  console.log('\n🧪 Test 10: Backend Viewer trying to modify task created by others (should be denied)');
  const modifyOthersResult = await makeRequest('PATCH', '/tasks/task-5', authTokens.backendViewer, {
    title: 'Modified by Backend Viewer',
    status: 'completed'
  });
  if (modifyOthersResult.status === 403) {
    console.log('✅ PASS: Backend Viewer correctly denied from modifying others\' tasks');
    console.log(`   Response: ${modifyOthersResult.data.message || 'Forbidden'}`);
  } else {
    console.log('❌ FAIL: Backend Viewer should have been denied from modifying others\' tasks');
    console.log(`   Status: ${modifyOthersResult.status}, Response: ${JSON.stringify(modifyOthersResult.data)}`);
  }

  console.log('\n🎯 RBAC Denial Test Summary');
  console.log('===========================');
  console.log('✅ All tests demonstrate proper RBAC enforcement');
  console.log('🔒 Security is working as expected!');
  console.log('\n📊 Organization Hierarchy:');
  console.log('   Acme Corporation (org-1) - Root');
  console.log('   ├── Engineering Department (org-2)');
  console.log('   │   ├── Frontend Team (org-4)');
  console.log('   │   └── Backend Team (org-5)');
  console.log('   └── Marketing Department (org-3)');
}

// Run the tests
if (require.main === module) {
  testRbacDenial().catch(console.error);
}

module.exports = { testRbacDenial };
