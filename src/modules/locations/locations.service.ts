import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";
import { locationSelect } from "src/common/prisma/selects";

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLocationDto, user: any) {
    // Only admin can create a location
    if (user?.role !== "admin")
      throw new ForbiddenException("Insufficient permissions");

    // Validate request & ensure citizen exists
    const citizenId = (dto as any).citizenId;
    if (!citizenId) throw new BadRequestException("citizenId is required");
    const citizen = await this.prisma.citizen.findUnique({
      where: { id: citizenId },
    });
    if (!citizen) throw new NotFoundException("Citizen not found");

    const loc = await this.prisma.location.create({
      data: {
        citizenId: citizenId,
        type: dto.type as any,
        governorate: dto.governorate ?? null,
        town: dto.town ?? null,
        street: dto.street ?? null,
        block_number: dto.block_number ?? null,
        house_number: dto.house_number ?? null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        notes: dto.notes ?? null,
      },
      select: locationSelect,
    });
    return loc;
  }

  async findAll(user: any) {
    // Both admin and supervisor can read locations
    return this.prisma.location.findMany({
      select: locationSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number, user: any) {
    if (!id || typeof id !== "number" || isNaN(id))
      throw new BadRequestException("Valid numeric id param is required");
    const loc = await this.prisma.location.findUnique({
      where: { id },
      select: locationSelect,
    });
    if (!loc) throw new NotFoundException("Location not found");
    return loc;
  }

  async update(id: number, dto: UpdateLocationDto, user: any) {
    if (!id || typeof id !== "number" || isNaN(id))
      throw new BadRequestException("Valid numeric id param is required");
    if (user?.role !== "admin")
      throw new ForbiddenException("Insufficient permissions");
    const existing = await this.prisma.location.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Location not found");
    const updated = await this.prisma.location.update({
      where: { id },
      data: dto,
      select: locationSelect,
    });
    return updated;
  }

  async remove(id: number, user: any) {
    if (!id || typeof id !== "number" || isNaN(id))
      throw new BadRequestException("Valid numeric id param is required");
    if (user?.role !== "admin")
      throw new ForbiddenException("Insufficient permissions");
    const existing = await this.prisma.location.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Location not found");
    // Unlink application if any
    if (existing.applicationId) {
      await this.prisma.location
        .update({ where: { id }, data: { applicationId: null } })
        .catch(() => {});
    }
    await this.prisma.location.delete({ where: { id } });
    return { success: true };
  }
}
