import { IsOptional, IsString } from "class-validator";

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
