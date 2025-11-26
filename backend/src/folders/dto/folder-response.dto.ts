export class FolderResponseDto {
  id: string;
  name: string;
  userId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
