export class RoleResponseDto {
  id: number;
  name: string;
  description?: string;
  permissions: {
    id: number;
    key: string;
  }[];
}
