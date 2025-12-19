import { ApplicationStatus } from "@prisma/client";
import { IsInt, IsOptional, IsEnum, IsString } from "class-validator";
// Use string union for ApplicationStatus rather than importing from Prisma client (pre-generator)

export class CreateApplicationDto {
  @IsInt()
  citizenId: number;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?:ApplicationStatus 

  @IsOptional()
  @IsString()
  notes?: string;
}
