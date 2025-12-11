import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsNumberString,
  IsInt,
} from "class-validator";
import { LocationType } from "@prisma/client";

export class CreateLocationDto {
  @IsNotEmpty()
  @IsNumberString()
  latitude: number;

  @IsNotEmpty()
  @IsNumberString()
  longitude: number;

  @IsEnum(["before_war", "after_war", "temporary", "current"])
  type: LocationType | any;

  @IsString()
  governorate?: string;

  @IsInt()
  citizenId: number;

  @IsString()
  notes?: string;
}
