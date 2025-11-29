import { IsOptional, IsEnum, IsString, IsInt } from "class-validator";
// Use string union for ApplicationStatus instead of importing from Prisma client

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(["pending", "verified", "approved", "rejected", "closed"] as const)
  status?: "pending" | "verified" | "approved" | "rejected" | "closed";

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  locationId?: number;
}
