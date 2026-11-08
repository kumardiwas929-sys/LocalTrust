import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import ProviderProfile from '../src/models/ProviderProfile.js';
import Category from '../src/models/Category.js';
import Service from '../src/models/Service.js';
import Booking from '../src/models/Booking.js';
import WorkProof from '../src/models/WorkProof.js';
import Review from '../src/models/Review.js';

describe('LocalTrust Booking & WorkProof Lifecycle Suite', () => {
  let customerToken = '';
  let providerToken = '';
  let providerProfileId = '';
  let serviceId = '';
  let bookingId = '';

  before(async () => {
    await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/localtrust_test');

    // Create test customer
    const custRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Workflow Customer',
        email: `workflow_cust_${Date.now()}@example.com`,
        password: 'Password@123',
        role: 'customer',
      });
    customerToken = custRes.body.data.accessToken;

    // Create test provider
    const provRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Workflow Master Provider',
        email: `workflow_prov_${Date.now()}@example.com`,
        password: 'Password@123',
        role: 'provider',
      });
    providerToken = provRes.body.data.accessToken;

    const meProv = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${providerToken}`);
    providerProfileId = meProv.body.data.providerProfile._id;

    // Create category
    const cat = await Category.create({
      name: `Test Cat ${Date.now()}`,
      slug: `test-cat-${Date.now()}`,
      icon: 'Zap',
    });

    // Create service
    const sRes = await request(app)
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        name: 'Pro Switchboard Repair',
        description: 'Complete replacement and safety check for household electrical boards.',
        categoryId: cat._id,
        pricingType: 'fixed',
        basePrice: 500,
        inspectionFee: 100,
        serviceAreas: ['Test City'],
      });
    serviceId = sRes.body.data._id;
  });

  after(async () => {
    if (bookingId) {
      await WorkProof.deleteMany({ bookingId });
      await Review.deleteMany({ bookingId });
      await Booking.findByIdAndDelete(bookingId);
    }
    if (serviceId) await Service.findByIdAndDelete(serviceId);
    await User.deleteMany({ email: /workflow_.*@example\.com/ });
    await mongoose.connection.close();
  });

  test('Customer creates a new booking', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        serviceId,
        scheduledDate: new Date().toISOString(),
        timeSlot: '10:00 AM - 12:00 PM',
        address: {
          street: '123 Test Boulevard',
          city: 'Test City',
          state: 'Test State',
          postalCode: '100001',
        },
        notes: 'Doorbell switch is sparking.',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'pending');
    assert.strictEqual(res.body.data.pricingBreakdown.totalAmount, 600); // 100 inspection + 500 base
    bookingId = res.body.data._id;
  });

  test('Provider accepts booking', async () => {
    const res = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/accept`)
      .set('Authorization', `Bearer ${providerToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'accepted');
  });

  test('Reject invalid transition: cannot jump directly from accepted to completed', async () => {
    const res = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/arrived`)
      .set('Authorization', `Bearer ${providerToken}`);

    // Arrived without starting journey first is disallowed
    assert.strictEqual(res.status, 500); // Or 400 with invalid transition error message
    assert.ok(res.body.message.includes('Invalid status transition'));
  });

  test('Progress through valid statuses: start journey -> arrived -> start work', async () => {
    // 1. Start journey
    const r1 = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/start-journey`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({ latitude: 28.61, longitude: 77.20 });
    assert.strictEqual(r1.body.data.status, 'on_the_way');

    // 2. Mark arrived
    const r2 = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/arrived`)
      .set('Authorization', `Bearer ${providerToken}`);
    assert.strictEqual(r2.body.data.status, 'arrived');

    // 3. Start work
    const r3 = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/start-work`)
      .set('Authorization', `Bearer ${providerToken}`);
    assert.strictEqual(r3.body.data.status, 'in_progress');
  });

  test('Provider submits WorkProof', async () => {
    const res = await request(app)
      .post(`/api/v1/workproof/${bookingId}`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        beforePhotos: ['https://example.com/before.jpg'],
        afterPhotos: ['https://example.com/after.jpg'],
        workDescription: 'Replaced broken switch and tightened terminal connection.',
        labourCost: 500,
        materialCost: 150,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'pending_review');
    assert.strictEqual(res.body.data.finalAmount, 750); // 100 insp + 500 labour + 150 material
  });

  test('Customer approves WorkProof and completes booking', async () => {
    const res = await request(app)
      .patch(`/api/v1/workproof/${bookingId}/approve`)
      .set('Authorization', `Bearer ${customerToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.booking.status, 'completed');
  });

  test('Customer submits verified review and prevents duplicate', async () => {
    const r1 = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        bookingId,
        rating: 5,
        comment: 'Great work and quick arrival time!',
      });
    assert.strictEqual(r1.status, 201);
    assert.strictEqual(r1.body.data.isVerifiedBooking, true);

    // Duplicate review should be rejected with 409 Conflict
    const r2 = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        bookingId,
        rating: 4,
        comment: 'Trying to post again...',
      });
    assert.strictEqual(r2.status, 409);
  });
});
