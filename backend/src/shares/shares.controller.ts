import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SharesService } from './shares.service';
import { CreateShareDto, ShareResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('shares')
@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a share link for a file' })
  @ApiResponse({
    status: 201,
    description: 'Share link created successfully',
    type: ShareResponseDto,
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  async createShare(
    @Req() req: { user: { id: string } },
    @Body() createShareDto: CreateShareDto,
  ) {
    return this.sharesService.createShare(req.user.id, createShareDto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all shares created by current user' })
  @ApiResponse({
    status: 200,
    description: 'List of shares',
    type: [ShareResponseDto],
  })
  async getMyShares(@Req() req: { user: { id: string } }) {
    return this.sharesService.getMyShares(req.user.id);
  }

  @Get(':token')
  @ApiOperation({ summary: 'Get share details by token (public)' })
  @ApiParam({ name: 'token', description: 'Share token' })
  @ApiResponse({
    status: 200,
    description: 'Share details',
    type: ShareResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Share not found or inactive' })
  async getShareByToken(@Param('token') token: string) {
    return this.sharesService.getShareByToken(token);
  }

  @Get(':token/download')
  @ApiOperation({ summary: 'Get download URL for shared file (public)' })
  @ApiParam({ name: 'token', description: 'Share token' })
  @ApiResponse({
    status: 200,
    description: 'Download URL',
    schema: { properties: { url: { type: 'string' } } },
  })
  @ApiResponse({ status: 404, description: 'Share not found or inactive' })
  async getDownloadUrl(@Param('token') token: string) {
    const url = await this.sharesService.getFileDownloadUrl(token);
    return { url };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a share link' })
  @ApiParam({ name: 'id', description: 'Share ID' })
  @ApiResponse({ status: 200, description: 'Share deleted successfully' })
  @ApiResponse({ status: 404, description: 'Share not found' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  async deleteShare(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    await this.sharesService.deleteShare(req.user.id, id);
    return { message: 'Share deleted successfully' };
  }
}
