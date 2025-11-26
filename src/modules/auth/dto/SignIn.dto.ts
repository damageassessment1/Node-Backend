import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from "class-validator"

type UserRole = 'admin' | 'supervisor';

export class SigninDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsEnum(['admin', 'supervisor'])
    role?: UserRole;
}