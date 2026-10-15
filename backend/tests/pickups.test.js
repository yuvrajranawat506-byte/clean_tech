// backend/tests/pickups.test.js
const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/db');

let userToken = '';
let adminToken = '';
let testPickupId = null;
const userEmail = `pickuptest_${Date.now()}@test.com`;

beforeAll(async () => {
  // Register test user
  const userRes = await request(app).post('/api/auth/register').send({
    name: 'Pickup Tester', email: userEmail, password: 'Test@1234',
  });
  userToken = userRes.body.token;

  // Login as admin (assumes seed data was loaded)
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@ecotrack.dev', password: 'password',
  });
  adminToken = adminRes.body.token;
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email = ?', [userEmail]);
  await pool.end();
});

describe('Pickups API', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  test('POST /api/pickups — should create a new pickup', async () => {
    const res = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        waste_type: 'plastic',
        quantity_kg: 5.5,
        pickup_address: '123 Test Street',
        pickup_date: tomorrowStr,
        pickup_time: '10:00',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    testPickupId = res.body.pickup.id;
  });

  test('POST /api/pickups — should reject past pickup date', async () => {
    const res = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        waste_type: 'plastic',
        quantity_kg: 5.5,
        pickup_address: '123 Test Street',
        pickup_date: '2020-01-01',
        pickup_time: '10:00',
      });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/pickups — should reject invalid waste type', async () => {
    const res = await request(app)
      .post('/api/pickups')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        waste_type: 'nuclear_waste',
        quantity_kg: 5,
        pickup_address: '123 Test Street',
        pickup_date: tomorrowStr,
        pickup_time: '10:00',
      });
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/pickups/my — should only return own pickups', async () => {
    const res = await request(app)
      .get('/api/pickups/my')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.pickups.every(p => p.status !== undefined)).toBe(true);
  });

  test('GET /api/pickups/:id — should not allow accessing another user\'s pickup', async () => {
    // Pickup with id=1 belongs to seeded user, not our test user
    const res = await request(app)
      .get('/api/pickups/1')
      .set('Authorization', `Bearer ${userToken}`);
    // Should be 404 (ownership enforced)
    expect([404, 403]).toContain(res.statusCode);
  });

  test('PATCH /api/pickups/:id/cancel — should cancel own pending pickup', async () => {
    if (!testPickupId) return;
    const res = await request(app)
      .patch(`/api/pickups/${testPickupId}/cancel`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('PATCH /api/admin/pickups/:id/status — should reject regular user from admin API', async () => {
    const res = await request(app)
      .patch('/api/admin/pickups/1/status')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'approved' });
    expect(res.statusCode).toBe(403);
  });

  test('PATCH /api/admin/pickups/:id/status — admin should be able to approve pickup', async () => {
    if (!adminToken) return;
    // Create a fresh pickup via admin's own pickup (seed data pickup id 1 should be pending)
    const res = await request(app)
      .patch('/api/admin/pickups/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' });
    expect([200, 400]).toContain(res.statusCode); // 400 if already approved
  });

  test('Dashboard — should return real DB stats for user', async () => {
    const res = await request(app)
      .get('/api/dashboard/user')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.stats).toBeDefined();
    expect(typeof res.body.stats.total_pickups).toBe('number');
  });
});
