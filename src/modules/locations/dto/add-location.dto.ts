import {
  IsJSON,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";

export class AddPreviousLocationDto {
  @IsNotEmpty()
  @IsNumberString()
  latitude: string;

  @IsNotEmpty()
  @IsNumberString()
  longitude: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  neighborhood: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  house_number?: string;

  @IsNotEmpty()
  @IsJSON()
  extraData: string;
}

export class AddCurrentLocationDto {
  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  house_number?: string;

  @IsNotEmpty()
  @IsString()
  neighborhood?: string;
}
