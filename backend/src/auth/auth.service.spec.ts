import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  // MOCK OBJECTS - These are FAKE services, not real database!
  // No PostgreSQL connection needed for tests
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(), // Fake function we control
      create: jest.fn(), // Fake function we control
    },
  };

  const mockJwtService = {
    sign: jest.fn(), // Fake JWT signing
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService, // Real service we're testing
        {
          provide: PrismaService,
          useValue: mockPrismaService, // Use FAKE Prisma instead of real one
        },
        {
          provide: JwtService,
          useValue: mockJwtService, // Use FAKE JWT instead of real one
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      const mockUser = {
        id: '1',
        email: registerDto.email,
        fullName: registerDto.fullName,
        avatar: null,
        createdAt: new Date(),
      };

      // Tell the FAKE database what to return
      mockPrismaService.user.findUnique.mockResolvedValue(null); // No existing user
      mockPrismaService.user.create.mockResolvedValue(mockUser); // Return this fake user

      const result = await service.register(registerDto);

      expect(result.user).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10),
        fullName: 'Test User',
        avatar: null,
        usedStorage: 0,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid userId', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        fullName: 'Test User',
        avatar: null,
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(userId);

      expect(result).toEqual(mockUser);
    });
  });
});
