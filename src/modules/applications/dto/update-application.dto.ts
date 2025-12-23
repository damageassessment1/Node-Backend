import { ApplicationStatus } from "@prisma/client";
import { IsOptional, IsEnum, IsString, IsInt } from "class-validator";
// Use string union for ApplicationStatus instead of importing from Prisma client

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  notes?: string;

}



