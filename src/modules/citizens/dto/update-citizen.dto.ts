import { IsOptional, IsString } from "class-validator";

export class UpdateCitizenDto {

  @IsOptional()
  @IsString()
  national_id?: string;

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
  @IsString()
  phone_number?: string;
}
