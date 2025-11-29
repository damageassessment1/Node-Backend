import { IsEnum, IsOptional, IsString, IsNumber, IsInt } from "class-validator";
import { LocationType } from "@prisma/client";

export class CreateLocationDto {
  @IsInt()
  citizenId: number;

  @IsEnum(["before_war", "after_war", "temporary", "current"])
  type: LocationType | any;

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
