import { LocationType } from "@prisma/client";
import { IsOptional, IsString, IsNumber, IsEnum } from "class-validator";

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  address?: string;

 
  @IsOptional()
  @IsString()
  neighborhood: string;

  @IsOptional()
  @IsEnum(LocationType)
  type?:LocationType

  @IsOptional()
  @IsString()
  latitude?: number;

  @IsOptional()
  @IsString()
  longitude?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
