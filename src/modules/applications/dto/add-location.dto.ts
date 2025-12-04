import { IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";

export class AddLocationDto{
  @IsNotEmpty()
  @IsNumberString()
  latitude: number;

  @IsNotEmpty()
  @IsNumberString()
  longitude: number;


  @IsString()
  governorate?: string;
}
