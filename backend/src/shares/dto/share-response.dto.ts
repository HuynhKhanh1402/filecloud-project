import { ApiProperty } from '@nestjs/swagger';

class FileInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  mimeType: string;
}

export class ShareResponseDto {
  @ApiProperty({ description: 'Share ID' })
  id: string;

  @ApiProperty({ description: 'File ID' })
  fileId: string;

  @ApiProperty({ description: 'Owner user ID' })
  ownerId: string;

  @ApiProperty({ description: 'Unique share token' })
  token: string;

  @ApiProperty({ description: 'Whether the share is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Full shareable URL' })
  shareUrl: string;

  @ApiProperty({
    description: 'File information',
    required: false,
    type: FileInfo,
  })
  file?: {
    id: string;
    name: string;
    size: number;
    mimeType: string;
  };
}
