import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FolderResponseDto, CreateFolderDto } from './dto';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createFolderDto: CreateFolderDto,
  ): Promise<FolderResponseDto> {
    // Check if parent folder exists if parentId is provided
    if (createFolderDto.parentId) {
      const parentFolder = await this.prisma.folder.findFirst({
        where: { id: createFolderDto.parentId, userId },
      });
      if (!parentFolder) {
        throw new NotFoundException('Parent folder not found');
      }
    }

    // Check for duplicate folder name in the same parent
    const existingFolder = await this.prisma.folder.findFirst({
      where: {
        userId,
        name: createFolderDto.name,
        parentId: createFolderDto.parentId || null,
      },
    });

    if (existingFolder) {
      throw new ConflictException('Folder with this name already exists');
    }

    return this.prisma.folder.create({
      data: {
        name: createFolderDto.name,
        userId,
        parentId: createFolderDto.parentId || null,
      },
    });
  }

  async findAll(
    userId: string,
    parentId?: string,
  ): Promise<FolderResponseDto[]> {
    return this.prisma.folder.findMany({
      where: {
        userId,
        parentId: parentId || null,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, folderId: string): Promise<FolderResponseDto> {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  async getFolderWithContents(userId: string, folderId: string) {
    const folder = await this.findOne(userId, folderId);

    const [subfolders, files] = await Promise.all([
      this.prisma.folder.findMany({
        where: { userId, parentId: folderId },
        orderBy: { name: 'asc' },
      }),
      this.prisma.file.findMany({
        where: { userId, folderId, isDeleted: false },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      folder,
      subfolders,
      files,
    };
  }

  async rename(
    userId: string,
    folderId: string,
    newName: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.findOne(userId, folderId);

    // Check for duplicate name in same parent
    const existingFolder = await this.prisma.folder.findFirst({
      where: {
        userId,
        name: newName,
        parentId: folder.parentId,
        id: { not: folderId },
      },
    });

    if (existingFolder) {
      throw new ConflictException('Folder with this name already exists');
    }

    return this.prisma.folder.update({
      where: { id: folderId },
      data: { name: newName },
    });
  }

  async move(
    userId: string,
    folderId: string,
    newParentId?: string,
  ): Promise<FolderResponseDto> {
    const folder = await this.findOne(userId, folderId);

    // Validate new parent folder
    if (newParentId) {
      const newParent = await this.prisma.folder.findFirst({
        where: { id: newParentId, userId },
      });
      if (!newParent) {
        throw new NotFoundException('Parent folder not found');
      }

      // Check for circular reference
      if (await this.isCircularReference(folderId, newParentId)) {
        throw new BadRequestException(
          'Cannot move folder to its own subfolder',
        );
      }
    }

    // Check for duplicate name in new parent
    const existingFolder = await this.prisma.folder.findFirst({
      where: {
        userId,
        name: folder.name,
        parentId: newParentId || null,
        id: { not: folderId },
      },
    });

    if (existingFolder) {
      throw new ConflictException(
        'Folder with this name already exists in destination',
      );
    }

    return this.prisma.folder.update({
      where: { id: folderId },
      data: { parentId: newParentId || null },
    });
  }

  private async isCircularReference(
    folderId: string,
    targetParentId: string,
  ): Promise<boolean> {
    let currentId: string | null = targetParentId;

    while (currentId) {
      if (currentId === folderId) {
        return true;
      }

      const folder = await this.prisma.folder.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = folder?.parentId || null;
    }

    return false;
  }

  async delete(userId: string, folderId: string): Promise<{ message: string }> {
    await this.findOne(userId, folderId);

    // Check if folder has subfolders or files
    const [subfolderCount, fileCount] = await Promise.all([
      this.prisma.folder.count({
        where: { parentId: folderId },
      }),
      this.prisma.file.count({
        where: { folderId, isDeleted: false },
      }),
    ]);

    if (subfolderCount > 0 || fileCount > 0) {
      throw new BadRequestException(
        'Cannot delete folder with contents. Please empty it first.',
      );
    }

    await this.prisma.folder.delete({
      where: { id: folderId },
    });

    return { message: 'Folder deleted successfully' };
  }

  async getBreadcrumb(userId: string, folderId: string) {
    const breadcrumb: FolderResponseDto[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = await this.prisma.folder.findFirst({
        where: { id: currentId, userId },
      });

      if (!folder) break;

      breadcrumb.unshift(folder);
      currentId = folder.parentId;
    }

    return breadcrumb;
  }
}
