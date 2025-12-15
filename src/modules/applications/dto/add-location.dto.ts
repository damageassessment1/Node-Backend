import { IsJSON, IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";

export class AddLocationDto {
  @IsNotEmpty()
  @IsNumberString()
  latitude: number;

  @IsNotEmpty()
  @IsNumberString()
  longitude: number;


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
