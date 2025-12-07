import { IsInt, IsOptional, IsEnum, IsString } from "class-validator";
// Use string union for ApplicationStatus rather than importing from Prisma client (pre-generator)

export class CreateApplicationDto {
  @IsInt()
  citizenId: number;

  // @IsOptional()
  // @IsInt()
  // locationId?: number;

  @IsOptional()
  application_date?: Date;

  @IsOptional()
  @IsEnum(["pending", "verified", "approved", "rejected", "closed"] as const)
  status?: "pending" | "verified" | "approved" | "rejected" | "closed";

  @IsOptional()
  @IsString()
  notes?: string;
}
