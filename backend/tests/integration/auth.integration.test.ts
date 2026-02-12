import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

let mongoServer: MongoMemoryServer;
let app: Awaited<typeof import('../../src/app.js')>['default'];

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI!);
  const mod = await import('../../src/app.js');
  app = mod.default;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/auth/register', () => {
  it('crée un utilisateur et retourne 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nouveau@example.com', password: 'motdepasse123' });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('nouveau@example.com');
    expect(res.body.user.role).toBe('user');
  });
});
