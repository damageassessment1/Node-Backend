import { Gender, MaritalStatus } from "@prisma/client";
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsNumberString,
} from "class-validator";



export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  father_name?: string;

  @IsOptional()
  @IsString()
  grandfather_name?: string;

  @IsOptional()
  @IsString()
  family_name?: string;

  @IsOptional()
  @IsNumber()
  family_members_number?: number;

  @IsOptional()
  @IsNumberString()
  whatsapp_number?: string;

  @IsOptional()
  @IsString()
  mother_name?: string;

  @IsOptional()
  @IsString()
  place_of_birth?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(MaritalStatus)
  marital_status?: MaritalStatus;
}
