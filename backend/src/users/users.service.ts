import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, UserResponseDto, UserStatsDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        usedStorage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        usedStorage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getStats(userId: string): Promise<UserStatsDto> {
    const [totalFiles, totalFolders, user] = await Promise.all([
      this.prisma.file.count({
        where: { userId, isDeleted: false },
      }),
      this.prisma.folder.count({
        where: { userId },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { usedStorage: true },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      totalFiles,
      totalFolders,
      usedStorage: user.usedStorage,
      maxStorage: 10 * 1024 * 1024 * 1024, // 10 GB in bytes
    };
  }

  async removeAvatar(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
    });

    return { message: 'Avatar removed successfully' };
  }
}
