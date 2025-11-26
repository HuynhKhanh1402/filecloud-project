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
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import {
  FolderResponseDto,
  CreateFolderDto,
  RenameFolderDto,
  MoveFolderDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  async create(
    @Request() req,
    @Body() createFolderDto: CreateFolderDto,
  ): Promise<FolderResponseDto> {
    return this.foldersService.create(req.user.id, createFolderDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('parentId') parentId?: string,
  ): Promise<FolderResponseDto[]> {
    return this.foldersService.findAll(req.user.id, parentId);
  }

  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<FolderResponseDto> {
    return this.foldersService.findOne(req.user.id, id);
  }

  @Get(':id/contents')
  async getFolderWithContents(@Request() req, @Param('id') id: string) {
    return this.foldersService.getFolderWithContents(req.user.id, id);
  }

  @Get(':id/breadcrumb')
  async getBreadcrumb(@Request() req, @Param('id') id: string) {
    return this.foldersService.getBreadcrumb(req.user.id, id);
  }

  @Patch(':id/rename')
  async rename(
    @Request() req,
    @Param('id') id: string,
    @Body() renameFolderDto: RenameFolderDto,
  ): Promise<FolderResponseDto> {
    return this.foldersService.rename(req.user.id, id, renameFolderDto.name);
  }

  @Patch(':id/move')
  async move(
    @Request() req,
    @Param('id') id: string,
    @Body() moveFolderDto: MoveFolderDto,
  ): Promise<FolderResponseDto> {
    return this.foldersService.move(req.user.id, id, moveFolderDto.parentId);
  }

  @Delete(':id')
  async delete(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.foldersService.delete(req.user.id, id);
  }
}
