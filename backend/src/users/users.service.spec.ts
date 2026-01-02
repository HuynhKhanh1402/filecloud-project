import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let minioService: MinioService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    file: {
      count: jest.fn(),
    },
    folder: {
      count: jest.fn(),
    },
  };

  const mockMinioService = {
    getPresignedUrl: jest.fn(),
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    minioService = module.get<MinioService>(MinioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return user data', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        fullName: 'Test User',
        avatar: null,
        usedStorage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      const userId = '1';
      const mockStats = {
        totalFiles: 10,
        totalFolders: 5,
        usedStorage: 1024000,
      };

      mockPrismaService.file.count.mockResolvedValue(mockStats.totalFiles);
      mockPrismaService.folder.count.mockResolvedValue(mockStats.totalFolders);
      mockPrismaService.user.findUnique.mockResolvedValue({
        usedStorage: mockStats.usedStorage,
      });

      const result = await service.getStats(userId);

      expect(result.totalFiles).toBe(mockStats.totalFiles);
      expect(result.totalFolders).toBe(mockStats.totalFolders);
      expect(result.usedStorage).toBe(mockStats.usedStorage);
      expect(result.maxStorage).toBe(10 * 1024 * 1024 * 1024);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const userId = '1';
      const updateDto = { fullName: 'Updated Name' };
      const mockUpdatedUser = {
        id: userId,
        email: 'test@example.com',
        fullName: updateDto.fullName,
        avatar: null,
        usedStorage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateProfile(userId, updateDto);

      expect(result.fullName).toBe(updateDto.fullName);
    });
  });
});
