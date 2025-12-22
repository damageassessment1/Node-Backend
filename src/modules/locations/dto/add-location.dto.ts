import { IsJSON, IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";

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

  @IsNotEmpty()
  @IsJSON()
  extraData:string
}


export class AddCurrentLocationDto {
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
}
