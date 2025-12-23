import { IsString, IsNotEmpty, IsNumberString, IsJSON, IsOptional } from "class-validator";
// Use string union for ApplicationStatus instead of importing from Prisma client

export class CitizenUpdateApplicationDto {

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
  neighborhood?: string;

  @IsOptional()
  @IsJSON()
  extraData?: string;
}
