import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../app';
import { createMockDbContext, MockDbContext } from '../prismaContext';
import { prismaMock } from '../prismaSingleton';
import createAuthRoutes from '../routes/authRoutes';
import { createJwtToken } from '../utils/jwt';

// setup mocks
jest.mock('../utils/jwt', () => ({
    createJwtToken: jest.fn()
}))
jest.mock('bcryptjs', () => ({
    compareSync: jest.fn()
}))

describe('POST /api/auth/login', () => {
    let mockContext: MockDbContext;
    beforeEach(() => {
        // create a mocke db context
        mockContext = createMockDbContext();
        // setup express app using mock context
        app.use('/api/auth', createAuthRoutes(mockContext));
    })

    it('should return 200 and a token when logging in with valid username and password', async () => {
        // Arrange
        prismaMock.user.findFirst.mockResolvedValue({
            id: 1,
            username: 'testuser',
            password: 'hashedpassword',
            email: 'test@example.com',
            account_type: 'user',
            created_at: new Date(),
            updated_at: new Date()
        });
        (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
        (createJwtToken as jest.Mock).mockReturnValue('mocked-jwt-token');

        // Act
        const res = await request(app)
            .post('/api/auth/login')
            .send({ usernameOrEmail: 'testuser', password: 'password123' });

        // Assert
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            message: 'Login successful',
            payload: { token: 'mocked-jwt-token' },
        });

        expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
            where: { username: 'testuser' },
        });
        expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedpassword');
        expect(createJwtToken).toHaveBeenCalledWith(
            1,
            'testuser',
            'test@example.com',
            'user',
        );
    })

    it('should return 200 and a token when logging in with valid username and password', async () => {
        // Arrange
        prismaMock.user.findFirst.mockResolvedValue({
            id: 1,
            username: 'testuser',
            password: 'hashedpassword',
            email: 'test@example.com',
            account_type: 'user',
            created_at: new Date(),
            updated_at: new Date()
        });
        (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
        (createJwtToken as jest.Mock).mockReturnValue('mocked-jwt-token');

        // Act
        const res = await request(app)
            .post('/api/auth/login')
            .send({ usernameOrEmail: 'test@example.com', password: 'password123' });

        // Assert
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            message: 'Login successful',
            payload: { token: 'mocked-jwt-token' },
        });

        expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
            where: { email: 'test@example.com' },
        });
        expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedpassword');
        expect(createJwtToken).toHaveBeenCalledWith(
            1,
            'testuser',
            'test@example.com',
            'user',
        );
    })

    it('should return 401 when provided with incorrect credentials', async () => {
        // Arrange
        prismaMock.user.findFirst.mockResolvedValue({
            id: 1,
            username: 'testuser',
            password: 'hashedpassword',
            email: 'test@example.com',
            account_type: 'user',
            created_at: new Date(),
            updated_at: new Date()
        });
        (bcrypt.compareSync as jest.Mock).mockReturnValue(false);
        (createJwtToken as jest.Mock).mockReturnValue('mocked-jwt-token');

        // Act
        const res = await request(app)
            .post('/api/auth/login')
            .send({ usernameOrEmail: 'testuser', password: 'wrongpassword' });

        // Assert
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            success: false,
            message: 'Invalid credentials'
        });

        expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
            where: { username: 'testuser' },
        });
        expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedpassword');
        expect(createJwtToken).toHaveBeenCalledWith(
            1,
            'testuser',
            'test@example.com',
            'user',
        );
    })

    it('should return 400 if no username or email is provided', async () => {
        // Act:
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password123' });

        // Assert
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            success: false,
            message: 'Either username or email must be provided.',
        });
    });
})
