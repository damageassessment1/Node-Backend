import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from "class-validator";

type UserRole = 'admin' | 'supervisor';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(['admin', 'supervisor'])
  role?: UserRole;
}
