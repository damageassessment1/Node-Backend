import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCitizenDto {
  @IsNotEmpty()
  @IsString()
  national_id: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  family_name?: string;

  @IsOptional()
  @IsString()
  password?: string;

  // supervisorId intentionally removed. Supervision handled via users (role=supervisor)
}
