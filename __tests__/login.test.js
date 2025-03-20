const request = require('supertest');
const app = require('../server'); // Replace with the path to your Express app

describe('POST /login', () => {
  it('should return a token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/users/login') // Ensure correct API endpoint
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should return 400 for non-existent user', async () => {
    const response = await request(app)
      .post('/api/users/login') // Ensure correct API endpoint
      .send({ email: 'nonexistent@example.com', password: 'password' });

    expect(response.status).toBe(400); // Corrected to 400
  });

  it('should return 400 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/users/login') // Ensure correct API endpoint
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(400);
  });
});

