const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const res = await request(app)
                .get('/api/health')
                .expect(200);

            expect(res.body.status).toBe('ok');
            expect(res.body).toHaveProperty('timestamp');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'invalid@test.com', password: 'wrong' })
                .expect(401);

            expect(res.body).toHaveProperty('error');
        });

        it('should rate limit after 5 attempts', async () => {
            for (let i = 0; i < 6; i++) {
                await request(app)
                    .post('/api/auth/login')
                    .send({ email: 'test@test.com', password: 'wrong' });
            }

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'wrong' })
                .expect(429);

            expect(res.body.error).toContain('Muitas tentativas');
        });
    });

    describe('GET /api/admin/theme', () => {
        it('should return theme settings', async () => {
            const res = await request(app)
                .get('/api/admin/theme')
                .expect(200);

            expect(res.body).toHaveProperty('primary_color');
            expect(res.body).toHaveProperty('font_family');
        });
    });
});
