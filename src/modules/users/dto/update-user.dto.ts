import { IsEmail, IsOptional, IsString } from "class-validator";
import { IsValidRoleId } from "src/common/decorators/validators/is-valid-roleId.decorator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;


  @IsOptional()
  @IsEmail()
  email?: string;


  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsValidRoleId()
  roleId?: number;
}
