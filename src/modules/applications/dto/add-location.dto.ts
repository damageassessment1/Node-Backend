import { IsJSON, IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";

export class AddLocationDto {
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
  @IsJSON()
  extraData?:string
}
