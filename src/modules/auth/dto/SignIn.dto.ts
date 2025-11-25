import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from "class-validator"

export class SigninDto {
    @IsEmail()
    @IsNotEmpty()
    nationald: string;
    
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}