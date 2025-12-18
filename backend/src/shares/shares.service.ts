import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { CreateShareDto, ShareResponseDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class SharesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  async createShare(
    userId: string,
    createShareDto: CreateShareDto,
  ): Promise<ShareResponseDto> {
    const { fileId } = createShareDto;

    // Check if file exists and user owns it
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to share this file',
      );
    }

    // Check if share already exists for this file
    const existingShare = await this.prisma.share.findFirst({
      where: {
        fileId,
        ownerId: userId,
        isActive: true,
      },
    });

    if (existingShare) {
      return this.mapToResponseDto(existingShare);
    }

    // Create new share
    const token = this.generateToken();
    const share = await this.prisma.share.create({
      data: {
        fileId,
        ownerId: userId,
        token,
      },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            size: true,
            mimeType: true,
          },
        },
      },
    });

    return this.mapToResponseDto(share);
  }

  async getShareByToken(token: string): Promise<ShareResponseDto> {
    const share = await this.prisma.share.findUnique({
      where: { token },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            size: true,
            mimeType: true,
            storagePath: true,
          },
        },
      },
    });

    if (!share || !share.isActive) {
      throw new NotFoundException('Share link not found or has been deleted');
    }

    return this.mapToResponseDto(share);
  }

  async getMyShares(userId: string): Promise<ShareResponseDto[]> {
    const shares = await this.prisma.share.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            size: true,
            mimeType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return shares.map((share) => this.mapToResponseDto(share));
  }

  async deleteShare(userId: string, shareId: string): Promise<void> {
    const share = await this.prisma.share.findUnique({
      where: { id: shareId },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this share',
      );
    }

    await this.prisma.share.delete({
      where: { id: shareId },
    });
  }

  async getFileDownloadUrl(token: string): Promise<string> {
    const share = await this.prisma.share.findUnique({
      where: { token },
      include: {
        file: true,
      },
    });

    if (!share || !share.isActive) {
      throw new NotFoundException(
        'Share link not found or has been deactivated',
      );
    }

    // Generate presigned URL for download
    const url = await this.minio.getPresignedUrl(share.file.storagePath);
    return url;
  }

  private mapToResponseDto(share: {
    id: string;
    fileId: string;
    ownerId: string;
    token: string;
    isActive: boolean;
    createdAt: Date;
    file?: {
      id: string;
      name: string;
      size: number;
      mimeType: string;
      storagePath?: string;
    };
  }): ShareResponseDto {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return {
      id: share.id,
      fileId: share.fileId,
      ownerId: share.ownerId,
      token: share.token,
      isActive: share.isActive,
      createdAt: share.createdAt,
      shareUrl: `${baseUrl}/shares/${share.token}`,
      file: share.file,
    };
  }
}
