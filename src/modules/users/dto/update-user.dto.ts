import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';

type UserRole = 'admin' | 'supervisor';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['admin', 'supervisor'])
  role?: UserRole;
}
