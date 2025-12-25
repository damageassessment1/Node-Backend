import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from "class-validator";
import { IsValidRoleId } from "src/common/decorators/validators/is-valid-roleId.decorator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;


  @IsEmail()
  @IsNotEmpty()
  email: string;


  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsValidRoleId()
  roleId: number;


}
