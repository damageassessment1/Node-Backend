import { IsOptional, IsString } from "class-validator";

export class UpdateCitizenDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  family_name?: string;
}
