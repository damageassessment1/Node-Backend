import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsNumberString,
  IsInt,
  IsOptional,
} from "class-validator";
import { LocationType } from "@prisma/client";

export class CreateLocationDto {
  @IsInt()
  citizenId: number;

  @IsNotEmpty()
  @IsNumberString()
  latitude: number;

  @IsNotEmpty()
  @IsNumberString()
  longitude: number;

  @IsOptional()
  @IsString()
  neighborhood: string;

  @IsOptional()
  @IsEnum(LocationType)
  type: LocationType | any;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  notes?: string;
}
