import { IsOptional, IsString, IsNumber, IsNotEmpty } from "class-validator";

export class UpdateApplicationLocationDto {
  @IsOptional()
  @IsString()
  governorate?: string;

  @IsOptional()
  @IsString()
  town?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  block_number?: string;

  @IsOptional()
  @IsString()
  house_number?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}


