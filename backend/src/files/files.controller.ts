import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { FileResponseDto, RenameFileDto, MoveFileDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @UploadedFile() file: any,
    @Body('folderId') folderId?: string,
  ): Promise<FileResponseDto> {
    return this.filesService.uploadFile(req.user.id, file, folderId);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('folderId') folderId?: string,
  ): Promise<FileResponseDto[]> {
    return this.filesService.findAll(req.user.id, folderId);
  }

  @Get('recent')
  async getRecentFiles(
    @Request() req,
    @Query('limit') limit?: number,
  ): Promise<FileResponseDto[]> {
    return this.filesService.getRecentFiles(req.user.id, limit);
  }

  @Get('trash')
  async getTrash(@Request() req): Promise<FileResponseDto[]> {
    return this.filesService.findAll(req.user.id, undefined, true);
  }

  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<FileResponseDto> {
    return this.filesService.findOne(req.user.id, id);
  }

  @Get(':id/download')
  async downloadFile(
    @Request() req,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.filesService.findOne(req.user.id, id);
    const buffer = await this.filesService.downloadFile(req.user.id, id);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.name}"`,
      'Content-Length': file.size,
    });

    return new StreamableFile(buffer);
  }

  @Patch(':id/rename')
  async renameFile(
    @Request() req,
    @Param('id') id: string,
    @Body() renameFileDto: RenameFileDto,
  ): Promise<FileResponseDto> {
    return this.filesService.renameFile(req.user.id, id, renameFileDto.name);
  }

  @Patch(':id/move')
  async moveFile(
    @Request() req,
    @Param('id') id: string,
    @Body() moveFileDto: MoveFileDto,
  ): Promise<FileResponseDto> {
    return this.filesService.moveFile(req.user.id, id, moveFileDto.folderId);
  }

  @Delete(':id')
  async moveToTrash(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.filesService.moveToTrash(req.user.id, id);
  }

  @Post(':id/restore')
  async restoreFile(
    @Request() req,
    @Param('id') id: string,
  ): Promise<FileResponseDto> {
    return this.filesService.restoreFile(req.user.id, id);
  }

  @Delete(':id/permanent')
  async deleteFilePermanently(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.filesService.deleteFilePermanently(req.user.id, id);
  }
}
