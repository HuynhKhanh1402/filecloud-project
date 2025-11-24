export class UserResponseDto {
  id: string;
  email: string;
  fullName: string | null;
  avatar: string | null;
  usedStorage: number;
  createdAt: Date;
  updatedAt: Date;
}
