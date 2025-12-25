import { IsString, IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  key: string; // user.create

  @IsString()
  description?: string;
}
