export class FileResponseDto {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  storagePath: string;
  folderId: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
