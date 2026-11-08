import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

describe('LocalTrust Authentication & RBAC Suite', () => {
  before(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/localtrust_test');
    await User.deleteMany({ email: /test.*@example\.com/ });
  });

  after(async () => {
    await User.deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.close();
  });

  const testUser = {
    name: 'Test Customer',
    email: `test_user_${Date.now()}@example.com`,
    password: 'Password@123',
    role: 'customer',
    phone: '+91 99999 11111',
  };

  let accessToken = '';

  test('POST /api/v1/auth/register should register new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, testUser.email.toLowerCase());
    assert.ok(res.body.data.accessToken);
    accessToken = res.body.data.accessToken;
  });

  test('POST /api/v1/auth/register should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/v1/auth/login should log in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.accessToken);
    accessToken = res.body.data.accessToken;
  });

  test('POST /api/v1/auth/login should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('GET /api/v1/auth/me should return authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, testUser.email.toLowerCase());
  });

  test('GET /api/v1/admin/dashboard should reject customer with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${accessToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('GET /health should return 200 healthy status', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
  });
});
