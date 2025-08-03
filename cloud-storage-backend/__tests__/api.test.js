const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const File = require('../models/File');

describe('API Tests', () => {
    let authToken;
    let userId;

    beforeAll(async () => {
        // Clear test data
        await User.deleteMany({});
        await File.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Auth Endpoints', () => {
        test('Should register a new user', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });
            expect(res.statusCode).toBe(201);
        });

        test('Should login user', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });
            expect(res.statusCode).toBe(200);
            expect(res.body.token).toBeDefined();
            authToken = res.body.token;
        });
    });

    describe('File Endpoints', () => {
        test('Should upload a file', async () => {
            const res = await request(app)
                .post('/api/files/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', Buffer.from('test file content'), 'test.txt');
            
            expect(res.statusCode).toBe(201);
            expect(res.body.originalName).toBe('test.txt');
        });

        test('Should list files', async () => {
            const res = await request(app)
                .get('/api/files')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
        });
    });
});
