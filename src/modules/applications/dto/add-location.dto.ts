import { IsJSON, IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";

export class AddLocationDto {
  @IsNotEmpty()
  @IsNumberString()
  latitude: number;

  @IsNotEmpty()
  @IsNumberString()
  longitude: number;

  @IsString()
  governorate?: string;

  @IsOptional()
  @IsJSON()
  extraData?:string
}
