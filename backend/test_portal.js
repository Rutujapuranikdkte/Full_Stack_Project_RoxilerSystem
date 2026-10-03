const http = require('http');

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Starting Full-Stack End-to-End API Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? '- ' + JSON.stringify(details) : ''}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('/api/health');
    assert(health.status === 200 && health.body.status === 'UP', '1. Backend health check is UP');

    // 2. Registration Validation: Name < 20 chars
    const shortNameRes = await request('/api/auth/register', 'POST', {
      name: 'John Doe',
      email: 'johndoe@test.com',
      password: 'Password@123',
      address: '123 Main St'
    });
    assert(shortNameRes.status === 400 && shortNameRes.body.errors.some(e => e.includes('20 and 60')), 
      '2. Registration rejects Name < 20 characters');

    // 3. Registration Validation: Password missing special char
    const weakPassRes = await request('/api/auth/register', 'POST', {
      name: 'Christopher David Robinson Jr',
      email: 'weakpass@test.com',
      password: 'Password123',
      address: '123 Main St'
    });
    assert(weakPassRes.status === 400 && weakPassRes.body.errors.some(e => e.includes('special character')), 
      '3. Registration rejects password missing special characters');

    // 4. Registration Validation: Password length > 16 chars
    const longPassRes = await request('/api/auth/register', 'POST', {
      name: 'Christopher David Robinson Jr',
      email: 'longpass@test.com',
      password: 'SuperLongPassword@123456789',
      address: '123 Main St'
    });
    assert(longPassRes.status === 400, '4. Registration rejects password > 16 characters');

    // 5. Valid Normal User Registration
    const validEmail = `elizabeth.montgomery.${Date.now()}@testportal.com`;
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'Elizabeth Charlotte Montgomery', // 30 chars (valid 20-60)
      email: validEmail,
      password: 'SecurePass@2026', // valid 8-16 with upper and special
      address: '742 Evergreen Terrace, Springfield, OR'
    });
    assert(regRes.status === 201 && regRes.body.token && regRes.body.user.role === 'USER', 
      '5. Normal User signs up successfully with valid fields');

    const newUserToken = regRes.body.token;

    // 6. Update Password - incorrect old password
    const badOldPassRes = await request('/api/auth/update-password', 'PUT', {
      oldPassword: 'WrongPassword@123',
      newPassword: 'NewPass@2026' // 12 characters (valid)
    }, newUserToken);
    assert(badOldPassRes.status === 400 && (badOldPassRes.body.message || '').includes('Current password does not match'),
      '6. Password update rejects incorrect current password');

    // 7. Update Password - valid update
    const validPassRes = await request('/api/auth/update-password', 'PUT', {
      oldPassword: 'SecurePass@2026',
      newPassword: 'NewPass@2026'
    }, newUserToken);
    assert(validPassRes.status === 200 && validPassRes.body.success,
      '7. Password update succeeds with valid new password');

    // 8. Admin Login
    const adminLogin = await request('/api/auth/login', 'POST', {
      email: 'admin@storerating.com',
      password: 'Admin@123'
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'ADMIN',
      '8. Admin logs in successfully via unified login system');
    const adminToken = adminLogin.body.token;

    // 9. Admin Dashboard Stats
    const adminStats = await request('/api/admin/dashboard-stats', 'GET', null, adminToken);
    assert(adminStats.status === 200 && adminStats.body.stats.totalUsers > 0 && adminStats.body.stats.totalStores > 0,
      '9. Admin retrieves platform KPI metrics (total users, stores, ratings)', adminStats.body.stats);

    // 10. Admin Add New Store
    const uniqueStoreEmail = `store.${Date.now()}@pacificcrest.com`;
    const addStoreRes = await request('/api/admin/stores', 'POST', {
      name: 'Pacific Crest Artisanal Roasters',
      email: uniqueStoreEmail,
      address: '990 Pineview Boulevard, Suite 400, Seattle, WA',
      owner_id: 2
    }, adminToken);
    assert(addStoreRes.status === 201 && addStoreRes.body.store.id,
      '10. Admin adds a new store with Name, Email, Address, and Owner assignment');
    const newStoreId = addStoreRes.body.store.id;

    // 11. Admin View Stores with Sorting by Rating
    const sortedStores = await request('/api/admin/stores?sortBy=rating&sortOrder=DESC', 'GET', null, adminToken);
    assert(sortedStores.status === 200 && Array.isArray(sortedStores.body.stores),
      '11. Admin views list of stores with sorting by Rating (ASC/DESC)');

    // 12. Admin View Users with Filter by Role
    const filteredUsers = await request('/api/admin/users?role=OWNER', 'GET', null, adminToken);
    const hasStoreRating = filteredUsers.body.users.every(u => u.role === 'OWNER' && (u.rating !== undefined));
    assert(filteredUsers.status === 200 && filteredUsers.body.users.length > 0 && hasStoreRating,
      '12. Admin views users with Role filter and Store Owner ratings displayed');

    // 13. Normal User Browse Stores
    const userStores = await request('/api/stores', 'GET', null, newUserToken);
    assert(userStores.status === 200 && userStores.body.stores.length > 0,
      '13. Normal user retrieves list of registered stores');

    // 14. Normal User Submit Rating (1-5)
    const rateStoreRes = await request('/api/ratings', 'POST', {
      storeId: newStoreId,
      rating: 5
    }, newUserToken);
    assert(rateStoreRes.status === 200 && rateStoreRes.body.rating === 5,
      '14. Normal user submits rating (5 stars) for store');

    // 15. Normal User Modify Rating to 4 stars
    const modifyRateRes = await request('/api/ratings', 'POST', {
      storeId: newStoreId,
      rating: 4
    }, newUserToken);
    assert(modifyRateRes.status === 200 && modifyRateRes.body.rating === 4 && modifyRateRes.body.message.includes('updated'),
      '15. Normal user modifies submitted rating (changed to 4 stars)');

    // 16. Store Owner Login
    const ownerLogin = await request('/api/auth/login', 'POST', {
      email: 'marcus.owner@storerating.com',
      password: 'Owner@123'
    });
    assert(ownerLogin.status === 200 && ownerLogin.body.user.role === 'OWNER',
      '16. Store Owner logs in successfully via unified login system');
    const ownerToken = ownerLogin.body.token;

    // 17. Store Owner Dashboard
    const ownerDash = await request('/api/ratings/owner-dashboard', 'GET', null, ownerToken);
    assert(ownerDash.status === 200 && ownerDash.body.hasStore === true && ownerDash.body.stats.averageRating > 0 && Array.isArray(ownerDash.body.ratings),
      '17. Store Owner dashboard displays average rating and customer ratings list', {
        avgRating: ownerDash.body.stats.averageRating,
        totalRatings: ownerDash.body.stats.totalRatings,
        ratingsCount: ownerDash.body.ratings.length
      });

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
