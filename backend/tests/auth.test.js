// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/db');

// Test user credentials
const testUser = {
  name: 'Test User',
  email: `testuser_${Date.now()}@test.com`,
  password: 'Test@1234',
};
let userToken = '';

afterAll(async () => {
  // Clean up test user
  await pool.query('DELETE FROM users WHERE email = ?', [testUser.email]);
  await pool.end();
});

describe('Auth API', () => {
  test('POST /api/auth/register — should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('user'); // Ensure role is user, never admin
    userToken = res.body.token;
  });

  test('POST /api/auth/register — should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register — should reject invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bad', email: 'not-an-email', password: 'Test@1234',
    });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/register — should reject short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bad', email: 'bad@test.com', password: '123',
    });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/login — should login successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email, password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    userToken = res.body.token;
  });

  test('POST /api/auth/login — should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email, password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me — should return user info with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password_hash).toBeUndefined(); // Never return password
  });

  test('GET /api/auth/me — should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
